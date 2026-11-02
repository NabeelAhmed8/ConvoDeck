"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { processSubscriptionCheckout } from "@/actions/subscriptionActions";
import { SubscriptionPlan, BillingFrequency, CurrencyCode } from "@/types";
import {
  PRICING_TABLE,
  CURRENCY_SYMBOLS,
  PaidPlanKey,
  isPaidPlan,
} from "@/constants/pricing";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const res = await processSubscriptionCheckout({
      plan: planKey,
      billingFrequency: billingCycle,
      currency,
      amount: totalPrice,
      companyName: companyName.trim() || "My Company",
      billingEmail: billingEmail.trim(),
      paymentMethod,
      cardLast4: cardNumber.replace(/\s/g, "").slice(-4) || "4242",
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
    <div className="min-h-screen bg-[#f3f6fa] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="fixed top-2.5 sm:top-5 inset-x-2 sm:inset-x-6 lg:inset-x-8 max-w-6xl mx-auto z-40 transition-all">
        <div className="neu-card rounded-2xl sm:rounded-full px-3 sm:px-6 h-15 sm:h-18 flex items-center justify-between border border-white/90 shadow-[8px_8px_24px_rgba(160,178,204,0.3),-8px_-8px_24px_#ffffff] bg-white/95 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" aria-label="ConvoDeck Home">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-base sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 block leading-none truncate">
                ConvoDeck
              </span>
              <span className="text-[8.5px] sm:text-[10px] text-blue-600 font-semibold uppercase tracking-wider block mt-0.5 truncate">
                Official Checkout Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-blue-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              256-Bit SSL Encrypted
            </span>
            <Link
              href="/billing"
              className="text-slate-600 hover:text-slate-900 neu-btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1 transition-all cursor-pointer bg-white whitespace-nowrap text-[11px] sm:text-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-10 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Left Column: Order Summary & Plan Features */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
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
                        planKey === p
                          ? "neu-tab-active"
                          : "neu-tab"
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
                  <label htmlFor="checkout-currency-select" className="block text-xs font-semibold text-slate-700 mb-1">
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
                  <label htmlFor="checkout-billing-cycle-select" className="block text-xs font-semibold text-slate-700 mb-1">
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

          {/* Right Column: Owner & Payment Checkout Form */}
          <div className="lg:col-span-7 neu-card rounded-3xl p-4 sm:p-8 md:p-10 space-y-5 sm:space-y-6 text-slate-800 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Workspace Owner & Payment Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your company information to activate your commercial WhatsApp license.
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
              {/* Step 1: Owner Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  1. Company & Owner Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    id="checkout-owner-name"
                    name="ownerName"
                    label="Account Owner Name"
                    required
                    autoComplete="name"
                    placeholder="e.g. Asad Ali"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />

                  <Input
                    id="checkout-company-name"
                    name="companyName"
                    label="Company / Agency Name"
                    required
                    autoComplete="organization"
                    placeholder="e.g. Apex Media Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                  <Input
                    id="checkout-billing-email"
                    name="billingEmail"
                    label="Work Billing Email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="asad@company.com"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                  />

                  <Input
                    id="checkout-whatsapp-phone"
                    name="whatsappPhone"
                    label="Owner WhatsApp Phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="e.g. +92 300 1234567"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="border-t border-slate-200/80 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  2. Select Payment Method
                </h3>

                <div className="neu-tab-container p-1 rounded-2xl xs:rounded-full grid grid-cols-1 xs:grid-cols-2 gap-1.5 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`px-2 py-2.5 sm:px-3 sm:py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "neu-tab-active"
                        : "neu-tab"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`px-2 py-2.5 sm:px-3 sm:py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                      paymentMethod === "bank"
                        ? "neu-tab-active"
                        : "neu-tab"
                    }`}
                  >
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Corporate Wire / Raast</span>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <div className="space-y-3 neu-pressed p-4 rounded-2xl">
                    <Input
                      id="checkout-card-number"
                      name="cardNumber"
                      label="Card Number"
                      required
                      autoComplete="cc-number"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        id="checkout-card-expiry"
                        name="cardExpiry"
                        label="Expiry Date"
                        required
                        autoComplete="cc-exp"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <Input
                        id="checkout-card-cvc"
                        name="cardCvc"
                        label="Security Code (CVV)"
                        required
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="neu-pressed p-4 rounded-2xl text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Building className="w-4 h-4 text-blue-600" />
                      Direct Corporate Wire & Raast Transfer
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your commercial invoice will be generated immediately. Transfer directly via Raast, IBAN, or Company Wire to complete activation.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Terms Agreement */}
              <div className="border-t border-slate-200/80 pt-4">
                <label htmlFor="checkout-agree-terms" className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    id="checkout-agree-terms"
                    name="agreeTerms"
                    type="checkbox"
                    aria-label="Agree to billing terms and terms of service"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I authorize ConvoDeck to bill my payment method for{" "}
                    <strong className="text-slate-900">
                      {symbol}
                      {totalPrice.toLocaleString()}
                    </strong>{" "}
                    per {billingCycle === "yearly" ? "year" : "month"}. I agree to the Terms of Service.
                  </span>
                </label>
              </div>

              {/* Complete Purchase Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 neu-btn-primary disabled:opacity-50 text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Lock className="w-4 h-4 text-white" />
                {loading
                  ? "Processing Payment..."
                  : `Pay ${symbol}${totalPrice.toLocaleString()} & Activate ${activePlan.name}`}
              </button>

              <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-4 pt-1">
                <span>🔒 Bank-Grade Security</span>
                <span>•</span>
                <span>Immediate Workspace Upgrade</span>
                <span>•</span>
                <span>Tax Invoice Provided</span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading checkout portal...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
