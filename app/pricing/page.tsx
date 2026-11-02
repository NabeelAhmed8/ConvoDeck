import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PricingSection } from "@/components/pricing/PricingSection";

export const metadata = {
  title: "Pricing Plans & Multi-Agent Licenses | ConvoDeck",
  description: "Simple, flexible pricing plans for sales teams of any size. Choose your currency and upgrade your WhatsApp sales engine today.",
};

export default function PricingPage() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-clip bg-[#f3f6fa] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Floating Neumorphic Bar */}
      <nav className="fixed top-2.5 sm:top-5 inset-x-2.5 sm:inset-x-6 lg:inset-x-8 max-w-6xl mx-auto z-50 transition-all">
        <div className="neu-card rounded-2xl sm:rounded-full px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between border border-white/90 shadow-[8px_8px_24px_rgba(160,178,204,0.3),-8px_-8px_24px_#ffffff] bg-white/95 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-lg sm:text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block leading-none">
                ConvoDeck
              </span>
              <span className="text-[9px] sm:text-[10px] text-blue-600 font-semibold tracking-wider uppercase block mt-0.5">
                Pricing & Licenses
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all neu-btn px-4 py-2 rounded-full bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Back to</span> Home
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 neu-btn-primary text-white rounded-full text-xs font-bold transition-all shadow-md whitespace-nowrap shrink-0"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 sm:pt-36 pb-10 sm:pb-16 px-3 sm:px-6 w-full max-w-full overflow-x-clip">
        <PricingSection />
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 text-slate-500 text-xs text-center bg-white pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
        <p>© 2026 ConvoDeck. Official WhatsApp Business Cloud Solutions.</p>
      </footer>
    </div>
  );
}
