"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { getSession } from "@/lib/auth";
import {
  SubscriptionPlan,
  BillingFrequency,
  CurrencyCode,
} from "@/types";

const DEFAULT_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

export interface CheckoutSubmissionData {
  plan: SubscriptionPlan;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  amount: number;
  companyName: string;
  billingEmail: string;
  paymentMethod: "card" | "bank" | "wallet";
  cardLast4?: string;
}

export async function processSubscriptionCheckout(data: CheckoutSubmissionData) {
  try {
    await dbConnect();
    const session = await getSession();
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;

    const daysToAdd = data.billingFrequency === "yearly" ? 365 : 30;
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    // Update workspace plan
    const updated = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          name: data.companyName.trim(),
          plan: data.plan,
          planStatus: "active",
          billingFrequency: data.billingFrequency,
          planCurrency: data.currency,
          amountPaid: data.amount,
          planExpiresAt: expiresAt,
          lastPaymentDate: new Date(),
          paymentMethod:
            data.paymentMethod === "card"
              ? `Credit Card (ending in ${data.cardLast4 || "4242"})`
              : "Bank Wire Transfer",
        },
      },
      { new: true, upsert: true }
    );

    revalidatePath("/billing");
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return {
      success: true,
      invoiceId,
      workspace: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Payment processing failed";
    console.error("Subscription Error:", error);
    return { success: false, error: msg };
  }
}
