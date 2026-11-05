"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { User } from "@/models/User";
import { VerificationCode } from "@/models/VerificationCode";
import { Lead } from "@/models/Lead";
import { Message } from "@/models/Message";
import { AutomationConfig } from "@/models/AutomationConfig";
import { AutomationLog } from "@/models/AutomationLog";
import { AuditLog } from "@/models/AuditLog";
import { getSession, setSessionCookie, hashPassword } from "@/lib/auth";
import { sendOwnershipTransferEmail } from "@/lib/mail";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";
import { WorkspaceSummary } from "@/types";

export async function getWorkspaceSettings() {
  try {
    await dbConnect();
    const session = await getSession();
    if (session?.role === "agent") {
      return {
        success: false,
        error: "Access Denied: Only workspace administrators can view or modify workspace credentials.",
      };
    }
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    let workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      await Workspace.create({
        _id: workspaceId,
        name: "My Company Workspace",
        ownerEmail: session?.email || "admin@convodeck.com",
        contactEmail: session?.email || "",
        whatsappPhoneNumber: "",
        whatsappPhoneNumberId: "",
        whatsappBusinessAccountId: "",
        whatsappAccessToken: "",
        webhookVerifyToken: "convodeck_secure_token",
      });
      workspace = await Workspace.findById(workspaceId).lean();
    }

    return workspace ? JSON.parse(JSON.stringify(workspace)) : null;
  } catch (error) {
    console.error("Error fetching workspace settings:", error);
    return null;
  }
}

export async function updateWorkspaceSettings(formData: {
  name: string;
  contactEmail?: string;
  whatsappPhoneNumber?: string;
  whatsappPhoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  whatsappAccessToken?: string;
  webhookVerifyToken?: string;
}) {
  try {
    await dbConnect();
    const session = await getSession();
    if (session?.role === "agent") {
      return {
        success: false,
        error: "Access Denied: Only workspace administrators can modify settings.",
      };
    }
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    const updateFields: Record<string, unknown> = {
      name: formData.name.trim(),
    };

    if (formData.contactEmail !== undefined) {
      updateFields.contactEmail = formData.contactEmail.trim().toLowerCase();
    }
    if (formData.whatsappPhoneNumber !== undefined) {
      updateFields.whatsappPhoneNumber = formData.whatsappPhoneNumber.trim();
    }
    if (formData.whatsappPhoneNumberId !== undefined) {
      updateFields.whatsappPhoneNumberId = formData.whatsappPhoneNumberId.trim();
    }
    if (formData.whatsappBusinessAccountId !== undefined) {
      updateFields.whatsappBusinessAccountId = formData.whatsappBusinessAccountId.trim();
    }
    if (formData.whatsappAccessToken !== undefined) {
      updateFields.whatsappAccessToken = formData.whatsappAccessToken.trim();
    }
    if (formData.webhookVerifyToken !== undefined) {
      updateFields.webhookVerifyToken = formData.webhookVerifyToken.trim() || "convodeck_secure_token";
    }

    const updated = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $set: updateFields },
      { new: true, upsert: true }
    );

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return {
      success: true,
      workspace: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    return { success: false, error: msg };
  }
}

/**
 * Transfers primary ownership of the active workspace to another email address.
 * Follows SaaS industry standards:
 * - If recipient exists: transfers ownership immediately and sends notification with login link.
 * - If recipient is new: transfers ownership, generates secure 1-click password setup token,
 *   and emails them a direct link to choose their password and enter the workspace.
 */
