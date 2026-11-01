"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { getSession } from "@/lib/auth";

const DEFAULT_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

export async function getWorkspaceSettings() {
  try {
    await dbConnect();
    const session = await getSession();
    if (session?.role === "agent") {
      return {
        success: false,
        error: "Access Denied: Only workspace administrators can modify WhatsApp credentials.",
      };
    }
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    let workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      await Workspace.create({
        _id: workspaceId,
        name: "My Company Workspace",
        ownerEmail: session?.email || "admin@convodeck.com",
        whatsappPhoneNumber: "+92 300 1234567",
        whatsappPhoneNumberId: "108492019482910",
        whatsappBusinessAccountId: "293847561029384",
        whatsappAccessToken: "EAAGm0PX4ZC_dummy_verified_token_convodeck",
        webhookVerifyToken: "convodeck_secure_token",
      });
      workspace = await Workspace.findById(workspaceId).lean();
    } else if (!workspace.whatsappPhoneNumber) {
      // Ensure dummy line is set
      await Workspace.findByIdAndUpdate(workspaceId, {
        $set: {
          whatsappPhoneNumber: "+92 300 1234567",
          whatsappPhoneNumberId: workspace.whatsappPhoneNumberId || "108492019482910",
          whatsappBusinessAccountId: workspace.whatsappBusinessAccountId || "293847561029384",
          whatsappAccessToken: workspace.whatsappAccessToken || "EAAGm0PX4ZC_dummy_verified_token_convodeck",
        },
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
  whatsappPhoneNumber?: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  webhookVerifyToken: string;
}) {
  try {
    await dbConnect();
    const session = await getSession();
    if (session?.role === "agent") {
      return {
        success: false,
        error: "Access Denied: Only workspace administrators can modify WhatsApp credentials.",
      };
    }
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    const updated = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          name: formData.name.trim(),
          whatsappPhoneNumber: formData.whatsappPhoneNumber?.trim() || "+92 300 1234567",
          whatsappPhoneNumberId: formData.whatsappPhoneNumberId.trim(),
          whatsappBusinessAccountId: formData.whatsappBusinessAccountId.trim(),
          whatsappAccessToken: formData.whatsappAccessToken.trim(),
          webhookVerifyToken: formData.webhookVerifyToken.trim() || "convodeck_secure_token",
        },
      },
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
