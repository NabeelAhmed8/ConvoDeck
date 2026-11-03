"use server";

import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { VerificationCode } from "@/models/VerificationCode";
import { AuditLog } from "@/models/AuditLog";
import { hashPassword } from "@/lib/auth";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "@/lib/mail";
import {
  sendPhoneResetOtp,
  normalizePhoneNumber,
} from "@/lib/phoneOtp";

export type ResetMethod = "email" | "phone";

interface RequestResetParams {
  identifier: string;
  method: ResetMethod;
}

interface VerifyResetCodeParams {
  identifier: string;
  code: string;
}

interface ResetPasswordParams {
  identifier: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 1. Request Password Reset (Dispatches 6-digit code via Email or Phone)
 */
export async function requestPasswordReset({
  identifier,
  method,
}: RequestResetParams) {
  try {
    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        error: method === "email" ? "Email is required" : "Phone number is required",
      };
    }

    await dbConnect();

    let cleanIdentifier = "";
    let user = null;

    if (method === "email") {
      cleanIdentifier = identifier.toLowerCase().trim();
      user = await User.findOne({ email: cleanIdentifier });
    } else {
      cleanIdentifier = normalizePhoneNumber(identifier);
      if (cleanIdentifier.length < 8) {
        return {
          success: false,
          error: "Please enter a valid phone number with country code.",
        };
      }
      // Match user by phone number
      user = await User.findOne({
        phone: { $regex: cleanIdentifier.slice(-10) },
      });
    }

    if (!user) {
      return {
        success: false,
        error:
          method === "email"
            ? "No account found with this email address."
            : "No account found with this phone number. Try resetting with your registered email.",
      };
    }

    if (user.status === "suspended" || user.status === "deactivated") {
      return {
        success: false,
        error: "This account has been deactivated. Please contact your workspace administrator.",
      };
    }

    // Generate 6-digit OTP code & 10-minute expiry
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any old pending reset codes for this identifier
    await VerificationCode.deleteMany({
      email: cleanIdentifier,
      type: "reset_password",
    });

    await VerificationCode.create({
      email: cleanIdentifier,
      code,
      type: "reset_password",
      payload: JSON.stringify({
        userId: user._id.toString(),
        method,
      }),
      attempts: 0,
      expiresAt,
    });

    let previewUrl: string | undefined;
    let devCode: string | undefined;

    if (method === "email") {
      const emailResult = await sendVerificationEmail({
        to: cleanIdentifier,
        code,
        type: "reset_password",
        recipientName: user.name,
      });

      if (!emailResult.success) {
        console.warn("Password reset email sending warning:", emailResult.error);
      }
      previewUrl = emailResult.previewUrl || undefined;
    } else {
      const phoneResult = await sendPhoneResetOtp({
        phone: cleanIdentifier,
        code,
        recipientName: user.name,
      });

      if (!phoneResult.success) {
        return {
          success: false,
          error: phoneResult.error || "Failed to send verification SMS/WhatsApp.",
        };
      }
      devCode = phoneResult.devCode;
    }

    return {
      success: true,
      identifier: cleanIdentifier,
      method,
      previewUrl,
      devCode,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to process request";
    console.error("requestPasswordReset Error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 2. Verify Password Reset OTP Code
 */
export async function verifyPasswordResetCode({
  identifier,
  code,
}: VerifyResetCodeParams) {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanId || !cleanCode) {
      return { success: false, error: "Identifier and verification code are required" };
    }

    await dbConnect();

    const record = await VerificationCode.findOne({
      email: cleanId,
      type: "reset_password",
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
        error: "Too many failed attempts. Please request a new verification code.",
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

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    console.error("verifyPasswordResetCode Error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 3. Complete Password Reset & Invalidate Old Sessions
 */
export async function resetPassword({
  identifier,
  code,
  newPassword,
  confirmPassword,
}: ResetPasswordParams) {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters long.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match. Please verify both fields.",
      };
    }

    await dbConnect();

    const record = await VerificationCode.findOne({
      email: cleanId,
      type: "reset_password",
    });

    if (!record || record.code !== cleanCode) {
      return {
        success: false,
        error: "Session expired or code invalid. Please restart the reset process.",
      };
    }

    const payload = JSON.parse(record.payload || "{}");
    const userId = payload.userId;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({
        $or: [{ email: cleanId }, { phone: cleanId }],
      });
    }

    if (!user) {
      return { success: false, error: "User account not found." };
    }

    // Hash new password and invalidate active tokens
    user.password = hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Log the security event in AuditLog if workspaceId exists
    if (user.workspaceId) {
      await AuditLog.create({
        workspaceId: user.workspaceId,
        actorId: user._id.toString(),
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        action: "REVOKED_ACCESS",
        targetType: "agent",
        targetId: user._id.toString(),
        targetName: user.name,
        details: `Password reset successfully via ${payload.method || "recovery"}. All existing sessions invalidated.`,
      });
    }

    // Delete used verification code
    await VerificationCode.findByIdAndDelete(record._id);

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Password reset failed";
    console.error("resetPassword Error:", error);
    return { success: false, error: msg };
  }
}

/**
 * 4. Resend Password Reset Code with 30s Cooldown
 */
export async function resendPasswordResetCode({
  identifier,
  method,
}: RequestResetParams) {
  try {
    const cleanId =
      method === "email"
        ? identifier.toLowerCase().trim()
        : normalizePhoneNumber(identifier);

    await dbConnect();

    const existingRecord = await VerificationCode.findOne({
      email: cleanId,
      type: "reset_password",
    });

    if (!existingRecord) {
      return {
        success: false,
        error: "No active password reset request found. Please start over.",
      };
    }

    // Rate-limit resends: 30 seconds
    const now = Date.now();
    const createdAtTime = new Date(existingRecord.createdAt).getTime();
    if (now - createdAtTime < 30 * 1000) {
      const waitSeconds = Math.ceil((30 * 1000 - (now - createdAtTime)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds}s before requesting a new code.`,
      };
    }

    const newCode = generateVerificationCode();
    existingRecord.code = newCode;
    existingRecord.attempts = 0;
    existingRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existingRecord.save();

    let previewUrl: string | undefined;
    let devCode: string | undefined;

    if (method === "email") {
      const emailResult = await sendVerificationEmail({
        to: cleanId,
        code: newCode,
        type: "reset_password",
      });
      previewUrl = emailResult.previewUrl || undefined;
    } else {
      const phoneResult = await sendPhoneResetOtp({
        phone: cleanId,
        code: newCode,
      });
      devCode = phoneResult.devCode;
    }

    return {
      success: true,
      previewUrl,
      devCode,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to resend code";
    return { success: false, error: msg };
  }
}

