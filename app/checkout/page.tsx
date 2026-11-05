"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { processSubscriptionCheckout } from "@/actions/subscriptionActions";
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
import { StripePaymentSection } from "@/components/checkout/StripePaymentSection";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params
  const rawParamPlan = searchParams.get("plan");
  const paramPlan: PaidPlanKey = isPaidPlan(rawParamPlan) ? rawParamPlan : "growth";
  const paramBilling = (searchParams.get("billing") as BillingFrequency) || "monthly";
  const paramCurrency = (searchParams.get("currency") as CurrencyCode) || "USD";

  const [planKey, setPlanKey] = useState<PaidPlanKey>(paramPlan);
  const [billingCycle, setBillingCycle] = useState<BillingFrequency>(
    paramBilling === "yearly" ? "yearly" : "monthly"
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    CURRENCY_SYMBOLS[paramCurrency] ? paramCurrency : "USD"
  );

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
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
        }
      } catch {
        // Safe guest fallback
      }
    }
    loadExistingInfo();
  }, []);

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

    const cardClean = cardNumber.replace(/\s/g, "");
    const res = await processSubscriptionCheckout({
      plan: planKey,
      billingFrequency: billingCycle,
      currency,
      amount: totalPrice,
      companyName: companyName.trim() || "My Company",
      billingEmail: billingEmail.trim(),
      paymentMethod: "stripe",
      cardLast4: cardClean.slice(-4) || "4242",
    });

    if (res.success) {
      router.push(
        `/checkout/success?invoiceId=${res.invoiceId}&plan=${planKey}&amount=${totalPrice}&currency=${currency}`
      );
    } else {
      setError(res.error || "Payment transaction could not be completed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf0f7] text-slate-900 selection:bg-[#ff6422] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-2.5 sm:top-5 inset-x-2 sm:inset-x-6 lg:inset-x-8 max-w-6xl mx-auto z-40 transition-all">
        <div className="neu-card rounded-2xl sm:rounded-full px-3 sm:px-6 h-15 sm:h-18 flex items-center justify-between border border-white/80 bg-[#edf1f7]/95 backdrop-blur-md">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group min-w-0"
            aria-label="ConvoDeck Home"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 block leading-none truncate">
                ConvoDeck
              </span>
              <span className="text-[8.5px] sm:text-[10px] text-[#ff6422] font-semibold uppercase tracking-wider block mt-0.5 truncate">
                Official Stripe Checkout
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-[#ff6422] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Stripe 256-Bit SSL
            </span>
            <Link
              href="/billing"
              className="text-slate-600 hover:text-slate-900 neu-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
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
            />
          </div>

          {/* Right Column: Customer Details & Stripe Payment */}
          <div className="lg:col-span-7 neu-card rounded-3xl p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6 text-slate-800 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Workspace Owner & Stripe Payment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your transaction securely through Stripe to activate your WhatsApp workspace license.
              </p>
            </div>

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

              {/* Step 2: Stripe Payment (Corporate Wire / Raast removed) */}
              <StripePaymentSection
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardExpiry={cardExpiry}
                setCardExpiry={setCardExpiry}
                cardCvc={cardCvc}
                setCardCvc={setCardCvc}
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
                  and authorized billing recurring renewal at{" "}
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
                    ? "Processing with Stripe..."
                    : `Pay ${symbol}${totalPrice.toLocaleString()} with Stripe`}
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
