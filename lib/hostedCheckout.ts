import { PaidPlanKey } from "@/constants/pricing";
import { BillingFrequency, CurrencyCode } from "@/types";
import { createStripeSession } from "./stripe";
import { createSafepayCheckoutSession } from "./safepay";

export interface HostedCheckoutParams {
  planKey: PaidPlanKey;
  planName: string;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  totalAmount: number;
  companyName: string;
  billingEmail: string;
  workspaceId: string;
  paymentMethod: "safepay" | "card";
  appUrl: string;
}

export type HostedRedirectResult =
  | { success: true; redirectType: "get"; url: string }
  | { success: true; redirectType: "post"; actionUrl: string; fields: Record<string, string> }
  | { success: false; error: string };

export async function initiateHostedCheckout(
  params: HostedCheckoutParams
): Promise<HostedRedirectResult> {
  const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;

  const returnUrl = `${params.appUrl}/api/checkout/callback?gateway=${params.paymentMethod}&invoiceId=${invoiceId}&plan=${params.planKey}&amount=${params.totalAmount}&currency=${params.currency}&workspaceId=${params.workspaceId}&billing=${params.billingFrequency}`;

  if (params.paymentMethod === "safepay") {
    const safepayRes = await createSafepayCheckoutSession({
      amount: params.totalAmount,
      currency: params.currency,
      orderId: invoiceId,
      cancelUrl: `${params.appUrl}/checkout?plan=${params.planKey}`,
      redirectUrl: returnUrl,
    });

    if (safepayRes.success && safepayRes.url) {
      return { success: true, redirectType: "get", url: safepayRes.url };
    }

    return {
      success: false,
      error: safepayRes.error || "Safepay checkout session could not be created.",
    };
  }

  if (params.paymentMethod === "card") {
    const sessionRes = await createStripeSession({
      planKey: params.planKey,
      planName: params.planName,
      amount: params.totalAmount,
      currency: params.currency,
      billingFrequency: params.billingFrequency,
      customerEmail: params.billingEmail,
      companyName: params.companyName,
      successUrl: `${params.appUrl}/checkout/success?invoiceId=${invoiceId}&plan=${params.planKey}&amount=${params.totalAmount}&currency=${params.currency}`,
      cancelUrl: `${params.appUrl}/checkout?plan=${params.planKey}`,
    });

    if (sessionRes.success && sessionRes.url) {
      return { success: true, redirectType: "get", url: sessionRes.url };
    }

    if (sessionRes.success && (sessionRes as any).isMock) {
      if (process.env.STRICT_PAYMENTS === "true" || process.env.NODE_ENV === "production") {
        return {
          success: false,
          error: "Card payments require active Stripe production credentials.",
        };
      }
      return {
        success: true,
        redirectType: "get",
        url: returnUrl,
      };
    }

    return {
      success: false,
      error:
        sessionRes.error ||
        "Stripe payment gateway is not configured. Please add your STRIPE_SECRET_KEY in environment variables.",
    };
  }

  return { success: false, error: "Invalid payment method specified." };
}
