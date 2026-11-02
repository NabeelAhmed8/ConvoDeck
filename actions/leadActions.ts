"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Lead } from "@/models/Lead";
import { Message } from "@/models/Message";
import { AuditLog } from "@/models/AuditLog";
import { ILead, LeadStage } from "@/types";
import { getSession } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";

// Helper to determine current active workspace
async function getActiveWorkspaceId(providedWorkspaceId?: string): Promise<string> {
  if (providedWorkspaceId) return providedWorkspaceId;
  const session = await getSession();
  if (session?.workspaceId) return session.workspaceId;
  return DEFAULT_WORKSPACE_ID;
}

// Ensure at least 1 active prospect exists in workspace so testing the chat & kanban is instant
async function ensureDefaultProspect(workspaceId: string) {
  const count = await Lead.countDocuments({ workspaceId });
  if (count === 0) {
    const defaultLead = await Lead.create({
      name: "Zubair Ahmed",
      phone: "923219876543",
      email: "zubair.demo@company.com",
      company: "Zubair Tech Solutions",
      stage: "NEW",
      dealValue: 1200,
      workspaceId,
      tags: ["Inbound Lead"],
      lastMessage: "Hi! Can you provide the multi-agent WhatsApp setup details?",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
      unreadCount: 1,
      notes: "Looking for 5-agent WhatsApp CRM setup for their sales team.",
    });

    await Message.create({
      leadId: defaultLead._id,
      workspaceId,
      sender: "customer",
      senderName: "Zubair Ahmed",
      text: "Hi! Can you provide the multi-agent WhatsApp setup details?",
      type: "text",
      status: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    });
  }
}

// 1. Fetch Leads from Database for Workspace
export async function getLeads(workspaceId?: string) {
  try {
    await dbConnect();
    const targetWorkspaceId = await getActiveWorkspaceId(workspaceId);

    await ensureDefaultProspect(targetWorkspaceId);

    const leads = await Lead.find({ workspaceId: targetWorkspaceId })
      .sort({ updatedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

// 2. Fetch Single Real Lead by ID
export async function getLeadById(leadId: string) {
  try {
    await dbConnect();
    const lead = await Lead.findById(leadId).lean();
    if (!lead) return null;
    return JSON.parse(JSON.stringify(lead));
  } catch (error) {
    console.error("Error fetching lead by id:", error);
    return null;
  }
}

// 3. Create Real Lead
export async function createLead(leadData: Partial<ILead>) {
  try {
    await dbConnect();
    const targetWorkspaceId = await getActiveWorkspaceId(leadData.workspaceId);

    const cleanPhone = (leadData.phone || "").replace(/\D/g, "");

    const newLead = await Lead.create({
      name: leadData.name?.trim(),
      phone: cleanPhone,
      email: leadData.email?.trim() || "",
      company: leadData.company?.trim() || "",
      stage: leadData.stage || "NEW",
      dealValue: Number(leadData.dealValue) || 0,
      workspaceId: targetWorkspaceId,
      notes: leadData.notes?.trim() || "",
      tags: leadData.tags || ["Manual Entry"],
      lastMessage: leadData.notes ? `Requirement: ${leadData.notes}` : "Lead added to pipeline",
      lastMessageAt: new Date(),
    });

    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { success: true, lead: JSON.parse(JSON.stringify(newLead)) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create lead";
    return { success: false, error: message };
  }
}

// 4. Update Lead Stage on Kanban (Drag & Drop or dropdown)
export async function updateLeadStage(leadId: string, newStage: LeadStage) {
  try {
    await dbConnect();
    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { $set: { stage: newStage, updatedAt: new Date() } },
      { new: true }
    );

    const session = await getSession();
    if (updatedLead) {
      await AuditLog.create({
        workspaceId: updatedLead.workspaceId || DEFAULT_WORKSPACE_ID,
        actorId: session?.userId || "system",
        actorName: session?.name || "Agent",
        actorEmail: session?.email || "agent@convodeck.com",
        actorRole: session?.role || "agent",
        action: "UPDATED_LEAD_STAGE",
        targetType: "lead",
        targetId: leadId,
        targetName: updatedLead.name,
        details: `Moved deal stage to ${newStage} for ${updatedLead.name}`,
      });
    }

    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");

    return { success: true, lead: JSON.parse(JSON.stringify(updatedLead)) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update stage";
    return { success: false, error: message };
  }
}

// 5. Update Lead Details
export async function updateLead(leadId: string, updates: Partial<ILead>) {
  try {
    await dbConnect();
    const updated = await Lead.findByIdAndUpdate(
      leadId,
      { $set: updates },
      { new: true }
    );

    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { success: true, lead: JSON.parse(JSON.stringify(updated)) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update lead";
    return { success: false, error: message };
  }
}

// 6. Delete Lead
export async function deleteLead(leadId: string) {
  try {
    await dbConnect();
    await Lead.findByIdAndDelete(leadId);
    await Message.deleteMany({ leadId });

    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete lead";
    return { success: false, error: message };
  }
}

// 7. Public Website Inbound Lead Capture Form Action
export async function capturePublicLead(data: {
  name: string;
  phone: string;
  email?: string;
  message: string;
}) {
  try {
    const { name, phone, email, message } = data;

    if (!name.trim() || !phone.trim() || !message.trim()) {
      return { success: false, error: "Please enter your Name, WhatsApp number, and Message." };
    }

    await dbConnect();
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if lead already exists
    let lead = await Lead.findOne({
      phone: cleanPhone,
      workspaceId: DEFAULT_WORKSPACE_ID,
    });

    if (!lead) {
      lead = await Lead.create({
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim() || "",
        stage: "NEW",
        dealValue: 0,
        workspaceId: DEFAULT_WORKSPACE_ID,
        tags: ["Website Contact Form"],
        lastMessage: message.trim(),
        lastMessageAt: new Date(),
        unreadCount: 1,
        notes: `Inquiry submitted via Landing Page:\n"${message.trim()}"`,
      });
    } else {
      lead.lastMessage = message.trim();
      lead.lastMessageAt = new Date();
      lead.unreadCount = (lead.unreadCount || 0) + 1;
      lead.notes = `${lead.notes || ""}\n\n[New Website Inquiry]: ${message.trim()}`;
      await lead.save();
    }

    // Save as message in chat history
    await Message.create({
      leadId: lead._id,
      workspaceId: DEFAULT_WORKSPACE_ID,
      sender: "customer",
      senderName: name.trim(),
      text: message.trim(),
      type: "text",
      status: "delivered",
    });

    // Send automated confirmation WhatsApp to their phone number
    await sendWhatsAppMessage({
      to: cleanPhone,
      text: `Hello ${name}! 👋 Thank you for reaching out to ConvoDeck. Our sales team has received your inquiry: "${message.trim()}". We will reply directly here on WhatsApp shortly!`,
    });

    revalidatePath("/pipeline");
    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    revalidatePath("/chat");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit inquiry";
    console.error("Public Lead Capture Error:", error);
    return { success: false, error: msg };
  }
}
