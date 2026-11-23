import crypto from "crypto";

export interface JazzCashPaymentParams {
  mobileNumber: string;
  cnicLast6: string;
  amount: number;
  invoiceId: string;
  billingEmail: string;
  companyName: string;
}

export interface EasyPaisaPaymentParams {
  mobileNumber: string;
  amount: number;
  invoiceId: string;
  billingEmail: string;
  companyName: string;
}

export interface GatewayPaymentResult {
  success: boolean;
  txnRefNo: string;
  responseCode?: string;
  responseMessage?: string;
  error?: string;
}

/**
 * JazzCash Merchant MWallet Auto-Debit Payment Gateway
 * Initiates an instant USSD / MPIN push prompt on user's mobile device
 * to automatically deduct the subscription fee into the merchant account.
 */
export async function processJazzCashMerchantPayment(
  params: JazzCashPaymentParams
): Promise<GatewayPaymentResult> {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const salt = process.env.JAZZCASH_INTEGRITY_SALT;
  const apiUrl =
    process.env.JAZZCASH_API_URL ||
    "https://sandbox.jazzcash.com.pk/Application/index.php/API/Payment/DoTransaction";

  const txnRefNo = `T${Date.now()}`;
  const now = new Date();
  const formatDateTime = (d: Date) =>
    d.toISOString().replace(/[-:T]/g, "").slice(0, 14);

  const txnDateTime = formatDateTime(now);
  const expiryDateTime = formatDateTime(new Date(now.getTime() + 60 * 60 * 1000));
  const cleanMobile = params.mobileNumber.replace(/\D/g, "");
  const cleanCnic = params.cnicLast6.replace(/\D/g, "");

  // Live HTTP API Call when credentials are configured in .env.local
  if (merchantId && password && salt) {
    try {
      const payloadFields: Record<string, string> = {
        pp_Amount: String(Math.round(params.amount * 100)), // paisas
        pp_BankID: "TBANK",
        pp_BillReference: params.invoiceId,
        pp_CNIC: cleanCnic,
        pp_Description: `ConvoDeck - ${params.companyName}`,
        pp_Language: "EN",
        pp_MerchantID: merchantId,
        pp_MobileNumber: cleanMobile,
        pp_Password: password,
        pp_ProductID: "REFT1",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_TxnRefNo: txnRefNo,
        pp_TxnType: "MWALLET",
        pp_Version: "1.1",
      };

      const sortedKeys = Object.keys(payloadFields).sort();
      const stringToHash = [
        salt,
        ...sortedKeys.map((k) => payloadFields[k]).filter(Boolean),
      ].join("&");

      const secureHash = crypto
        .createHmac("sha256", salt)
        .update(stringToHash)
        .digest("hex")
        .toUpperCase();

      payloadFields.pp_SecureHash = secureHash;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFields),
      });

      const json = await res.json().catch(() => null);

      if (json && (json.pp_ResponseCode === "000" || json.pp_ResponseCode === "121")) {
        return {
          success: true,
          txnRefNo: json.pp_TxnRefNo || txnRefNo,
          responseCode: json.pp_ResponseCode,
          responseMessage: json.pp_ResponseMessage || "Approved",
        };
      }

      return {
        success: false,
        txnRefNo,
        responseCode: json?.pp_ResponseCode,
        error:
          json?.pp_ResponseMessage ||
          "JazzCash payment could not be authorized. Please check your account balance and MPIN prompt.",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "JazzCash gateway network error";
      return { success: false, txnRefNo, error: msg };
    }
  }

  // Production Gate: In live production, reject unconfigured gateways immediately
  if (process.env.NODE_ENV === "production" || process.env.STRICT_PAYMENTS === "true") {
    return {
      success: false,
      txnRefNo,
      error:
        "JazzCash online merchant gateway is not active. Please select Debit/Credit Card or contact administrator.",
    };
  }

  // Graceful Sandbox simulation ONLY in local development
  console.log(
    `[JazzCash Gateway] Development Sandbox Auto-Debit for ${cleanMobile} (Amount: PKR ${params.amount}).`
  );

  return {
    success: true,
    txnRefNo: `JC-AUTODEDUCT-${Date.now().toString().slice(-6)}`,
    responseCode: "000",
    responseMessage: "Payment auto-deducted successfully via JazzCash Sandbox",
  };
}

/**
 * EasyPaisa Direct Debit Mobile Account Gateway
 * Sends an instant approval prompt to the user's EasyPaisa app / account
 * to deduct the subscription fee directly.
 */
export async function processEasyPaisaMerchantPayment(
  params: EasyPaisaPaymentParams
): Promise<GatewayPaymentResult> {
  const storeId = process.env.EASYPAISA_STORE_ID;
  const hashKey = process.env.EASYPAISA_HASH_KEY;
  const apiUrl =
    process.env.EASYPAISA_API_URL ||
    "https://easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction";

  const txnRefNo = `EP-${Date.now()}`;
  const cleanMobile = params.mobileNumber.replace(/\D/g, "");

  // Live HTTP API Call when credentials are configured in .env.local
  if (storeId && hashKey) {
    try {
      const payload = {
        orderId: params.invoiceId,
        storeId,
        transactionAmount: params.amount.toFixed(2),
        transactionType: "MA",
        mobileAccountNo: cleanMobile,
        emailAddress: params.billingEmail || "billing@convodeck.com",
      };

      const hashStr = `orderId=${payload.orderId}&storeId=${payload.storeId}&transactionAmount=${payload.transactionAmount}&transactionType=${payload.transactionType}&mobileAccountNo=${payload.mobileAccountNo}&emailAddress=${payload.emailAddress}`;
      const hash = crypto
        .createHmac("sha256", hashKey)
        .update(hashStr)
        .digest("hex");

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Credentials: hash,
        },
        body: JSON.stringify({ ...payload, hash }),
      });

      const json = await res.json().catch(() => null);

      if (
        json &&
        (json.responseCode === "0000" ||
          json.orderStatus === "PAID" ||
          json.transactionStatus === "SUCCESS")
      ) {
        return {
          success: true,
          txnRefNo: json.transactionId || txnRefNo,
          responseCode: json.responseCode || "0000",
          responseMessage: json.responseDesc || "Approved",
        };
      }

      return {
        success: false,
        txnRefNo,
        responseCode: json?.responseCode,
        error:
          json?.responseDesc ||
          "EasyPaisa auto-debit request was not approved. Please verify your mobile account balance.",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "EasyPaisa gateway network error";
      return { success: false, txnRefNo, error: msg };
    }
  }

  // Production Gate: In live production, reject unconfigured gateways immediately
  if (process.env.NODE_ENV === "production" || process.env.STRICT_PAYMENTS === "true") {
    return {
      success: false,
      txnRefNo,
      error:
        "EasyPaisa direct debit gateway is not active. Please select Debit/Credit Card or contact administrator.",
    };
  }

  // Graceful Sandbox simulation ONLY in local development
  console.log(
    `[EasyPaisa Gateway] Development Sandbox Auto-Debit for ${cleanMobile} (Amount: PKR ${params.amount}).`
  );

  return {
    success: true,
    txnRefNo: `EP-AUTODEDUCT-${Date.now().toString().slice(-6)}`,
    responseCode: "0000",
    responseMessage: "Payment auto-deducted successfully via EasyPaisa Sandbox",
  };
}
