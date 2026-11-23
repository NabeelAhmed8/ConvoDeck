import crypto from "crypto";
import { PaidPlanKey } from "@/constants/pricing";
import { BillingFrequency, CurrencyCode } from "@/types";
import { createStripeSession } from "./stripe";

export interface HostedCheckoutParams {
  planKey: PaidPlanKey;
  planName: string;
  billingFrequency: BillingFrequency;
  currency: CurrencyCode;
  totalAmount: number;
  companyName: string;
  billingEmail: string;
  workspaceId: string;
  paymentMethod: "jazzcash" | "easypaisa" | "card";
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

  // 1. Stripe Hosted Redirection
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

    return {
      success: false,
      error:
        "Stripe payment gateway is not configured. Please add your STRIPE_SECRET_KEY in environment variables.",
    };
  }

  // 2. JazzCash Official Hosted Portal Redirection
  if (params.paymentMethod === "jazzcash") {
    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const password = process.env.JAZZCASH_PASSWORD;
    const salt = process.env.JAZZCASH_INTEGRITY_SALT;
    const hostedUrl =
      process.env.JAZZCASH_HOSTED_URL ||
      "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

    if (merchantId && password && salt) {
      const now = new Date();
      const formatDateTime = (d: Date) =>
        d.toISOString().replace(/[-:T]/g, "").slice(0, 14);

      const txnRefNo = `T${Date.now()}`;
      const txnDateTime = formatDateTime(now);
      const expiryDateTime = formatDateTime(new Date(now.getTime() + 60 * 60 * 1000));

      const fields: Record<string, string> = {
        pp_Version: "1.1",
        pp_TxnType: "",
        pp_Language: "EN",
        pp_MerchantID: merchantId,
        pp_Password: password,
        pp_TxnRefNo: txnRefNo,
        pp_Amount: String(Math.round(params.totalAmount * 100)),
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_BillReference: invoiceId,
        pp_Description: `ConvoDeck ${params.planName} Plan - ${params.companyName}`,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_ReturnURL: returnUrl,
      };

      const sortedKeys = Object.keys(fields).sort();
      const stringToHash = [
        salt,
        ...sortedKeys.map((k) => fields[k]).filter(Boolean),
      ].join("&");

      fields.pp_SecureHash = crypto
        .createHmac("sha256", salt)
        .update(stringToHash)
        .digest("hex")
        .toUpperCase();

      return {
        success: true,
        redirectType: "post",
        actionUrl: hostedUrl,
        fields,
      };
    }

    return {
      success: false,
      error:
        "JazzCash Merchant Gateway is not configured. Please add JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, and JAZZCASH_INTEGRITY_SALT in .env.local.",
    };
  }

  // 3. EasyPaisa Official Hosted Portal Redirection
  if (params.paymentMethod === "easypaisa") {
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;
    const hostedUrl =
      process.env.EASYPAISA_HOSTED_URL ||
      "https://easypaisa.com.pk/easypay/Index.jsf";

    if (storeId && hashKey) {
      const orderId = invoiceId;
      const amountStr = params.totalAmount.toFixed(2);
      const hashStr = `orderId=${orderId}&storeId=${storeId}&amount=${amountStr}&postBackURL=${returnUrl}`;
      const hash = crypto
        .createHmac("sha256", hashKey)
        .update(hashStr)
        .digest("hex");

      const query = new URLSearchParams({
        storeId,
        orderId,
        amount: amountStr,
        postBackURL: returnUrl,
        autoRedirect: "1",
        emailAddress: params.billingEmail,
        hash,
      });

      return {
        success: true,
        redirectType: "get",
        url: `${hostedUrl}?${query.toString()}`,
      };
    }

    return {
      success: false,
      error:
        "EasyPaisa Merchant Gateway is not configured. Please add EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY in .env.local.",
    };
  }

  return { success: false, error: "Invalid payment method specified." };
}
