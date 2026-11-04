import mongoose, { Schema, Document, Model } from "mongoose";
import { IAutomationLogItem } from "@/types/automation";

export interface IAutomationLogDocument
  extends Omit<IAutomationLogItem, "_id">,
    Document {}

const AutomationLogSchema = new Schema<IAutomationLogDocument>(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    ruleType: {
      type: String,
      enum: ["AUTO_REPLY", "PIPELINE_MOVE", "ROUND_ROBIN", "URGENT_TAG", "HANDOFF"],
      required: true,
      index: true,
    },
    leadName: {
      type: String,
      default: "WhatsApp Contact",
    },
    leadPhone: {
      type: String,
      required: true,
    },
    triggerText: {
      type: String,
      required: true,
    },
    actionTaken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire logs older than 30 days to keep database lightweight
AutomationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const AutomationLog: Model<IAutomationLogDocument> =
  mongoose.models.AutomationLog ||
  mongoose.model<IAutomationLogDocument>("AutomationLog", AutomationLogSchema);

export default AutomationLog;
