"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Layers, MessageSquare } from "lucide-react";
import { CURRENCY_SYMBOLS } from "@/constants/pricing";
import { CurrencyCode } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId") || "INV-2026-891024";
  const plan = searchParams.get("plan") || "Growth";
  const amount = searchParams.get("amount") || "69";
  const currency = (searchParams.get("currency") as CurrencyCode) || "USD";
  const symbol = CURRENCY_SYMBOLS[currency] || "$";

  return (
    <div className="min-h-screen bg-[#ebf0f7] text-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-xl mx-auto w-full relative z-10 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center mx-auto mb-6 bg-[#edf1f7]">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#ea5414] neu-pressed px-3 py-1 rounded-full border border-orange-200 bg-orange-50">
          Payment Confirmed
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
          Welcome to ConvoDeck Paid!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Your workspace has been upgraded to the <strong className="text-slate-900 capitalize">{plan} Plan</strong>. All team agent limits and WhatsApp capabilities are now unlocked.
        </p>

        {/* Invoice Summary Card */}
        <div className="mt-8 neu-card rounded-3xl p-5 sm:p-6 text-left space-y-4 bg-[#edf1f7] text-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-300/40">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Invoice Number</span>
              <p className="font-mono font-bold text-sm text-slate-900">{invoiceId}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#ea5414] text-xs font-bold border border-orange-200">
              Paid in Full
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 block text-[11px]">Subscribed Plan</span>
              <span className="font-bold text-slate-900 capitalize">{plan} Plan</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Amount Paid</span>
              <span className="font-bold text-[#ff6422]">
                {symbol}{Number(amount).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Payment Date</span>
              <span className="font-medium text-slate-900">{new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">License Status</span>
              <span className="font-bold text-[#ea5414]">Active & Verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 neu-btn-primary text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Layers className="w-4 h-4 text-white" />
            Go to Sales Dashboard
          </Link>
          <Link
            href="/chat"
            className="w-full sm:w-auto px-7 py-3.5 neu-btn text-slate-800 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#ff6422]" />
            Open WhatsApp Inbox
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ebf0f7] flex items-center justify-center text-xs text-slate-500">
          Loading receipt...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
