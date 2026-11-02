"use client";

import React from "react";
import { CreditCard, ShieldCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface StripePaymentSectionProps {
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardExpiry: string;
  setCardExpiry: (val: string) => void;
  cardCvc: string;
  setCardCvc: (val: string) => void;
}

export function StripePaymentSection({
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvc,
  setCardCvc,
}: StripePaymentSectionProps) {
  // Format card number with spaces (4-4-4-4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Format expiry with slash (MM / YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.substring(0, 2)} / ${raw.substring(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Format CVC to numbers only
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCardCvc(raw);
  };

  return (
    <div className="border-t border-slate-200/80 pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          2. Payment Method (Stripe)
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* Stripe Payment Card Box */}
      <div className="neu-pressed p-4 sm:p-5 rounded-2xl space-y-3.5 bg-slate-50/60 border border-slate-200/60">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">
              Credit or Debit Card
            </span>
          </div>

          {/* Card Brands */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
              VISA
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
              MC
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
              AMEX
            </span>
          </div>
        </div>

        <Input
          id="checkout-card-number"
          name="cardNumber"
          label="Card Number"
          required
          autoComplete="cc-number"
          placeholder="4242 •••• •••• 4242"
          value={cardNumber}
          onChange={handleCardNumberChange}
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
            onChange={handleExpiryChange}
          />
          <Input
            id="checkout-card-cvc"
            name="cardCvc"
            label="Security Code (CVC)"
            required
            autoComplete="cc-csc"
            placeholder="123"
            value={cardCvc}
            onChange={handleCvcChange}
          />
        </div>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Encrypted with Stripe end-to-end 256-bit SSL. PCI DSS Level 1 Certified.
          </span>
        </div>
      </div>
    </div>
  );
}
