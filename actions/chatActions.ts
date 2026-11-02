"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Message } from "@/models/Message";
import { Lead } from "@/models/Lead";
import { Workspace } from "@/models/Workspace";
import { AuditLog } from "@/models/AuditLog";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getSession } from "@/lib/auth";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";

// 1. Fetch Real Chat History for a Lead
export async function getMessages(leadId: string) {
  try {
    await dbConnect();
    const messages = await Message.find({ leadId })
      .sort({ createdAt: 1 })
      .lean();

    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// 2. Real Message Sending (Team Agent -> Customer WhatsApp)
export async function sendMessage({
  leadId,
  text,
  senderName,
}: {
  leadId: string;
  text: string;
  senderName?: string;
}) {
  try {
    await dbConnect();

    const session = await getSession();
    const finalSenderName = senderName || session?.name || "Sales Agent";

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    // Lookup workspace credentials if configured
    const workspace = await Workspace.findById(lead.workspaceId);
    const phoneNumberId = workspace?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = workspace?.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN;

    // Send via WhatsApp Cloud API
    const waResponse = await sendWhatsAppMessage({
      to: lead.phone,
      text: text,
      phoneNumberId,
      accessToken,
    });

    // Save outgoing message to DB with agent attribution
    const newMsg = await Message.create({
      leadId: lead._id,
      workspaceId: lead.workspaceId || DEFAULT_WORKSPACE_ID,
      sender: "agent",
      senderName: finalSenderName,
      agentId: session?.userId || "",
      agentName: session?.name || finalSenderName,
      agentEmail: session?.email || "",
      text,
      type: "text",
      status: waResponse.success ? "sent" : "failed",
      whatsappMessageId: waResponse.messageId || "",
    });

    // Record in Audit Trail for complete accountability
    await AuditLog.create({
      workspaceId: lead.workspaceId || DEFAULT_WORKSPACE_ID,
      actorId: session?.userId || "system",
      actorName: session?.name || finalSenderName,
      actorEmail: session?.email || "agent@convodeck.com",
      actorRole: session?.role || "agent",
      action: "SENT_MESSAGE",
      targetType: "lead",
      targetId: lead._id.toString(),
      targetName: lead.name,
      details: `Sent message to ${lead.name} (+${lead.phone}): "${text.slice(0, 70)}${text.length > 70 ? "..." : ""}"`,
    });

    // Update lead's last message snippet & timestamp for real-time delta sync
    await Lead.findByIdAndUpdate(
      leadId,
      {
        lastMessage: text,
        lastMessageAt: new Date(),
        unreadCount: 0,
        updatedAt: new Date(),
      },
      { new: true }
    );

    revalidatePath("/chat");
    revalidatePath("/pipeline");
    revalidatePath("/kanban");

    return {
      success: true,
      message: JSON.parse(JSON.stringify(newMsg)),
      apiWarning: waResponse.error || undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return { success: false, error: message };
  }
}

// 3. Mark Lead Chat as Read
export async function markChatAsRead(leadId: string) {
  try {
    await dbConnect();
    await Lead.findByIdAndUpdate(leadId, { unreadCount: 0, updatedAt: new Date() });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error marking chat read:", error);
    return { success: false };
  }
}

// 4. Mark Lead Chat as Unread
export async function markChatAsUnread(leadId: string) {
  try {
    await dbConnect();
    await Lead.findByIdAndUpdate(leadId, { unreadCount: 1, updatedAt: new Date() });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error marking chat unread:", error);
    return { success: false };
  }
}

// 5. Toggle Mute / Unmute for Chat Notifications
export async function toggleMuteChat(leadId: string, isMuted: boolean) {
  try {
    await dbConnect();
    await Lead.findByIdAndUpdate(leadId, { isMuted, updatedAt: new Date() });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error toggling mute:", error);
    return { success: false };
  }
}

// 6. Toggle Block / Unblock Contact
export async function toggleBlockContact(leadId: string, isBlocked: boolean) {
  try {
    await dbConnect();
    await Lead.findByIdAndUpdate(leadId, { isBlocked, updatedAt: new Date() });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error toggling block:", error);
    return { success: false };
  }
}

// 7. Clear All Messages for Lead (Preserves Contact Profile)
export async function clearChatMessages(leadId: string) {
  try {
    await dbConnect();
    await Message.deleteMany({ leadId });
    await Lead.findByIdAndUpdate(leadId, {
      lastMessage: "",
      unreadCount: 0,
      updatedAt: new Date(),
    });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    const msg = error instanceof Error ? error.message : "Failed to clear chat messages";
    return { success: false, error: msg };
  }
}

// 8. Delete Entire Chat and Contact
export async function deleteChat(leadId: string) {
  try {
    await dbConnect();
    await Message.deleteMany({ leadId });
    await Lead.findByIdAndDelete(leadId);
    revalidatePath("/chat");
    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete chat";
    return { success: false, error: msg };
  }
}
