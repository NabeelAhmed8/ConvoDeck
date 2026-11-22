"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { getSession } from "@/lib/auth";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";

export interface IMetaVerificationResult {
  success: boolean;
  verifiedName?: string;
  displayPhoneNumber?: string;
  qualityRating?: string;
  error?: string;
}

// 1. Verify Meta Graph API Credentials directly with Meta servers
export async function verifyMetaCredentials(params: {
  phoneNumberId: string;
  accessToken: string;
}): Promise<IMetaVerificationResult> {
  const session = await getSession();
  if (!session || !session.userId) {
    return { success: false, error: "Authentication required." };
  }

  const { phoneNumberId, accessToken } = params;

  const cleanPhoneId = phoneNumberId.trim();
  const cleanToken = accessToken.trim();

  if (!cleanPhoneId || !cleanToken) {
    return {
      success: false,
      error: "Phone Number ID and System Access Token are required for verification.",
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${cleanPhoneId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cleanToken}` },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data.error?.message ||
        data.error?.error_user_msg ||
        "Meta API rejected the credentials. Please verify your token and Phone Number ID.";
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      verifiedName: data.verified_name || "Official WhatsApp Business",
      displayPhoneNumber: data.display_phone_number || "",
      qualityRating: data.quality_rating || "GREEN",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error verifying credentials";
    return { success: false, error: msg };
  }
}

// 2. Save Meta Cloud API configuration to Workspace
export async function saveMetaApiConfig(formData: {
  whatsappPhoneNumber: string;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  webhookVerifyToken: string;
}) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return { success: false, error: "Access Denied: Only administrators can modify API credentials." };
    }

    const workspaceId = session.workspaceId || DEFAULT_WORKSPACE_ID;

    await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          whatsappPhoneNumber: formData.whatsappPhoneNumber.trim(),
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

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save configuration";
    return { success: false, error: msg };
  }
}

// 3. Disconnect WhatsApp Line from Workspace
export async function disconnectWhatsAppLine(): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return { success: false, error: "Access Denied: Only administrators can disconnect WhatsApp." };
    }

    const workspaceId = session.workspaceId || DEFAULT_WORKSPACE_ID;

    await Workspace.findByIdAndUpdate(workspaceId, {
      $set: {
        whatsappPhoneNumber: "",
        whatsappPhoneNumberId: "",
        whatsappBusinessAccountId: "",
        whatsappAccessToken: "",
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to disconnect line";
    return { success: false, error: msg };
  }
}
