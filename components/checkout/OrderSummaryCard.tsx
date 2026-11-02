"use client";

import React from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { BillingFrequency, CurrencyCode } from "@/types";
import {
  PRICING_TABLE,
  PaidPlanKey,
} from "@/constants/pricing";

interface OrderSummaryCardProps {
  planKey: PaidPlanKey;
  setPlanKey: (plan: PaidPlanKey) => void;
  billingCycle: BillingFrequency;
  setBillingCycle: (cycle: BillingFrequency) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  totalPrice: number;
  symbol: string;
}

export function OrderSummaryCard({
  planKey,
  setPlanKey,
  billingCycle,
  setBillingCycle,
  currency,
  setCurrency,
  totalPrice,
  symbol,
}: OrderSummaryCardProps) {
  const activePlan = PRICING_TABLE[planKey] || PRICING_TABLE.growth;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="neu-card rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 text-slate-800 bg-white">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Order Summary
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ConvoDeck Workspace License
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unlimited multi-agent access to your WhatsApp Business inbox and CRM.
          </p>
        </div>

        {/* Plan Switcher Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Select Subscription Plan
          </label>
          <div className="neu-tab-container p-1 rounded-full grid grid-cols-3 gap-1">
            {(["starter", "growth", "enterprise"] as PaidPlanKey[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlanKey(p)}
                className={`px-1.5 py-2 sm:p-2.5 rounded-full text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer text-center truncate ${
                  planKey === p ? "neu-tab-active" : "neu-tab"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Currency & Billing Switcher */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
          <div>
            <label
              htmlFor="checkout-currency-select"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Currency
            </label>
            <select
              id="checkout-currency-select"
              name="currency"
              aria-label="Billing Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 text-xs neu-input rounded-full text-slate-900 focus:outline-none font-semibold"
            >
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (₨)</option>
              <option value="AED">AED (AED)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="checkout-billing-cycle-select"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Billing Cycle
            </label>
            <select
              id="checkout-billing-cycle-select"
              name="billingCycle"
              aria-label="Billing Cycle"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingFrequency)}
              className="w-full px-3 py-2 text-xs neu-input rounded-full text-slate-900 focus:outline-none font-semibold"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly (Save 20%)</option>
            </select>
          </div>
        </div>

        {/* Line Item Breakdown */}
        <div className="border-t border-slate-200/80 pt-5 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span>
              {activePlan.name} Plan ({activePlan.agents})
            </span>
            <span className="font-bold text-slate-900">
              {symbol}
              {totalPrice.toLocaleString()}
            </span>
          </div>

          {billingCycle === "yearly" && (
            <div className="flex items-center justify-between text-blue-600 font-semibold">
              <span>Annual Pre-pay Savings (20%)</span>
              <span>Applied ✓</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-500">
            <span>Estimated Taxes & Setup Fees</span>
            <span>{symbol}0.00</span>
          </div>

          <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between text-base">
            <span className="font-bold text-slate-900">Total Due Today</span>
            <div className="text-right">
              <span className="font-black text-2xl text-blue-600">
                {symbol}
                {totalPrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block">
                /{billingCycle === "yearly" ? "year" : "month"}
              </span>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="border-t border-slate-200/80 pt-5 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Plan Inclusions:
          </p>
          {activePlan.features.map((feat: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantee Pill */}
      <div className="p-4 rounded-2xl neu-card flex items-center gap-3 text-xs text-slate-600 bg-white">
        <Lock className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          30-day money-back guarantee. No questions asked. Cancel anytime from your billing settings.
        </span>
      </div>
    </div>
  );
}
