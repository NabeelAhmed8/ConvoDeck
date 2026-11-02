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
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";
import { createStripeSession } from "@/lib/stripe";
import { PRICING_TABLE, PaidPlanKey } from "@/constants/pricing";

export interface CheckoutSubmissionData {
  plan: SubscriptionPlan;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  amount: number;
  companyName: string;
  billingEmail: string;
  paymentMethod: "stripe" | "card";
  cardLast4?: string;
  stripeSessionId?: string;
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
          paymentMethod: `Stripe / Card (ending in ${data.cardLast4 || "4242"})`,
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

// 2. Create Hosted or Direct Stripe Checkout Session
export async function createStripePaymentSession(params: {
  planKey: PaidPlanKey;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  companyName: string;
  billingEmail: string;
}) {
  const plan = PRICING_TABLE[params.planKey];
  const unitPrice = plan.prices[params.currency][params.billingFrequency];
  const totalPrice =
    params.billingFrequency === "yearly" ? unitPrice * 12 : unitPrice;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://convodeck-one.vercel.app";

  return await createStripeSession({
    planName: plan.name,
    planKey: params.planKey,
    amount: totalPrice,
    currency: params.currency,
    billingFrequency: params.billingFrequency,
    customerEmail: params.billingEmail,
    companyName: params.companyName,
    successUrl: `${appUrl}/checkout/success?plan=${params.planKey}&amount=${totalPrice}&currency=${params.currency}`,
    cancelUrl: `${appUrl}/checkout?plan=${params.planKey}`,
  });
}
