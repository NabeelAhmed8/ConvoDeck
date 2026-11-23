"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft, AlertCircle, Lock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  processSubscriptionCheckout,
  startHostedSubscriptionCheckout,
} from "@/actions/subscriptionActions";
import { getCurrentUser } from "@/actions/authActions";
import { getWorkspaceSettings } from "@/actions/workspaceActions";
import { BillingFrequency, CurrencyCode } from "@/types";
import {
  PRICING_TABLE,
  CURRENCY_SYMBOLS,
  PaidPlanKey,
  isPaidPlan,
} from "@/constants/pricing";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { CustomerBillingForm } from "@/components/checkout/CustomerBillingForm";
import {
  PaymentMethodSection,
  PaymentMethodType,
} from "@/components/checkout/PaymentMethodSection";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params
  const rawParamPlan = searchParams.get("plan");
  const paramPlan: PaidPlanKey = isPaidPlan(rawParamPlan) ? rawParamPlan : "growth";
  const paramBilling = (searchParams.get("billing") as BillingFrequency) || "monthly";
  const paramCurrency = (searchParams.get("currency") as CurrencyCode) || "PKR";

  const [planKey, setPlanKey] = useState<PaidPlanKey>(paramPlan);
  const [currentPlan, setCurrentPlan] = useState<string>("trial");
  const [billingCycle, setBillingCycle] = useState<BillingFrequency>(
    paramBilling === "yearly" ? "yearly" : "monthly"
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    CURRENCY_SYMBOLS[paramCurrency] ? paramCurrency : "PKR"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    paramCurrency === "PKR" ? "jazzcash" : "card"
  );

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-populate logged-in user profile & workspace data if available
  useEffect(() => {
    async function loadExistingInfo() {
      try {
        const userRes = await getCurrentUser();
        if (userRes?.user) {
          if (userRes.user.name) setOwnerName(userRes.user.name);
          if (userRes.user.email) setBillingEmail(userRes.user.email);
        }
        const wsRes = await getWorkspaceSettings();
        if (wsRes) {
          if (wsRes.name) setCompanyName(wsRes.name);
          if (wsRes.contactEmail) setBillingEmail(wsRes.contactEmail);
          if (wsRes.whatsappPhoneNumber) setWhatsappPhone(wsRes.whatsappPhoneNumber);
          if (wsRes.plan) setCurrentPlan(wsRes.plan);
        }
      } catch {
        // Safe guest fallback
      }
    }
    loadExistingInfo();
  }, []);

  const PLAN_TIERS: Record<string, number> = {
    trial: 0,
    starter: 1,
    growth: 2,
    enterprise: 3,
  };
  const curTier = PLAN_TIERS[currentPlan.toLowerCase()] ?? 0;
  const targetTier = PLAN_TIERS[planKey.toLowerCase()] ?? 1;
  const isUpgrade = targetTier > curTier;
  const isDowngrade = targetTier < curTier;
  const isCurrent = targetTier === curTier && currentPlan !== "trial";

  const actionVerb = isCurrent
    ? "Renew"
    : isUpgrade
    ? curTier === 0 ? "Subscribe to" : "Upgrade to"
    : "Downgrade to";

  const activePlan = PRICING_TABLE[planKey] || PRICING_TABLE.growth;
  const unitPrice = activePlan.prices[currency][billingCycle];
  const totalPrice = billingCycle === "yearly" ? unitPrice * 12 : unitPrice;
  const symbol = CURRENCY_SYMBOLS[currency];

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please accept the terms of service to proceed.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await startHostedSubscriptionCheckout({
      planKey,
      billingFrequency: billingCycle,
      currency,
      companyName: companyName.trim() || "My Company",
      billingEmail: billingEmail.trim(),
      paymentMethod,
    });

    if (!res.success) {
      setError(res.error || "Hosted checkout could not be initialized.");
      setLoading(false);
      return;
    }

    if (res.redirectType === "get") {
      window.location.href = res.url;
    } else {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.actionUrl;
      Object.entries(res.fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf0f7] text-slate-900 selection:bg-[#ff6422] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-2.5 sm:top-5 inset-x-2 sm:inset-x-6 lg:inset-x-8 max-w-6xl mx-auto z-40 transition-all">
        <div className="neu-card rounded-2xl sm:rounded-full px-3 sm:px-6 h-15 sm:h-18 flex items-center justify-between border border-white/80 bg-[#edf1f7]/95 backdrop-blur-md">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 sm:gap-3 group min-w-0"
            aria-label="ConvoDeck Dashboard"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 block leading-none truncate">
                ConvoDeck
              </span>
              <span className="text-[8.5px] sm:text-[10px] text-[#ff6422] font-semibold uppercase tracking-wider block mt-0.5 truncate">
                Secure Checkout • JazzCash / EasyPaisa / Card
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Pakistani Instant Activation
            </span>
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 neu-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-10 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Left Column: Order Summary & Inclusions */}
          <div className="lg:col-span-5">
            <OrderSummaryCard
              planKey={planKey}
              setPlanKey={setPlanKey}
              billingCycle={billingCycle}
              setBillingCycle={setBillingCycle}
              currency={currency}
              setCurrency={setCurrency}
              totalPrice={totalPrice}
              symbol={symbol}
              currentPlan={currentPlan}
            />
          </div>

          {/* Right Column: Customer Details & Multi-Payment Method */}
          <div className="lg:col-span-7 neu-card rounded-3xl p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6 text-slate-800 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Workspace Owner & Payment Method
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pay via JazzCash, EasyPaisa, or Debit/Credit Card.
              </p>
            </div>

            {/* Plan Tier Status Indicator (Upgrade / Downgrade / Current) */}
            {curTier > 0 && (
              <div
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                  isUpgrade
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isDowngrade
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isUpgrade ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isDowngrade ? (
                    <ArrowDownRight className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span>
                    {isUpgrade
                      ? `Upgrading from ${currentPlan.toUpperCase()} to ${planKey.toUpperCase()} Plan`
                      : isDowngrade
                      ? `Downgrading from ${currentPlan.toUpperCase()} to ${planKey.toUpperCase()} Plan`
                      : `Currently subscribed to ${currentPlan.toUpperCase()} Plan`}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/80">
                  {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Current"}
                </span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCompletePayment} className="space-y-5">
              {/* Step 1: Customer Profile */}
              <CustomerBillingForm
                ownerName={ownerName}
                setOwnerName={setOwnerName}
                companyName={companyName}
                setCompanyName={setCompanyName}
                billingEmail={billingEmail}
                setBillingEmail={setBillingEmail}
                whatsappPhone={whatsappPhone}
                setWhatsappPhone={setWhatsappPhone}
              />

              {/* Step 2: Multi-Method Payment Selector */}
              <PaymentMethodSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                totalAmount={totalPrice}
                currencySymbol={symbol}
              />

              {/* Step 3: Terms Agreement */}
              <div className="border-t border-slate-200/80 pt-4 flex items-start gap-2.5">
                <input
                  id="checkout-agree-terms"
                  name="agreeTerms"
                  type="checkbox"
                  aria-label="Agree to billing terms and terms of service"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#ff6422] focus:ring-[#ff6422] cursor-pointer"
                />
                <label
                  htmlFor="checkout-agree-terms"
                  className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#ea5414] underline hover:text-[#ff6422]">
                    Terms of Service
                  </Link>{" "}
                  and authorized payment of{" "}
                  <strong>
                    {symbol}
                    {totalPrice.toLocaleString()}
                  </strong>{" "}
                  /{billingCycle}.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full neu-btn-primary py-3.5 text-sm font-black rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>
                  {loading
                    ? "Redirecting to Hosted Portal..."
                    : paymentMethod === "jazzcash"
                    ? `Proceed to JazzCash Portal (${symbol}${totalPrice.toLocaleString()})`
                    : paymentMethod === "easypaisa"
                    ? `Proceed to EasyPaisa Portal (${symbol}${totalPrice.toLocaleString()})`
                    : `Proceed to Stripe Card Checkout (${symbol}${totalPrice.toLocaleString()})`}
                </span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f6fa]" />}>
      <CheckoutContent />
    </Suspense>
  );
}
