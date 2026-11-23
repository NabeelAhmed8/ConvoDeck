import { Safepay } from "@sfpy/node-sdk";
import crypto from "crypto";

const apiKey = process.env.SAFEPAY_API_KEY || "";
const v1Secret = process.env.SAFEPAY_V1_SECRET || process.env.SAFEPAY_SECRET_KEY || "";
const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || v1Secret || "default_webhook_secret";

export const safepayClient =
  apiKey && v1Secret
    ? new Safepay({
        environment: (process.env.SAFEPAY_ENVIRONMENT === "production"
          ? "production"
          : "sandbox") as any,
        apiKey,
        v1Secret,
        webhookSecret,
      })
    : null;

export function verifySafepaySignature(tracker: string, signature: string): boolean {
  const secret = process.env.SAFEPAY_WEBHOOK_SECRET || process.env.SAFEPAY_V1_SECRET;
  if (!secret || !tracker || !signature) return false;

  try {
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(tracker)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export interface CreateSafepayCheckoutParams {
  amount: number;
  currency: string;
  orderId: string;
  cancelUrl: string;
  redirectUrl: string;
}

export async function createSafepayCheckoutSession(params: CreateSafepayCheckoutParams) {
  if (!safepayClient) {
    return {
      success: false,
      error:
        "Safepay credentials are not configured. Please add SAFEPAY_API_KEY and SAFEPAY_V1_SECRET in .env.local to proceed.",
    };
  }

  try {
    const { token } = await safepayClient.payments.create({
      amount: Math.round(params.amount),
      currency: params.currency === "USD" ? "USD" : "PKR",
    });

    const checkoutUrl = safepayClient.checkout.create({
      token,
      orderId: params.orderId,
      cancelUrl: params.cancelUrl,
      redirectUrl: params.redirectUrl,
      source: "custom",
      webhooks: false,
    });

    return {
      success: true,
      url: checkoutUrl,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create official Safepay checkout link";
    console.error("Safepay Error:", error);
    return {
      success: false,
      error: msg,
    };
  }
}
