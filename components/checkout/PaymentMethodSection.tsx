"use client";

import React from "react";
import { CreditCard, ShieldCheck, ExternalLink, Lock, Zap } from "lucide-react";

export type PaymentMethodType = "safepay" | "card";

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (method: PaymentMethodType) => void;
  totalAmount: number;
  currencySymbol: string;
}

export function PaymentMethodSection({
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  currencySymbol,
}: PaymentMethodSectionProps) {
  return (
    <div className="border-t border-slate-200/80 pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          2. Select Payment Method
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Hosted Redirection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={() => setPaymentMethod("safepay")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
            paymentMethod === "safepay"
              ? "bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20"
              : "bg-[#edf1f7] border-slate-300/60 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center justify-between w-full h-8">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/payments/jazzcash.png"
                alt="JazzCash"
                className="h-7 w-auto object-contain"
              />
              <img
                src="/images/payments/easypaisa.png"
                alt="EasyPaisa"
                className="h-5 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Safepay (PK)
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>Safepay Official Gateway</span>
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            </p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Pay with JazzCash, EasyPaisa, or Pakistani Debit/Credit Cards
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
            paymentMethod === "card"
              ? "bg-orange-50/80 border-[#ff6422] shadow-md ring-2 ring-[#ff6422]/20"
              : "bg-[#edf1f7] border-slate-300/60 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center justify-between w-full h-8">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#ff6422]" />
              <span className="text-xs font-black text-slate-900">International Card</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 uppercase">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">VISA</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">MC</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Stripe Card Checkout</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Visa, Mastercard, & American Express
            </p>
          </div>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {paymentMethod === "safepay"
                ? "Official Safepay Gateway (JazzCash, EasyPaisa, & Pakistani Cards)"
                : "Stripe 256-bit Encrypted Card Checkout"}
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </span>
            {paymentMethod === "safepay" && (
              <div className="flex items-center gap-2">
                <img
                  src="/images/payments/jazzcash.png"
                  alt="JazzCash"
                  className="h-4 w-auto object-contain"
                />
                <img
                  src="/images/payments/easypaisa.png"
                  alt="EasyPaisa"
                  className="h-3 w-auto object-contain"
                />
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Clicking the button below will securely redirect you to the official banking portal to authorize payment of{" "}
            <strong className="text-slate-900">
              {currencySymbol}{totalAmount.toLocaleString()}
            </strong>
            . No banking credentials, PINs, or card numbers are entered or stored on ConvoDeck.
          </p>
        </div>
      </div>
    </div>
  );
}
