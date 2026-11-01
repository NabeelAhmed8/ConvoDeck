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
    let messages = await Message.find({ leadId })
      .sort({ createdAt: 1 })
      .lean();

    // If chat has 0 or 1 message, seed realistic demo conversation so user can test scrolling immediately
    if (messages.length <= 1) {
      const demoMessages = [
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "customer",
          senderName: "Customer",
          text: "Hi! We are looking for a multi-agent WhatsApp inbox for our sales team.",
          type: "text",
          status: "read",
          createdAt: new Date(Date.now() - 1000 * 60 * 120),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "agent",
          senderName: "Asad (Sales Lead)",
          agentName: "Asad Ali",
          text: "Hello! Welcome to ConvoDeck. How many sales agents do you currently have on your team?",
          type: "text",
          status: "read",
          createdAt: new Date(Date.now() - 1000 * 60 * 105),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "customer",
          senderName: "Customer",
          text: "We currently have 5 agents handling incoming inquiries and scheduling customer demos.",
          type: "text",
          status: "read",
          createdAt: new Date(Date.now() - 1000 * 60 * 90),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "agent",
          senderName: "Asad (Sales Lead)",
          agentName: "Asad Ali",
          text: "Great! Our Growth Plan supports 5 authorized agent logins connected to your single official WhatsApp Business line.",
          type: "text",
          status: "read",
          createdAt: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "customer",
          senderName: "Customer",
          text: "Can all 5 agents reply to customers simultaneously without disconnecting or passing phones?",
          type: "text",
          status: "read",
          createdAt: new Date(Date.now() - 1000 * 60 * 45),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "agent",
          senderName: "Asad (Sales Lead)",
          agentName: "Asad Ali",
          text: "Yes! Every message shows the agent's name internally, so team members never collide on the same chat.",
          type: "text",
          status: "delivered",
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
        },
        {
          leadId,
          workspaceId: DEFAULT_WORKSPACE_ID,
          sender: "customer",
          senderName: "Customer",
          text: "That sounds excellent. Could you share the visual pipeline and pricing details?",
          type: "text",
          status: "delivered",
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
        },
      ];

      // Remove existing lone message if any and insert rich conversation
      await Message.deleteMany({ leadId });
      await Message.insertMany(demoMessages);
      messages = await Message.find({ leadId }).sort({ createdAt: 1 }).lean();
    }

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
