/**
 * autoReplyService.ts
 * Single Responsibility: Formats and dispatches automated WhatsApp messages.
 */

import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { Message } from "@/models/Message";
import { Workspace } from "@/models/Workspace";

export interface AutoReplyParams {
  leadId: string;
  leadPhone: string;
  workspaceId: string;
  replyText: string;
}

export async function dispatchAutoReply({
  leadId,
  leadPhone,
  workspaceId,
  replyText,
}: AutoReplyParams): Promise<boolean> {
  try {
    const workspace = await Workspace.findById(workspaceId).lean();

    // 1. Send via WhatsApp Cloud API
    const res = await sendWhatsAppMessage({
      to: leadPhone,
      text: replyText,
      phoneNumberId: workspace?.whatsappPhoneNumberId,
      accessToken: workspace?.whatsappAccessToken,
    });

    // 2. Record bot response in Message collection for conversation history
    await Message.create({
      leadId,
      workspaceId,
      sender: "bot",
      senderName: "Smart Assistant",
      text: replyText,
      type: "text",
      status: res.success ? "sent" : "delivered",
      whatsappMessageId: res.messageId || `bot_${Date.now()}`,
    });

    return true;
  } catch (error) {
    console.error("[AutoReply Dispatch Error]:", error);
    return false;
  }
}
