"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Workspace } from "@/models/Workspace";
import { AuditLog } from "@/models/AuditLog";
import { hashPassword, getSession } from "@/lib/auth";
import { sendAgentWelcomeEmail } from "@/lib/mail";
import { IUser, IAuditLog, UserRole, UserStatus } from "@/types";

const DEFAULT_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

// 1. Get all team agents for the current workspace
export async function getTeamMembers(): Promise<{
  success: boolean;
  members?: IUser[];
  error?: string;
}> {
  try {
    await dbConnect();
    const session = await getSession();
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    const users = await User.find({ workspaceId })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      members: JSON.parse(JSON.stringify(users)),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load team members";
    return { success: false, error: msg };
  }
}

// 2. Create a new team agent with unique credentials & role (Admin Only)
export async function createTeamAgent(formData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; member?: IUser; previewUrl?: string | false; error?: string }> {
  try {
    const { name, email, password, role } = formData;

    if (!name || !email || !password || !role) {
      return { success: false, error: "Name, email, password, and role are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Temporary password must be at least 6 characters" };
    }

    await dbConnect();
    const session = await getSession();

    // Enforce Admin RBAC: Only Admin or Workspace Owner can add team members
    if (session?.role !== "admin") {
      return { success: false, error: "Only workspace administrators can add team members" };
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return { success: false, error: "A team member with this email already exists" };
    }

    const workspace = await Workspace.findById(session.workspaceId);
    const workspaceName = workspace?.name || "ConvoDeck Workspace";

    // Hash the agent's unique password
    const hashedPassword = hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
      status: "active",
      tokenVersion: 0,
      workspaceId: session.workspaceId,
      createdBy: session.userId,
    });

    // Send Welcome Email with credentials via Nodemailer pointing to dedicated Agent Login Portal
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const emailResult = await sendAgentWelcomeEmail({
      to: cleanEmail,
      agentName: name.trim(),
      role,
      workspaceName,
      temporaryPassword: password,
      loginUrl: `${appUrl}/agent/login?email=${encodeURIComponent(cleanEmail)}`,
    });

    // Audit Trail: Record that Admin added a new agent
    await AuditLog.create({
      workspaceId: session.workspaceId,
      actorId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      actorRole: session.role,
      action: "CREATED_AGENT",
      targetType: "agent",
      targetId: newUser._id.toString(),
      targetName: newUser.name,
      details: `Added new ${role.toUpperCase()} agent: ${name.trim()} (${cleanEmail})`,
    });

    revalidatePath("/team");
    revalidatePath("/settings");

    return {
      success: true,
      member: JSON.parse(JSON.stringify(newUser)),
      previewUrl: emailResult.previewUrl || undefined,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create agent";
    console.error("Create Agent Error:", error);
    return { success: false, error: msg };
  }
}

// 3. Deactivate or Reactivate an Agent (Instant Access Revocation)
export async function toggleAgentStatus(params: {
  agentId: string;
  newStatus: UserStatus;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { agentId, newStatus } = params;
    await dbConnect();
    const session = await getSession();

    if (session?.role !== "admin") {
      return { success: false, error: "Only administrators can change agent status" };
    }

    if (session.userId === agentId && newStatus === "suspended") {
      return { success: false, error: "You cannot deactivate your own administrator account" };
    }

    const user = await User.findById(agentId);
    if (!user) {
      return { success: false, error: "Agent not found" };
    }

    user.status = newStatus;
    // Increment tokenVersion: If deactivated, any current active session for this agent is invalidated immediately
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Audit Trail Record
    await AuditLog.create({
      workspaceId: session.workspaceId,
      actorId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      actorRole: session.role,
      action: newStatus === "suspended" ? "DEACTIVATED_AGENT" : "ACTIVATED_AGENT",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `${newStatus === "suspended" ? "Deactivated and revoked access for" : "Re-activated"} agent ${user.name} (${user.email})`,
    });

    revalidatePath("/team");
    revalidatePath("/settings");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update agent status";
    return { success: false, error: msg };
  }
}

// 4. Force Logout / Revoke Active Session
export async function revokeAgentSession(agentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await dbConnect();
    const session = await getSession();

    if (session?.role !== "admin") {
      return { success: false, error: "Only administrators can revoke agent sessions" };
    }

    const user = await User.findById(agentId);
    if (!user) {
      return { success: false, error: "Agent not found" };
    }

    // Incrementing tokenVersion invalidates current cookie on the agent's next request
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Audit Trail Record
    await AuditLog.create({
      workspaceId: session.workspaceId,
      actorId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      actorRole: session.role,
      action: "REVOKED_ACCESS",
      targetType: "agent",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `Force logged-out and revoked active sessions for agent ${user.name} (${user.email})`,
    });

    revalidatePath("/team");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to revoke session";
    return { success: false, error: msg };
  }
}

// 5. Delete an Agent
export async function deleteTeamAgent(agentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await dbConnect();
    const session = await getSession();

    if (session?.role !== "admin") {
      return { success: false, error: "Only administrators can delete agents" };
    }

    if (session.userId === agentId) {
      return { success: false, error: "You cannot delete your own account" };
    }

    const user = await User.findById(agentId);
    if (!user) {
      return { success: false, error: "Agent not found" };
    }

    await User.findByIdAndDelete(agentId);

    // Audit Trail Record
    await AuditLog.create({
      workspaceId: session.workspaceId,
      actorId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      actorRole: session.role,
      action: "DEACTIVATED_AGENT",
      targetType: "agent",
      targetId: agentId,
      targetName: user.name,
      details: `Permanently removed agent account: ${user.name} (${user.email})`,
    });

    revalidatePath("/team");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete agent";
    return { success: false, error: msg };
  }
}

// 6. Get Workspace Audit Trail Logs
export async function getWorkspaceAuditLogs(limitCount = 60): Promise<{
  success: boolean;
  logs?: IAuditLog[];
  error?: string;
}> {
  try {
    await dbConnect();
    const session = await getSession();
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    const logs = await AuditLog.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(limitCount)
      .lean();

    return {
      success: true,
      logs: JSON.parse(JSON.stringify(logs)),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch audit logs";
    return { success: false, error: msg };
  }
}
