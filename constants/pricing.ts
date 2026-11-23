import { BillingFrequency, CurrencyCode } from "@/types";

export type PaidPlanKey = "starter" | "growth" | "enterprise";

export interface PlanDetails {
  name: string;
  badge: string;
  agents: string;
  description?: string;
  popular?: boolean;
  prices: Record<CurrencyCode, Record<BillingFrequency, number>>;
  features: string[];
}

export const PRICING_TABLE: Record<PaidPlanKey, PlanDetails> = {
  starter: {
    name: "Starter",
    badge: "Solo Business",
    agents: "2 Team Agents",
    description: "For small businesses, shops & boutique teams starting out with WhatsApp.",
    prices: {
      USD: { monthly: 10, yearly: 8 },
      PKR: { monthly: 2999, yearly: 2499 },
      AED: { monthly: 39, yearly: 32 },
      EUR: { monthly: 10, yearly: 8 },
    },
    features: [
      "2 Authorized Sales Agent Logins",
      "1 Official WhatsApp Business Line",
      "Visual Drag-and-Drop Sales Pipeline",
      "Unified Multi-Agent WhatsApp Inbox",
      "Website Lead Capture Webhook",
      "1,000 Active Contacts",
      "Standard WhatsApp & Chat Support",
    ],
  },
  growth: {
    name: "Growth",
    badge: "Most Popular",
    agents: "5 Team Agents",
    popular: true,
    description: "For high-velocity agencies and scaling sales teams handling high chat volume.",
    prices: {
      USD: { monthly: 25, yearly: 20 },
      PKR: { monthly: 6999, yearly: 5599 },
      AED: { monthly: 95, yearly: 79 },
      EUR: { monthly: 24, yearly: 19 },
    },
    features: [
      "5 Authorized Sales Agent Logins",
      "1 Official WhatsApp Business Line",
      "Unlimited Active Contacts & Chat History",
      "Instant Automated Inbound Lead Responses",
      "Custom Pipeline Funnel Stages & Deal Values",
      "Internal Customer Notes & Stage Assignment",
      "Real-Time Delivery & Read Receipts",
      "Priority 24/7 WhatsApp Specialist Support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    badge: "Scale & Custom",
    agents: "15+ Team Agents",
    description: "For large sales departments needing custom integrations and dedicated support.",
    prices: {
      USD: { monthly: 55, yearly: 45 },
      PKR: { monthly: 14999, yearly: 11999 },
      AED: { monthly: 199, yearly: 165 },
      EUR: { monthly: 52, yearly: 42 },
    },
    features: [
      "15+ Authorized Sales Agent Logins",
      "Multiple WhatsApp Business Phone Lines",
      "Custom REST API & Webhook Access",
      "Dedicated Onboarding & Account Manager",
      "Team Performance & Audit Trail Analytics",
      "99.9% Uptime SLA Guarantee",
    ],
  },
};

export interface LocalPaymentDetails {
  jazzcash: {
    title: string;
    accountNumber: string;
    tillId?: string;
    instructions: string;
  };
  easypaisa: {
    title: string;
    accountNumber: string;
    instructions: string;
  };
}

export const PAKISTANI_PAYMENT_DETAILS: LocalPaymentDetails = {
  jazzcash: {
    title: "ConvoDeck Official Payments",
    accountNumber: "",
    tillId: "",
    instructions: "Official JazzCash Hosted Payment Gateway.",
  },
  easypaisa: {
    title: "ConvoDeck Official Payments",
    accountNumber: "",
    instructions: "Official EasyPaisa EasyPay Hosted Gateway.",
  },
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  PKR: "₨ ",
  AED: "AED ",
  EUR: "€",
};

export const CURRENCIES: CurrencyCode[] = ["USD", "PKR", "AED", "EUR"];

export function isPaidPlan(p: string | null): p is PaidPlanKey {
  return p === "starter" || p === "growth" || p === "enterprise";
}