export async function transferWorkspaceOwnership(targetEmail: string) {
  try {
    const cleanEmail = (targetEmail || "").toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return {
        success: false,
        error: "Please enter a valid recipient email address.",
      };
    }

    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return {
        success: false,
        error: "Only workspace administrators can transfer workspace ownership.",
      };
    }

    const workspaceId = session.workspaceId || DEFAULT_WORKSPACE_ID;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return { success: false, error: "Workspace not found." };
    }

    const currentOwner = (workspace.ownerEmail || "").toLowerCase().trim();
    if (currentOwner === cleanEmail) {
      return {
        success: false,
        error: "This workspace is already owned by this email address.",
      };
    }

    // Determine application base URL
    const headerList = await headers();
    const host = headerList.get("host") || "localhost:3000";
    const proto = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${proto}://${host}`;

    // Persist new owner email on Workspace
    workspace.ownerEmail = cleanEmail;
    await workspace.save();

    // Check if recipient already has an existing account in ConvoDeck
    const targetUser = await User.findOne({ email: cleanEmail });

    if (targetUser) {
      // Existing user: ensure admin role
      targetUser.role = "admin";
      targetUser.status = "active";
      await targetUser.save();

      // Send transactional notification email
      await sendOwnershipTransferEmail({
        to: cleanEmail,
        workspaceName: workspace.name,
        senderName: session.name || "Administrator",
        actionUrl: `${baseUrl}/login`,
        hasExistingAccount: true,
      });

      revalidatePath("/settings");
      revalidatePath("/dashboard");
      revalidatePath("/team");

      return {
        success: true,
        newOwnerEmail: cleanEmail,
        hasExistingAccount: true,
        message: `Ownership transferred to ${cleanEmail}. They can sign in with their existing credentials.`,
      };
    }

    // New recipient: Generate secure 1-click password setup token (valid 7 days)
    const token = crypto.randomBytes(32).toString("hex");

    await VerificationCode.deleteMany({ email: cleanEmail, type: "ownership_invite" });
    await VerificationCode.create({
      email: cleanEmail,
      code: token,
      type: "ownership_invite",
      payload: JSON.stringify({
        workspaceId: workspace._id.toString(),
        workspaceName: workspace.name,
      }),
      attempts: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send 1-click invitation email
    const setupUrl = `${baseUrl}/accept-ownership?token=${token}`;
    await sendOwnershipTransferEmail({
      to: cleanEmail,
      workspaceName: workspace.name,
      senderName: session.name || "Administrator",
      actionUrl: setupUrl,
      hasExistingAccount: false,
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/team");

    return {
      success: true,
      newOwnerEmail: cleanEmail,
      hasExistingAccount: false,
      message: `Ownership invitation sent to ${cleanEmail}. They received a 1-click link to set their password.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to transfer ownership";
    console.error("transferWorkspaceOwnership error:", error);
    return { success: false, error: msg };
  }
}

/**
 * Validates an ownership invitation token and returns details for the setup screen.
 */
export async function getOwnershipInviteDetails(token: string) {
  try {
    const cleanToken = (token || "").trim();
    if (!cleanToken) {
      return { success: false, error: "Invalid invitation token." };
    }

    await dbConnect();
    const record = await VerificationCode.findOne({
      code: cleanToken,
      type: "ownership_invite",
    });

    if (!record) {
      return {
        success: false,
        error: "Invitation link is invalid or has already been used.",
      };
    }

    if (new Date() > record.expiresAt) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "This invitation link has expired. Please request a new invite from the owner.",
      };
    }

    const payload = JSON.parse(record.payload || "{}");

    return {
      success: true,
      email: record.email,
      workspaceName: payload.workspaceName || "Workspace",
      workspaceId: payload.workspaceId || "",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load invitation";
    return { success: false, error: msg };
  }
}

/**
 * Completes the 1-click ownership onboarding flow:
 * Sets the new owner's chosen password, establishes their session,
 * and enters them directly into their new workspace.
 */
export async function completeOwnershipInvite(data: {
  token: string;
  name: string;
  password: string;
}) {
  try {
    const { token, name, password } = data;
    const cleanToken = (token || "").trim();
    const cleanName = (name || "").trim();

    if (!cleanName) {
      return { success: false, error: "Please enter your name." };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long.",
      };
    }

    await dbConnect();
    const record = await VerificationCode.findOne({
      code: cleanToken,
      type: "ownership_invite",
    });

    if (!record) {
      return {
        success: false,
        error: "Invitation link is invalid or has already been used.",
      };
    }

    if (new Date() > record.expiresAt) {
      await VerificationCode.findByIdAndDelete(record._id);
      return {
        success: false,
        error: "This invitation link has expired.",
      };
    }

    const payload = JSON.parse(record.payload || "{}");
    const cleanEmail = record.email.toLowerCase().trim();
    const hashedPassword = hashPassword(password);

    // Find or create User document
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      user.name = cleanName;
      user.password = hashedPassword;
      user.role = "admin";
      user.status = "active";
      if (payload.workspaceId) {
        user.workspaceId = payload.workspaceId;
      }
      await user.save();
    } else {
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        workspaceId: payload.workspaceId,
      });
    }

    // Set secure stateless HMAC session cookie
    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      tokenVersion: user.tokenVersion || 0,
    });

    // Cleanup used token
    await VerificationCode.findByIdAndDelete(record._id);

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to activate account";
    console.error("completeOwnershipInvite error:", error);
    return { success: false, error: msg };
  }
}

/**
 * Retrieves all workspaces accessible to the currently authenticated user.
 * Workspaces where the user is owner or currently assigned.
 */
export async function getUserWorkspaces(): Promise<WorkspaceSummary[]> {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) return [];

    const cleanEmail = session.email.toLowerCase().trim();

    // Query all workspaces owned by user or currently assigned
    const queryConditions: Array<Record<string, unknown>> = [{ ownerEmail: cleanEmail }];
    if (session.workspaceId) {
      queryConditions.push({ _id: session.workspaceId });
    }

    const rawWorkspaces = await Workspace.find({
      $or: queryConditions,
    }).sort({ createdAt: 1 }).lean();

    // Map and deduplicate by id
    const seenIds = new Set<string>();
    const list: WorkspaceSummary[] = [];

    for (const ws of rawWorkspaces) {
      const wsId = ws._id.toString();
      if (seenIds.has(wsId)) continue;
      seenIds.add(wsId);

      const isOwner = (ws.ownerEmail || "").toLowerCase() === cleanEmail;
      list.push({
        id: wsId,
        name: ws.name || "Untitled Workspace",
        plan: ws.plan || "trial",
        planStatus: ws.planStatus || "trial",
        isCurrent: wsId === session.workspaceId,
        role: isOwner ? "Owner" : session.role || "Member",
        ownerEmail: ws.ownerEmail,
      });
    }

    return list;
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    return [];
  }
}

/**
 * Switches the active workspace in the user's secure HTTP-only session cookie.
 * Updates both the session cookie and the user's active workspace record in DB.
 */
export async function switchActiveWorkspace(targetWorkspaceId: string) {
  try {
    if (!targetWorkspaceId) {
      return { success: false, error: "Target workspace ID is required." };
    }

    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    const cleanEmail = session.email.toLowerCase().trim();

    const targetWorkspace = await Workspace.findById(targetWorkspaceId).lean();
    if (!targetWorkspace) {
      return { success: false, error: "Target workspace not found." };
    }

    // Permission enforcement
    const isOwner = (targetWorkspace.ownerEmail || "").toLowerCase() === cleanEmail;
    const isCurrentlyAssigned = session.workspaceId === targetWorkspaceId;

    if (!isOwner && !isCurrentlyAssigned && session.role !== "admin") {
      return { success: false, error: "Access denied to this workspace." };
    }

    // If user is the designated owner of this workspace, ensure active role is "admin"
    const activeRole = isOwner ? "admin" : session.role;

    // Update session cookie with the new workspaceId & role
    await setSessionCookie({
      ...session,
      workspaceId: targetWorkspace._id.toString(),
      role: activeRole,
    });

    // Also persist active workspace on User document
    await User.findByIdAndUpdate(session.userId, {
      workspaceId: targetWorkspace._id.toString(),
      role: activeRole,
    });

    // Revalidate all workspace-scoped paths
    revalidatePath("/dashboard");
    revalidatePath("/agent/dashboard");
    revalidatePath("/chat");
    revalidatePath("/pipeline");
    revalidatePath("/automations");
    revalidatePath("/team");
    revalidatePath("/billing");
    revalidatePath("/settings");
    revalidatePath("/profile");

    return {
      success: true,
      workspaceId: targetWorkspace._id.toString(),
      workspaceName: targetWorkspace.name,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to switch workspace";
    console.error("switchActiveWorkspace error:", error);
    return { success: false, error: msg };
  }
}

/**
 * Creates a brand-new workspace owned by the current administrator
 * and immediately switches the user's active session to it.
 */
export async function createNewWorkspace(workspaceName: string) {
  try {
    const cleanName = workspaceName.trim();
    if (!cleanName || cleanName.length < 2) {
      return {
        success: false,
        error: "Workspace name must be at least 2 characters.",
      };
    }

    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return {
        success: false,
        error: "Only administrators can create additional workspaces.",
      };
    }

    const cleanEmail = session.email.toLowerCase().trim();

    // Create the new Workspace document
    const newWorkspace = await Workspace.create({
      name: cleanName,
      ownerEmail: cleanEmail,
      contactEmail: cleanEmail,
      plan: "trial",
      planStatus: "trial",
      webhookVerifyToken: `cd_${Math.random().toString(36).substring(2, 12)}`,
    });

    const newWorkspaceId = newWorkspace._id.toString();

    // Immediately switch session to the new workspace
    await setSessionCookie({
      ...session,
      workspaceId: newWorkspaceId,
    });

    await User.findByIdAndUpdate(session.userId, {
      workspaceId: newWorkspaceId,
    });

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/chat");
    revalidatePath("/pipeline");
    revalidatePath("/automations");
    revalidatePath("/team");
    revalidatePath("/billing");
    revalidatePath("/settings");

    return {
      success: true,
      workspaceId: newWorkspaceId,
      workspaceName: newWorkspace.name,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create workspace";
    console.error("createNewWorkspace error:", error);
    return { success: false, error: msg };
  }
}

/**
 * Permanently deletes a workspace and all its scoped data (leads, messages, automations, logs, agent accounts).
 * Requires the authenticated user to be the workspace owner.
 * If the user has multiple workspaces, switches active session to a remaining workspace.
 * Prevents deletion if the user has only 1 workspace.
 */
export async function deleteWorkspace(workspaceIdToDelete?: string) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return {
        success: false,
        error: "Only workspace administrators can delete a workspace.",
      };
    }

    const cleanEmail = session.email.toLowerCase().trim();
    const targetWorkspaceId = workspaceIdToDelete || session.workspaceId;

    if (!targetWorkspaceId) {
      return { success: false, error: "Workspace ID is required." };
    }

    const targetWorkspace = await Workspace.findById(targetWorkspaceId).lean();
    if (!targetWorkspace) {
      return { success: false, error: "Workspace not found." };
    }

    // Verify ownership
    const isOwner = (targetWorkspace.ownerEmail || "").toLowerCase() === cleanEmail;
    if (!isOwner) {
      return {
        success: false,
        error: "Permission denied: Only the workspace owner can delete this workspace.",
      };
    }

    // Check how many workspaces the user has
    const userWorkspaces = await Workspace.find({
      $or: [{ ownerEmail: cleanEmail }, { _id: session.workspaceId }],
    }).lean();

    if (userWorkspaces.length <= 1) {
      return {
        success: false,
        error: "You cannot delete your only workspace. Please create another workspace first before deleting this one.",
      };
    }

    // Find a remaining workspace to switch into
    const remainingWorkspace = userWorkspaces.find(
      (ws) => ws._id.toString() !== targetWorkspaceId
    );

    if (!remainingWorkspace) {
      return {
        success: false,
        error: "Could not find an alternative workspace to switch to.",
      };
    }

    const nextWorkspaceId = remainingWorkspace._id.toString();

    // 1. Delete all workspace-scoped leads & messages
    await Lead.deleteMany({ workspaceId: targetWorkspaceId });
    await Message.deleteMany({ workspaceId: targetWorkspaceId });

    // 2. Delete all workspace automations and logs
    await AutomationConfig.deleteMany({ workspaceId: targetWorkspaceId });
    await AutomationLog.deleteMany({ workspaceId: targetWorkspaceId });
    await AuditLog.deleteMany({ workspaceId: targetWorkspaceId });

    // 3. Delete team agents belonging to this workspace (do not delete the owner!)
    await User.deleteMany({ workspaceId: targetWorkspaceId, role: "agent" });

    // 4. Delete the workspace document
    await Workspace.findByIdAndDelete(targetWorkspaceId);

    // 5. Update session cookie and user record to point to remaining workspace
    const remainingIsOwner = (remainingWorkspace.ownerEmail || "").toLowerCase() === cleanEmail;
    const nextRole = remainingIsOwner ? "admin" : "member";

    await setSessionCookie({
      ...session,
      workspaceId: nextWorkspaceId,
      role: nextRole,
    });

    await User.findByIdAndUpdate(session.userId, {
      workspaceId: nextWorkspaceId,
      role: nextRole,
    });

    // 6. Revalidate all workspace-scoped paths
    revalidatePath("/dashboard");
    revalidatePath("/chat");
    revalidatePath("/pipeline");
    revalidatePath("/automations");
    revalidatePath("/team");
    revalidatePath("/billing");
    revalidatePath("/settings");
    revalidatePath("/profile");

    return {
      success: true,
      nextWorkspaceId,
      nextWorkspaceName: remainingWorkspace.name,
      message: `Workspace "${targetWorkspace.name}" was permanently deleted.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete workspace";
    console.error("deleteWorkspace error:", error);
    return { success: false, error: msg };
  }
}
