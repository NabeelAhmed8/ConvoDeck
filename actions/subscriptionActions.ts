"use server";

import { dbConnect } from "@/lib/dbConnect";
import { getSession } from "@/lib/auth";
import { BillingFrequency, CurrencyCode } from "@/types";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";
import { createStripeSession } from "@/lib/stripe";
import { PRICING_TABLE, PaidPlanKey } from "@/constants/pricing";
import { initiateHostedCheckout, HostedRedirectResult } from "@/lib/hostedCheckout";

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

export async function startHostedSubscriptionCheckout(params: {
  planKey: PaidPlanKey;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  companyName: string;
  billingEmail: string;
  paymentMethod: "safepay" | "card";
}): Promise<HostedRedirectResult> {
  try {
    await dbConnect();
    const session = await getSession();
    const workspaceId = session?.workspaceId || DEFAULT_WORKSPACE_ID;
    const plan = PRICING_TABLE[params.planKey];
    const unitPrice = plan.prices[params.currency][params.billingFrequency];
    const totalPrice =
      params.billingFrequency === "yearly" ? unitPrice * 12 : unitPrice;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return await initiateHostedCheckout({
      planKey: params.planKey,
      planName: plan.name,
      billingFrequency: params.billingFrequency,
      currency: params.currency,
      totalAmount: totalPrice,
      companyName: params.companyName.trim() || "My Company",
      billingEmail: params.billingEmail.trim(),
      workspaceId,
      paymentMethod: params.paymentMethod,
      appUrl,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Hosted checkout initialization failed";
    return { success: false, error: msg };
  }
}
