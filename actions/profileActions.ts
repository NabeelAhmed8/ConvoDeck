"use server";

import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import {
  getSession,
  setSessionCookie,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

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
