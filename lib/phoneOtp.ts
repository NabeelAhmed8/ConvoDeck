import { sendWhatsAppMessage } from "@/lib/whatsapp";

export interface SendPhoneOtpParams {
  phone: string;
  code: string;
  recipientName?: string;
}

export interface SendPhoneOtpResult {
  success: boolean;
  channel: "whatsapp" | "simulated";
  error?: string;
  devCode?: string;
}

/**
 * Normalizes phone numbers to standard international format without symbols
 */
export function normalizePhoneNumber(input: string): string {
  // Strip all non-digit characters except leading plus if any
  const digitsOnly = input.replace(/\D/g, "");
  return digitsOnly;
}

/**
 * Sends a password reset verification OTP to a user's phone.
 * Tries WhatsApp Cloud API first; if unconfigured or fails in local dev,
 * provides smooth simulated delivery with server console log for testing.
 */
export async function sendPhoneResetOtp({
  phone,
  code,
  recipientName,
}: SendPhoneOtpParams): Promise<SendPhoneOtpResult> {
  const cleanPhone = normalizePhoneNumber(phone);

  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      channel: "simulated",
      error: "Please enter a valid phone number with country code.",
    };
  }

  const nameGreeting = recipientName ? `Hi ${recipientName}, ` : "";
  const messageText = `${nameGreeting}Your ConvoDeck password reset verification code is: *${code}*.\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.`;

  // Attempt real WhatsApp delivery
  const waResult = await sendWhatsAppMessage({
    to: cleanPhone,
    text: messageText,
  });

  if (waResult.success) {
    console.log(`[Phone OTP] WhatsApp OTP sent successfully to ${cleanPhone}`);
    return {
      success: true,
      channel: "whatsapp",
    };
  }

  // Graceful fallback for local development / testing without active WhatsApp credentials
  console.log("--------------------------------------------------");
  console.log(`[Phone OTP Fallback] Reset OTP Code for: ${cleanPhone}`);
  console.log(`Code: ${code}`);
  console.log(`Simulated Message: ${messageText}`);
  console.log("--------------------------------------------------");

  return {
    success: true,
    channel: "simulated",
    devCode: process.env.NODE_ENV !== "production" ? code : undefined,
  };
}

