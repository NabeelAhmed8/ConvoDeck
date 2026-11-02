interface SendWhatsAppMessageParams {
  to: string; // recipient phone number with country code (e.g., 923001234567)
  text: string;
  phoneNumberId?: string;
  accessToken?: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a real WhatsApp message via Meta Cloud API v21.0
 */
export async function sendWhatsAppMessage({
  to,
  text,
  phoneNumberId,
  accessToken,
}: SendWhatsAppMessageParams): Promise<WhatsAppResponse> {
  const finalPhoneId =
    phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const finalToken =
    accessToken || process.env.WHATSAPP_ACCESS_TOKEN || "";

  // Clean phone number (strip non-digits)
  const cleanTo = to.replace(/\D/g, "");

  if (!cleanTo) {
    return { success: false, error: "Recipient phone number is invalid." };
  }

  // Check if WhatsApp credentials are configured
  if (!finalPhoneId || !finalToken) {
    return {
      success: false,
      error:
        "WhatsApp API credentials are not configured. Please enter your Phone Number ID and Access Token in Settings.",
    };
  }

  // Live Meta WhatsApp Cloud API call
  const url = `https://graph.facebook.com/v21.0/${finalPhoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${finalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Meta WhatsApp Cloud API Error]:", data);
      return {
        success: false,
        error: data.error?.message || "Meta API returned an error",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Network error";
    console.error("[Meta WhatsApp Network Error]:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Real Mark as Read on WhatsApp
 */
export async function markWhatsAppMessageAsRead(
  messageId: string,
  phoneNumberId?: string,
  accessToken?: string
) {
  const finalPhoneId =
    phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const finalToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!finalPhoneId || !finalToken || !messageId) return;

  try {
    await fetch(`https://graph.facebook.com/v21.0/${finalPhoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${finalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch (error) {
    console.error("Failed to mark WhatsApp message as read:", error);
  }
}
