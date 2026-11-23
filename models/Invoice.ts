import mongoose, { Schema, Document, Model } from "mongoose";
import { IInvoice } from "@/types";

export interface IInvoiceDocument extends Omit<IInvoice, "_id">, Document {}

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    workspaceId: {
      type: String,
      required: [true, "Workspace ID is required"],
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
    },
    plan: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    billingFrequency: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    paymentMethod: {
      type: String,
      default: "Safepay Gateway",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "refunded"],
      default: "completed",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice: Model<IInvoiceDocument> =
  mongoose.models.Invoice ||
  mongoose.model<IInvoiceDocument>("Invoice", InvoiceSchema);

export default Invoice;
