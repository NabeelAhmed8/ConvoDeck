"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { Workspace } from "@/models/Workspace";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import {
  SubscriptionPlan,
  BillingFrequency,
  CurrencyCode,
} from "@/types";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";
import { createStripeSession } from "@/lib/stripe";
import { PRICING_TABLE, PaidPlanKey } from "@/constants/pricing";
import {
  processJazzCashMerchantPayment,
  processEasyPaisaMerchantPayment,
} from "@/lib/paymentGateways";
import { initiateHostedCheckout, HostedRedirectResult } from "@/lib/hostedCheckout";

export interface CheckoutSubmissionData {
  plan: SubscriptionPlan;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  amount: number;
  companyName: string;
  billingEmail: string;
  paymentMethod: "stripe" | "card" | "jazzcash" | "easypaisa";
  mobileNumber?: string;
  cnicLast6?: string;
  cardLast4?: string;
  transactionRef?: string;
  senderAccount?: string;
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

    // Build user-friendly payment method summary & process auto-deduct gateway
    let paymentMethodLabel = "Credit / Debit Card Auto-Debit";

    if (data.paymentMethod === "jazzcash") {
      const gatewayRes = await processJazzCashMerchantPayment({
        mobileNumber: data.mobileNumber || "",
        cnicLast6: data.cnicLast6 || "",
        amount: data.amount,
        invoiceId,
        billingEmail: data.billingEmail,
        companyName: data.companyName,
      });

      if (!gatewayRes.success) {
        return {
          success: false,
          error: gatewayRes.error || "JazzCash auto-debit transaction failed.",
        };
      }
      paymentMethodLabel = `JazzCash Auto-Debit (Ref: ${gatewayRes.txnRefNo}, A/C: ${data.mobileNumber || "N/A"})`;
    } else if (data.paymentMethod === "easypaisa") {
      const gatewayRes = await processEasyPaisaMerchantPayment({
        mobileNumber: data.mobileNumber || "",
        amount: data.amount,
        invoiceId,
        billingEmail: data.billingEmail,
        companyName: data.companyName,
      });

      if (!gatewayRes.success) {
        return {
          success: false,
          error: gatewayRes.error || "EasyPaisa auto-debit transaction failed.",
        };
      }
      paymentMethodLabel = `EasyPaisa Auto-Debit (Ref: ${gatewayRes.txnRefNo}, A/C: ${data.mobileNumber || "N/A"})`;
    } else {
      paymentMethodLabel = `Card Auto-Debit (ending in ${data.cardLast4 || "4242"})`;
    }

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
          paymentMethod: paymentMethodLabel,
        },
      },
      { new: true, upsert: true }
    );

    // Enforce seat limit adjustment upon plan changes or downgrades
    const newMaxSeats = data.plan === "starter" ? 2 : data.plan === "growth" ? 5 : 50;
    const activeAgents = await User.find({
      workspaceId,
      role: "agent",
      status: "active",
    }).sort({ createdAt: -1 });

    if (activeAgents.length > newMaxSeats) {
      const excessCount = activeAgents.length - newMaxSeats;
      const agentsToSuspend = activeAgents.slice(0, excessCount);
      for (const agent of agentsToSuspend) {
        await User.findByIdAndUpdate(agent._id, { $set: { status: "suspended" } });
      }
    }

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

// 3. Initiate Official Hosted Redirection Checkout (JazzCash, EasyPaisa, Stripe)
export async function startHostedSubscriptionCheckout(params: {
  planKey: PaidPlanKey;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  companyName: string;
  billingEmail: string;
  paymentMethod: "jazzcash" | "easypaisa" | "card";
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
