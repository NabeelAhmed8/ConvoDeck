"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Message } from "@/models/Message";
import { Lead } from "@/models/Lead";
import { Workspace } from "@/models/Workspace";
import { AuditLog } from "@/models/AuditLog";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getSession } from "@/lib/auth";

const DEFAULT_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

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
      status: waResponse.success ? "sent" : "delivered",
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

    // Update lead's last message snippet
    await Lead.findByIdAndUpdate(leadId, {
      lastMessage: text,
      lastMessageAt: new Date(),
      unreadCount: 0,
    });

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
    await Lead.findByIdAndUpdate(leadId, { unreadCount: 0 });
    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Error marking chat read:", error);
    return { success: false };
  }
}
