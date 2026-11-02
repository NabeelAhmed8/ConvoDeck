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
    description: "For small businesses & boutique sales teams starting out with WhatsApp.",
    prices: {
      USD: { monthly: 29, yearly: 24 },
      PKR: { monthly: 8500, yearly: 6800 },
      AED: { monthly: 109, yearly: 89 },
      EUR: { monthly: 27, yearly: 22 },
    },
    features: [
      "2 Authorized Sales Agent Logins",
      "1 Official WhatsApp Business Line",
      "Visual Drag-and-Drop Sales Pipeline",
      "Unified Multi-Agent WhatsApp Inbox",
      "Website Lead Capture Webhook",
      "1,000 Active Contacts",
      "Standard Email & Chat Support",
    ],
  },
  growth: {
    name: "Growth",
    badge: "Most Popular",
    agents: "5 Team Agents",
    popular: true,
    description: "For high-velocity agencies and scaling sales teams handling high chat volume.",
    prices: {
      USD: { monthly: 69, yearly: 55 },
      PKR: { monthly: 19500, yearly: 15500 },
      AED: { monthly: 255, yearly: 205 },
      EUR: { monthly: 64, yearly: 51 },
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
      USD: { monthly: 149, yearly: 119 },
      PKR: { monthly: 42000, yearly: 33500 },
      AED: { monthly: 550, yearly: 440 },
      EUR: { monthly: 139, yearly: 111 },
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
