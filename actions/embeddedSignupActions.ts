"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { getSession } from "@/lib/auth";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";
import {
  IEmbeddedSignupPayload,
  IEmbeddedSignupActionResult,
} from "@/types/embeddedSignup";

export async function completeEmbeddedSignup(
  payload: IEmbeddedSignupPayload
): Promise<IEmbeddedSignupActionResult> {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session || !session.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (session.role === "agent") {
      return {
        success: false,
        error: "Access Denied: Only administrators can connect WhatsApp lines.",
      };
    }

    const workspaceId = session.workspaceId || DEFAULT_WORKSPACE_ID;
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
    const appSecret = process.env.FACEBOOK_APP_SECRET || "";

    let finalToken = "";
    let finalPhoneNumber = "";

    // 1. Exchange temporary auth code for permanent token
    if (payload.code && appId && appSecret) {
      try {
        const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${payload.code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          finalToken = tokenData.access_token;
        }
      } catch (err) {
        console.warn("[Meta Token Exchange Warning]:", err);
      }
    }

    // 2. Fetch verified display phone number from Meta
    if (payload.phoneNumberId && finalToken) {
      try {
        const phoneUrl = `https://graph.facebook.com/v21.0/${payload.phoneNumberId}?fields=display_phone_number,verified_name`;
        const phoneRes = await fetch(phoneUrl, {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        const phoneData = await phoneRes.json();
        if (phoneData.display_phone_number) {
          finalPhoneNumber = phoneData.display_phone_number;
        }
      } catch (err) {
        console.warn("[Meta Phone Info Warning]:", err);
      }
    }

    // 3. Auto-subscribe our Webhook to the client's WABA (eliminates manual webhook copy-paste!)
    if (payload.wabaId && finalToken) {
      try {
        const subUrl = `https://graph.facebook.com/v21.0/${payload.wabaId}/subscribed_apps`;
        await fetch(subUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${finalToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.warn("[Meta Webhook Subscribe Warning]:", err);
      }
    }

    // 4. Verify token and phone number retrieved from Meta
    if (!finalPhoneNumber || !finalToken) {
      return {
        success: false,
        error: "Unable to retrieve phone number or access token from Meta. Please verify your Facebook login permissions.",
      };
    }

    // 5. Update Workspace in DB
    await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          whatsappPhoneNumber: finalPhoneNumber.trim(),
          whatsappPhoneNumberId: (payload.phoneNumberId || "").trim(),
          whatsappBusinessAccountId: (payload.wabaId || "").trim(),
          whatsappAccessToken: finalToken.trim(),
        },
      },
      { new: true, upsert: true }
    );

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return {
      success: true,
      phoneNumber: finalPhoneNumber,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Failed to connect WhatsApp via Embedded Signup";
    return { success: false, error: msg };
  }
}
