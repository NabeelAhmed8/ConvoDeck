"use server";

import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Workspace } from "@/models/Workspace";
import { VerificationCode } from "@/models/VerificationCode";
import { AuditLog } from "@/models/AuditLog";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  getSession,
  clearSessionCookie,
} from "@/lib/auth";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "@/lib/mail";

// 1. User & Workspace Registration (Initiates Email Verification Code)
export async function signupUser(formData: {
  name: string;
  companyName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  try {
    const { name, companyName, email, password, phone } = formData;

    if (!name || !email || !password || !companyName) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    const cleanEmail = email.toLowerCase().trim();

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password for secure temporary storage
    const hashedPassword = hashPassword(password);

    // Generate 6-digit OTP code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save pending verification record (delete any previous pending code for this email)
    await VerificationCode.deleteMany({ email: cleanEmail, type: "signup" });

    await VerificationCode.create({
      email: cleanEmail,
      code,
      type: "signup",
      payload: JSON.stringify({
        name: name.trim(),
        companyName: companyName.trim(),
        passwordHash: hashedPassword,
        phone: phone ? phone.trim() : "",
      }),
      attempts: 0,
      expiresAt,
    });

    // Send verification code to user's desired email address via Nodemailer
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      code,
      type: "signup",
      recipientName: name.trim(),
    });

    if (!emailResult.success) {
      console.warn("Email sending warning:", emailResult.error);
    }

    return {
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      previewUrl: emailResult.previewUrl || undefined,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Signup failed";
    console.error("Signup Error:", error);
    return { success: false, error: msg };
  }
}

// 2. Verify Signup OTP Code & Complete Workspace Creation
export async function verifySignupCode(params: {
  email: string;
  code: string;
}) {
  try {
    const { email, code } = params;
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: "Email and verification code are required" };
    }

    await dbConnect();

    const record = await VerificationCode.findOne({
      email: cleanEmail,
      type: "signup",
    });

    if (!record) {
      return {
        success: false,
        error: "Verification code expired or not found. Please request a new code.",
      };
    }

    if (new Date() > record.expiresAt) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    if (record.attempts >= 5) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "Too many failed attempts. Please restart signup.",
      };
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      await record.save();
      return {
        success: false,
        error: `Incorrect verification code. ${5 - record.attempts} attempts remaining.`,
      };
    }

    // Code is valid! Parse payload and create Workspace & User
    const payload = JSON.parse(record.payload || "{}");
    const { name, companyName, passwordHash, phone } = payload;

    if (!name || !companyName || !passwordHash) {
      return { success: false, error: "Signup session expired. Please try again." };
    }

    // Create real Workspace
    const workspace = await Workspace.create({
      name: companyName,
      ownerEmail: cleanEmail,
      webhookVerifyToken: `cd_${Math.random().toString(36).substring(2, 12)}`,
    });

    // Create User
    const user = await User.create({
      name,
      email: cleanEmail,
      phone: phone ? phone.trim() : "",
      password: passwordHash,
      role: "admin",
      workspaceId: workspace._id.toString(),
    });

    // Set secure stateless HMAC session cookie
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: workspace._id.toString(),
    });

    // Cleanup used verification code
    await VerificationCode.findByIdAndDelete(record._id);

    return { success: true };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Verification failed";
    console.error("Verify Signup Error:", error);
    return { success: false, error: msg };
  }
}

// 3. User Login (Initiates 2FA Verification Code to Email)
export async function loginUser(formData: {
  email: string;
  password: string;
  portal?: "workspace" | "agent";
}) {
  try {
    const { email, password, portal = "workspace" } = formData;

    if (!email || !password) {
      return { success: false, error: "Please provide both email and password" };
    }

    const cleanEmail = email.toLowerCase().trim();

    await dbConnect();

    // Find user including password field
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password" };
    }

    // RBAC & Offboarding check
    if (user.status === "suspended" || user.status === "deactivated") {
      return {
        success: false,
        error: "Your agent account has been deactivated by the workspace administrator. Access revoked.",
      };
    }

    // Verify hashed password
    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password" };
    }

    // Role-based Portal Enforcement:
    // 1. Workspace Login is strictly for Admins. Sales Agents MUST sign in through the Agent Portal.
    if (portal === "workspace" && user.role === "agent") {
      return {
        success: false,
        error: "Invalid login to agent portal",
        suggestedPortal: "agent",
      };
    }

    // 2. Agent Portal is strictly for Sales Agents. Admins MUST sign in through Workspace Login.
    if (portal === "agent" && user.role === "admin") {
      return {
        success: false,
        error: "Invalid agent account. Workspace admins must sign in through Workspace Login.",
        suggestedPortal: "workspace",
      };
    }

    // Credentials are correct! Generate 6-digit login verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old pending login code for this user
    await VerificationCode.deleteMany({ email: cleanEmail, type: "login" });

    await VerificationCode.create({
      email: cleanEmail,
      code,
      type: "login",
      attempts: 0,
      expiresAt,
    });

    // Send login verification code to user's registered email via Nodemailer
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      code,
      type: "login",
      recipientName: user.name,
    });

    if (!emailResult.success) {
      console.warn("Login email sending warning:", emailResult.error);
    }

    return {
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      previewUrl: emailResult.previewUrl || undefined,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    console.error("Login Error:", error);
    return { success: false, error: msg };
  }
}

