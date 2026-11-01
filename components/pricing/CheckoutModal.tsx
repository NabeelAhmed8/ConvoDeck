"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, CreditCard, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: "USD" | "PKR" | "AED" | "EUR";
  billingCycle: "monthly" | "yearly";
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
}

export function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const currencySymbols = {
    USD: "$",
    PKR: "₨ ",
    AED: "AED ",
    EUR: "€",
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Process subscription
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close checkout modal"
          className="absolute right-5 top-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {isSuccess ? (
          <div role="alert" className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <h3 id="checkout-title" className="text-xl font-black text-gray-900">
              Subscription Activated!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your workspace has been upgraded to the{" "}
              <strong className="text-gray-900">{plan.name} Plan</strong>. An
              official tax invoice has been sent to{" "}
              <strong className="text-gray-900">{email || "your email"}</strong>.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="whatsapp"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold"
              >
                Go to Workspace Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Secure Checkout
              </span>
              <h3 id="checkout-title" className="text-xl font-black text-gray-900 mt-2">
                Subscribe to {plan.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Complete your details to activate your multi-agent WhatsApp license.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-gray-900">{plan.name} Plan</p>
                <p className="text-xs text-gray-500 capitalize">
                  Billed {plan.billingCycle}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-gray-900">
                  {currencySymbols[plan.currency]}
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 block">
                  /{plan.billingCycle === "yearly" ? "year" : "mo"}
                </span>
              </div>
            </div>

            <form onSubmit={handleCheckout} aria-label="Subscription Payment Form" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="checkout-company-name"
                  name="company"
                  label="Company Name"
                  required
                  autoComplete="organization"
                  placeholder="e.g. Apex Media Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  id="checkout-billing-email"
                  name="email"
                  label="Billing Email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="billing@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Payment Method
                </span>
                <div role="radiogroup" aria-label="Payment method selection" className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                    Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "bank"}
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === "bank"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Building className="w-4 h-4" aria-hidden="true" />
                    Bank Wire / Invoice
                  </button>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-3 pt-1">
                  <Input
                    id="checkout-card-number"
                    name="cardNumber"
                    label="Card Number"
                    placeholder="4242 •••• •••• 4242"
                    autoComplete="cc-number"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="checkout-card-expiry"
                      name="cardExpiry"
                      label="Expiry (MM/YY)"
                      placeholder="12/28"
                      autoComplete="cc-exp"
                      required
                    />
                    <Input
                      id="checkout-card-cvc"
                      name="cardCvc"
                      label="CVC / CVV"
                      placeholder="123"
                      autoComplete="cc-csc"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-semibold mb-1">Corporate Bank / Wire Transfer</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    An official commercial invoice with direct IBAN / Wire details will be issued. Your plan unlocks immediately upon confirmation.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  {isProcessing
                    ? "Processing Payment..."
                    : `Pay ${currencySymbols[plan.currency]}${plan.price.toLocaleString()} & Activate`}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
                <span>🔒 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>Cancel Anytime</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
