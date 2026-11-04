import mongoose, { Schema, Document, Model } from "mongoose";
import { IWorkspace } from "@/types";

export interface IWorkspaceDocument extends Omit<IWorkspace, "_id">, Document {}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    ownerEmail: {
      type: String,
      required: [true, "Owner email is required"],
      lowercase: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    whatsappPhoneNumber: {
      type: String,
      default: "",
    },
    whatsappPhoneNumberId: {
      type: String,
      default: "",
    },
    whatsappBusinessAccountId: {
      type: String,
      default: "",
    },
    whatsappAccessToken: {
      type: String,
      default: "",
    },
    webhookVerifyToken: {
      type: String,
      default: "convodeck_secure_token",
    },
    // Subscription & Billing Fields
    plan: {
      type: String,
      enum: ["trial", "starter", "growth", "enterprise"],
      default: "trial",
    },
    planStatus: {
      type: String,
      enum: ["trial", "active", "past_due", "canceled"],
      default: "trial",
    },
    billingFrequency: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    planCurrency: {
      type: String,
      enum: ["USD", "PKR", "AED", "EUR"],
      default: "USD",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    planExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default trial
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: "Credit Card",
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace: Model<IWorkspaceDocument> =
  mongoose.models.Workspace ||
  mongoose.model<IWorkspaceDocument>("Workspace", WorkspaceSchema);

export default Workspace;
