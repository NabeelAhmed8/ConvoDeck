import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Lead } from "@/models/Lead";
import { Message } from "@/models/Message";
import { Workspace } from "@/models/Workspace";
import { processSmartAutomation } from "@/lib/automation/automationEngine";

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "convodeck_secure_token";

// 1. Webhook Verification (Meta sends GET request when configuring webhook in Meta App Dashboard)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    // Check against global env verify token
    if (token === VERIFY_TOKEN) {
      console.log("[Meta WhatsApp Webhook Verified via Env Token]");
      return new Response(challenge, { status: 200 });
    }

    // Check against per-workspace custom verify tokens stored in DB
    try {
      await dbConnect();
      const workspace = await Workspace.findOne({ webhookVerifyToken: token });
      if (workspace) {
        console.log(`[Meta WhatsApp Webhook Verified for Workspace: ${workspace.name}]`);
        return new Response(challenge, { status: 200 });
      }
    } catch (err) {
      console.error("[Webhook Verification DB Error]:", err);
    }
  }

  return new Response("Forbidden", { status: 403 });
}

// 2. Real Incoming Messages & Status Updates (Meta sends POST request)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.object || body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    await dbConnect();

    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // Dynamic Workspace Lookup by Phone Number ID
        const phoneNumberId = value.metadata?.phone_number_id;
        let targetWorkspaceId =
          process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

        if (phoneNumberId) {
          const matchedWorkspace = await Workspace.findOne({
            whatsappPhoneNumberId: phoneNumberId,
          });
          if (matchedWorkspace) {
            targetWorkspaceId = matchedWorkspace._id.toString();
          }
        }

        // A. Real Status Updates (sent, delivered, read)
        if (value.statuses && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            const messageId = statusObj.id;
            const newStatus = statusObj.status;

            await Message.updateOne(
              { whatsappMessageId: messageId },
              { $set: { status: newStatus } }
            );
          }
        }

        // B. Real Incoming Messages from WhatsApp
        if (value.messages && value.messages.length > 0) {
          const contacts = value.contacts || [];
          const contactProfile = contacts[0]?.profile?.name || "";

          for (const msg of value.messages) {
            const fromPhone = msg.from; // Phone number without +
            const messageId = msg.id;
            let messageText = "";

            if (msg.type === "text") {
              messageText = msg.text?.body || "";
            } else if (msg.type === "image") {
              messageText = "[Image received]";
            } else if (msg.type === "document") {
              messageText = "[Document received]";
            } else {
              messageText = `[${msg.type || "media"} message]`;
            }

            // Find or Auto-Create Real Lead (Check workspace first, then fallback to global phone match)
            let lead = await Lead.findOne({
              phone: fromPhone,
              workspaceId: targetWorkspaceId,
            });

            if (!lead) {
              lead = await Lead.findOne({ phone: fromPhone });
              if (lead) {
                targetWorkspaceId = lead.workspaceId;
              }
            }

            if (!lead) {
              lead = await Lead.create({
                name: contactProfile || `Lead +${fromPhone}`,
                phone: fromPhone,
                stage: "NEW",
                dealValue: 0,
                workspaceId: targetWorkspaceId,
                lastMessage: messageText,
                lastMessageAt: new Date(),
                unreadCount: 1,
                tags: ["WhatsApp Inbound"],
              });
            } else {
              lead.lastMessage = messageText;
              lead.lastMessageAt = new Date();
              lead.unreadCount = (lead.unreadCount || 0) + 1;
              if (contactProfile && lead.name.startsWith("Lead +")) {
                lead.name = contactProfile;
              }
              await lead.save();
            }

            // Save Real Message in Chat History
            await Message.create({
              leadId: lead._id,
              workspaceId: targetWorkspaceId,
              sender: "customer",
              senderName: lead.name,
              text: messageText,
              type: msg.type === "text" ? "text" : "image",
              status: "delivered",
              whatsappMessageId: messageId,
            });

            console.log(
              `[ConvoDeck Live] Incoming message from +${fromPhone} (${lead.name}): ${messageText}`
            );

            // Execute Smart Automations (Auto-reply, Pipeline move, Round-Robin agent routing, Priority tagging)
            processSmartAutomation({
              lead: typeof lead.toObject === "function" ? lead.toObject() : lead,
              messageText,
              workspaceId: targetWorkspaceId,
            }).catch((err) =>
              console.error("[Smart Automation Webhook Trigger Error]:", err)
            );
          }
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json(
      { status: "error", error: "Internal processing error" },
      { status: 200 }
    );
  }
}
