import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export interface CreateCheckoutSessionParams {
  planName: string;
  planKey: string;
  amount: number; // In base currency units, e.g., 29 USD
  currency: string;
  billingFrequency: "monthly" | "yearly";
  customerEmail: string;
  companyName: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session for hosted checkout.
 * If STRIPE_SECRET_KEY is not configured, returns a mock session object for instant development testing.
 */
export async function createStripeSession(params: CreateCheckoutSessionParams) {
  if (stripe && stripeSecretKey) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: params.customerEmail,
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: `ConvoDeck ${params.planName} Plan (${params.billingFrequency})`,
                description: `Workspace: ${params.companyName} — Official WhatsApp Multi-Agent CRM`,
              },
              unit_amount: Math.round(params.amount * 100), // Stripe expects cents/lowest denom
            },
            quantity: 1,
          },
        ],
        metadata: {
          planKey: params.planKey,
          billingFrequency: params.billingFrequency,
          companyName: params.companyName,
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Stripe session creation failed";
      console.error("Stripe Error:", msg);
      return { success: false, error: msg };
    }
  }

  // Graceful fallback for local development or when Stripe keys are not yet added
  const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 12)}`;
  return {
    success: true,
    sessionId: mockSessionId,
    url: null, // local checkout completed directly
    isMock: true,
  };
}