// 4. Verify Login OTP Code & Establish Session
export async function verifyLoginCode(params: {
  email: string;
  code: string;
  portal?: "workspace" | "agent";
}) {
  try {
    const { email, code, portal = "workspace" } = params;
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: "Email and verification code are required" };
    }

    await dbConnect();

    const record = await VerificationCode.findOne({
      email: cleanEmail,
      type: "login",
    });

    if (!record) {
      return {
        success: false,
        error: "Verification code expired or not found. Please log in again.",
      };
    }

    if (new Date() > record.expiresAt) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "Verification code has expired. Please log in again.",
      };
    }

    if (record.attempts >= 5) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "Too many failed attempts. Please log in again.",
      };
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      await record.save();
      return {
        success: false,
        error: `Incorrect verification code. ${5 - record.attempts} attempts remaining.`,
      };
    }

    // Code is valid! Retrieve user details
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return { success: false, error: "User account not found" };
    }

    // Role-based Portal Enforcement on 2FA
    if (portal === "workspace" && user.role === "agent") {
      return {
        success: false,
        error: "Invalid login to agent portal",
      };
    }

    if (portal === "agent" && user.role === "admin") {
      return {
        success: false,
        error: "Invalid agent account. Workspace admins must sign in through Workspace Login.",
      };
    }

    if (user.status === "suspended" || user.status === "deactivated") {
      return {
        success: false,
        error: "Your agent account has been deactivated by the administrator.",
      };
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Set secure session cookie with tokenVersion for instant revocation support
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      tokenVersion: user.tokenVersion || 0,
    });

    // Record login in Audit Trail
    await AuditLog.create({
      workspaceId: user.workspaceId,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "AGENT_LOGIN",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `Agent ${user.name} logged in successfully`,
    });

    // Cleanup verification code
    await VerificationCode.findByIdAndDelete(record._id);

    return { success: true, role: user.role };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    console.error("Verify Login Error:", error);
    return { success: false, error: msg };
  }
}

// 5. Resend Verification Code (Signup or Login)
export async function resendVerificationCode(params: {
  email: string;
  type: "signup" | "login";
}) {
  try {
    const { email, type } = params;
    const cleanEmail = email.toLowerCase().trim();

    await dbConnect();

    const existingRecord = await VerificationCode.findOne({
      email: cleanEmail,
      type,
    });

    if (!existingRecord) {
      return {
        success: false,
        error: "No active verification request found. Please start over.",
      };
    }

    // Rate-limit resend: don't allow resending within 30 seconds of creation
    const now = Date.now();
    const createdAtTime = new Date(existingRecord.createdAt).getTime();
    if (now - createdAtTime < 30 * 1000) {
      const waitSeconds = Math.ceil((30 * 1000 - (now - createdAtTime)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another code.`,
      };
    }

    const newCode = generateVerificationCode();
    existingRecord.code = newCode;
    existingRecord.attempts = 0;
    existingRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existingRecord.save();

    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      code: newCode,
      type,
    });

    return {
      success: true,
      previewUrl: emailResult.previewUrl || undefined,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to resend code";
    return { success: false, error: msg };
  }
}

// 6. User Logout (Session End & JWT Token Invalidation)
export async function logoutUser() {
  try {
    const session = await getSession();
    if (session?.userId) {
      await dbConnect();
      // Increment tokenVersion on the user document to invalidate any existing JWT tokens
      await User.findByIdAndUpdate(session.userId, {
        $inc: { tokenVersion: 1 },
      });
    }
  } catch (err) {
    console.error("Error revoking session on logout:", err);
  }

  // Clear HTTP-only JWT session cookie
  await clearSessionCookie();

  // Redirect to login page
  redirect("/login");
}

// 7. Get Current Logged-in User & Workspace (Enforces RBAC & Active Status)
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;

    await dbConnect();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      await clearSessionCookie();
      return null;
    }

    // RBAC & Offboarding Check:
    // If account has been deactivated or suspended by admin, force-logout immediately
    if (user.status === "suspended" || user.status === "deactivated") {
      await clearSessionCookie();
      return null;
    }

    // Force-logout check: If admin revoked session (tokenVersion bumped)
    if (
      user.tokenVersion !== undefined &&
      session.tokenVersion !== undefined &&
      user.tokenVersion !== session.tokenVersion
    ) {
      await clearSessionCookie();
      return null;
    }

    const workspace = await Workspace.findById(session.workspaceId).lean();

    return {
      user: JSON.parse(JSON.stringify(user)),
      workspace: workspace ? JSON.parse(JSON.stringify(workspace)) : null,
    };
  } catch {
    return null;
  }
}
