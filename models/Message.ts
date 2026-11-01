import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IMessage } from "@/types";

export interface IMessageDocument
  extends Omit<IMessage, "_id" | "leadId">,
    Document {
  leadId: Types.ObjectId | string;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["customer", "agent", "bot"],
      required: true,
    },
    senderName: {
      type: String,
      default: "",
    },
    agentId: {
      type: String,
      default: "",
      index: true,
    },
    agentName: {
      type: String,
      default: "",
    },
    agentEmail: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Message text cannot be empty"],
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "document", "template"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    whatsappMessageId: {
      type: String,
      default: "",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for instant zero-delay delta sync & polling
MessageSchema.index({ leadId: 1, createdAt: 1 });
MessageSchema.index({ leadId: 1, updatedAt: 1 });
MessageSchema.index({ workspaceId: 1, createdAt: -1 });

export const Message: Model<IMessageDocument> =
  mongoose.models.Message ||
  mongoose.model<IMessageDocument>("Message", MessageSchema);

export default Message;
