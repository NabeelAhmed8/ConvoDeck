"use server";

import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Workspace } from "@/models/Workspace";
import { VerificationCode } from "@/models/VerificationCode";
import { AuditLog } from "@/models/AuditLog";
import {
  getSession,
  setSessionCookie,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "@/lib/mail";

export interface UpdateProfileParams {
  name: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Update the logged-in user's personal profile (Name & Phone).
 * Also updates the active session cookie so the UI reflects the new name instantly.
 */
export async function updateUserProfile(params: UpdateProfileParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const trimmedName = params.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters long." };
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    user.name = trimmedName;
    if (params.phone !== undefined) {
      user.phone = params.phone.trim();
    }
    if (params.avatar !== undefined) {
      user.avatar = params.avatar;
    }
    await user.save();

    // Refresh active session cookie with updated name
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      tokenVersion: user.tokenVersion || 0,
    });

    // Record in Audit Trail
    await AuditLog.create({
      workspaceId: user.workspaceId,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "PROFILE_UPDATED",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `User ${user.name} updated their personal profile information`,
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update profile";
    console.error("updateUserProfile error:", error);
    return { success: false, error: msg };
  }
}

/**
 * Change the logged-in user's password securely.
 * Verifies current password before hashing the new password.
 */
export async function changeUserPassword(params: ChangePasswordParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const { currentPassword, newPassword, confirmPassword } = params;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match." };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        error: "New password cannot be identical to your current password.",
      };
    }

    await dbConnect();
    // Retrieve user with password field explicitly selected
    const user = await User.findById(session.userId).select("+password");
    if (!user || !user.password) {
      return { success: false, error: "User account or password not found." };
    }

    const isCurrentValid = verifyPassword(currentPassword, user.password);
    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHashedPassword = hashPassword(newPassword);
    user.password = newHashedPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Re-issue fresh session cookie so current user stays authenticated
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      tokenVersion: user.tokenVersion,
    });

    // Record in Audit Trail
    await AuditLog.create({
      workspaceId: user.workspaceId,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "PASSWORD_CHANGED",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `User ${user.name} changed their account password`,
    });

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to change password";
    console.error("changeUserPassword error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 1. Initiates Email Change Flow
 * Sends a 6-digit OTP code to the user's CURRENT existing email address.
 */
export async function sendEmailChangeCode() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const currentEmail = user.email.toLowerCase().trim();
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any pending email change code for this email
    await VerificationCode.deleteMany({
      email: currentEmail,
      type: "change_email",
    });

    await VerificationCode.create({
      email: currentEmail,
      code,
      type: "change_email",
      payload: JSON.stringify({ userId: user._id.toString(), verified: false }),
      attempts: 0,
      expiresAt,
    });

    const emailResult = await sendVerificationEmail({
      to: currentEmail,
      code,
      type: "change_email",
      recipientName: user.name,
    });

    if (!emailResult.success) {
      console.warn("sendEmailChangeCode warning:", emailResult.error);
    }

    return {
      success: true,
      currentEmail,
      previewUrl: emailResult.previewUrl || undefined,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to send verification code";
    console.error("sendEmailChangeCode error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 2. Verifies the 6-digit OTP code sent to the existing email.
 * Marks the verification session as verified/authorized to change email.
 */
export async function verifyEmailChangeCode({ code }: { code: string }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      return {
        success: false,
        error: "Please enter the complete 6-digit verification code.",
      };
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const currentEmail = user.email.toLowerCase().trim();
    const record = await VerificationCode.findOne({
      email: currentEmail,
      type: "change_email",
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
        error: "Too many failed attempts. Please request a new code.",
      };
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      await record.save();
      return {
        success: false,
        error: `Incorrect code. ${5 - record.attempts} attempts remaining.`,
      };
    }

    // Code is valid! Mark verified in payload
    record.payload = JSON.stringify({
      userId: user._id.toString(),
      verified: true,
      verifiedAt: Date.now(),
    });
    // Extend expiry by 15 minutes to allow entering the new email
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await record.save();

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    console.error("verifyEmailChangeCode error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 3. Sets the verified new email address on the User and Workspace.
 * Verifies that the existing email's OTP was verified before allowing the change.
 */
export async function updateUserEmail({ newEmail }: { newEmail: string }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (!cleanNewEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNewEmail)) {
      return {
        success: false,
        error: "Please enter a valid new email address.",
      };
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const currentEmail = user.email.toLowerCase().trim();
    if (cleanNewEmail === currentEmail) {
      return {
        success: false,
        error: "New email must be different from your current email.",
      };
    }

    // Security Check: Must have a verified authorization record
    const record = await VerificationCode.findOne({
      email: currentEmail,
      type: "change_email",
    });

    if (!record) {
      return {
        success: false,
        error:
          "Unauthorized action. Please verify the code sent to your current email first.",
      };
    }

    const payload = JSON.parse(record.payload || "{}");
    if (!payload.verified || payload.userId !== user._id.toString()) {
      return {
        success: false,
        error:
          "Verification required. Please verify the code sent to your current email first.",
      };
    }

    // Check if new email is already taken by another user
    const existing = await User.findOne({ email: cleanNewEmail });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    const oldEmail = user.email;
    user.email = cleanNewEmail;
    await user.save();

    // If workspace owner, update ownerEmail on Workspace
    if (user.role === "admin" && user.workspaceId) {
      await Workspace.findByIdAndUpdate(user.workspaceId, {
        ownerEmail: cleanNewEmail,
      });
    }

    // Clean up verification record
    await VerificationCode.findByIdAndDelete(record._id);

    // Refresh active session cookie with the new email
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      tokenVersion: user.tokenVersion || 0,
    });

    // Record in Audit Trail
    await AuditLog.create({
      workspaceId: user.workspaceId,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: cleanNewEmail,
      actorRole: user.role,
      action: "PROFILE_UPDATED",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `User ${user.name} changed email from ${oldEmail} to ${cleanNewEmail}`,
    });

    return { success: true, email: cleanNewEmail };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update email";
    console.error("updateUserEmail error:", error);
    return { success: false, error: msg };
  }
}
