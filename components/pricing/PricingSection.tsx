"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { SubscriptionPlan, BillingFrequency, CurrencyCode } from "@/types";

export function PricingSection({ className }: { className?: string }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [billingCycle, setBillingCycle] = useState<BillingFrequency>("monthly");

  const pricingData = {
    starter: {
      name: "Starter",
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
      description: "For large sales departments needing custom integrations and dedicated support.",
      prices: {
        USD: { monthly: 149, yearly: 119 },
        PKR: { monthly: 42000, yearly: 33500 },
        AED: { monthly: 550, yearly: 440 },
        EUR: { monthly: 139, yearly: 111 },
      },
      features: [
        "15+ Team Agent Logins",
        "Multiple WhatsApp Business Phone Numbers",
        "Custom Webhook Events & REST API Access",
        "Dedicated Account & Onboarding Manager",
        "Advanced Agent Performance Reporting",
        "Custom Training for Sales Representatives",
        "99.9% High Availability SLA Guarantee",
      ],
    },
  };

  const currencySymbols: Record<CurrencyCode, string> = {
    USD: "$",
    PKR: "₨ ",
    AED: "AED ",
    EUR: "€",
  };

  const getCheckoutUrl = (planKey: SubscriptionPlan) => {
    return `/checkout?plan=${planKey}&billing=${billingCycle}&currency=${currency}`;
  };

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2.5 sm:mb-3 inline-block">
          Simple, Transparent Plans
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Invest in your sales pipeline. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            No hidden fees. Cancel anytime.
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto px-2">
          Choose the right plan for your team size. Switch currencies anytime to view pricing in your local currency.
        </p>

        {/* Currency Switcher */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Currency:</span>
          <div className="neu-tab-container p-1 rounded-full inline-flex items-center justify-center gap-1 sm:gap-1.5 max-w-full">
            {(["USD", "PKR", "AED", "EUR"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                  currency === c
                    ? "neu-tab-active"
                    : "neu-tab"
                }`}
              >
                <span>{c}</span>
                <span className="hidden min-[400px]:inline ml-1 font-normal opacity-80">
                  ({currencySymbols[c].trim()})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mt-4 inline-flex items-center justify-center p-1 rounded-full neu-tab-container max-w-full">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap ${
              billingCycle === "monthly"
                ? "neu-tab-active"
                : "neu-tab"
            }`}
          >
            <span>Monthly</span>
            <span className="hidden min-[380px]:inline ml-1">Billing</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-3 sm:px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center whitespace-nowrap ${
              billingCycle === "yearly"
                ? "neu-tab-active"
                : "neu-tab"
            }`}
          >
            <span>Annual</span>
            <span className="hidden min-[380px]:inline ml-1">Billing</span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] sm:text-[10px] font-black shadow-xs shrink-0">
              <span className="hidden min-[380px]:inline">Save </span>20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* 1. Starter Plan */}
        <div className="neu-card neu-card-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-white text-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{pricingData.starter.name}</h3>
            <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
              {pricingData.starter.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">
                {currencySymbols[currency]}
                {pricingData.starter.prices[currency][billingCycle].toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/agent-team /mo</span>
            </div>
            {billingCycle === "yearly" && (
              <span className="text-[11px] text-blue-600 font-medium block mt-1">
                Billed annually ({currencySymbols[currency]}
                {(pricingData.starter.prices[currency].yearly * 12).toLocaleString()}/yr)
              </span>
            )}

            <div className="mt-8 border-t border-slate-200/80 pt-6 space-y-3">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                What&apos;s Included:
              </p>
              {pricingData.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <Link
              href={getCheckoutUrl("starter")}
              className="w-full py-3.5 rounded-full neu-btn text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Choose Starter
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Growth Plan (Featured) */}
        <div className="relative neu-convex rounded-3xl border-2 border-blue-600 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-900 shadow-xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
            Most Popular & Recommended
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">{pricingData.growth.name}</h3>
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
              {pricingData.growth.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">
                {currencySymbols[currency]}
                {pricingData.growth.prices[currency][billingCycle].toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/agent-team /mo</span>
            </div>
            {billingCycle === "yearly" && (
              <span className="text-[11px] text-blue-600 font-medium block mt-1">
                Billed annually ({currencySymbols[currency]}
                {(pricingData.growth.prices[currency].yearly * 12).toLocaleString()}/yr)
              </span>
            )}

            <div className="mt-8 border-t border-slate-200/80 pt-6 space-y-3">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Everything in Starter, plus:
              </p>
              {pricingData.growth.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <Link
              href={getCheckoutUrl("growth")}
              className="w-full py-3.5 rounded-full neu-btn-primary text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              Subscribe to Growth Plan
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>

        {/* 3. Enterprise Plan */}
        <div className="neu-card neu-card-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-white text-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{pricingData.enterprise.name}</h3>
            <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
              {pricingData.enterprise.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">
                {currencySymbols[currency]}
                {pricingData.enterprise.prices[currency][billingCycle].toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/enterprise /mo</span>
            </div>
            {billingCycle === "yearly" && (
              <span className="text-[11px] text-blue-600 font-medium block mt-1">
                Billed annually ({currencySymbols[currency]}
                {(pricingData.enterprise.prices[currency].yearly * 12).toLocaleString()}/yr)
              </span>
            )}

            <div className="mt-8 border-t border-slate-200/80 pt-6 space-y-3">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Full Power & Customization:
              </p>
              {pricingData.enterprise.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <Link
              href={getCheckoutUrl("enterprise")}
              className="w-full py-3.5 rounded-full neu-btn text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Choose Enterprise
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-10 sm:mt-12 max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl sm:rounded-full neu-card text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:text-xs text-slate-600 bg-white">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          14-Day Free Evaluation
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 hidden sm:inline-block" />
          Official Meta Cloud API Compliant
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 hidden sm:inline-block" />
          Instant Agent Provisioning
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 hidden sm:inline-block" />
          No Contract Lock-in
        </span>
      </div>
    </div>
  );
}
