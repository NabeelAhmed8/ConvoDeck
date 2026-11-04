import mongoose, { Schema, Document, Model } from "mongoose";
import { IAutomationConfig } from "@/types/automation";

export interface IAutomationConfigDocument
  extends Omit<IAutomationConfig, "_id">,
    Document {}

const AutomationConfigSchema = new Schema<IAutomationConfigDocument>(
  {
    workspaceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    autoReplyEnabled: {
      type: Boolean,
      default: true,
    },
    greetingMessage: {
      type: String,
      default:
        "Hello! Thank you for reaching out to us on WhatsApp. Our team has received your message and an agent will assist you shortly.",
    },
    pipelineAutomationEnabled: {
      type: Boolean,
      default: true,
    },
    demoKeywords: {
      type: [String],
      default: ["demo", "schedule", "meeting", "presentation", "call"],
    },
    pricingKeywords: {
      type: [String],
      default: ["price", "pricing", "cost", "quote", "rate", "package"],
    },
    roundRobinEnabled: {
      type: Boolean,
      default: true,
    },
    lastAssignedAgentIndex: {
      type: Number,
      default: 0,
    },
    urgentDetectionEnabled: {
      type: Boolean,
      default: true,
    },
    urgentKeywords: {
      type: [String],
      default: [
        "urgent",
        "asap",
        "emergency",
        "complaint",
        "refund",
        "broken",
        "critical",
        "immediately",
      ],
    },
    autoHandoffKeywords: {
      type: [String],
      default: ["human", "agent", "person", "representative", "operator"],
    },
  },
  {
    timestamps: true,
  }
);

export const AutomationConfig: Model<IAutomationConfigDocument> =
  mongoose.models.AutomationConfig ||
  mongoose.model<IAutomationConfigDocument>(
    "AutomationConfig",
    AutomationConfigSchema
  );

export default AutomationConfig;
