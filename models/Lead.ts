import mongoose, { Schema, Document, Model } from "mongoose";
import { ILead } from "@/types";

export interface ILeadDocument extends Omit<ILead, "_id">, Document {}

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    stage: {
      type: String,
      enum: ["NEW", "CONTACTED", "DEMO_SCHEDULED", "PROPOSAL_SENT", "WON", "LOST"],
      default: "NEW",
      index: true,
    },
    dealValue: {
      type: Number,
      default: 0,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    workspaceId: {
      type: String,
      required: [true, "Workspace ID is required"],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for workspace and phone lookups
LeadSchema.index({ workspaceId: 1, phone: 1 });

export const Lead: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>("Lead", LeadSchema);

export default Lead;
