import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { PublicLeadForm } from "@/components/landing/PublicLeadForm";
import { PricingSection } from "@/components/pricing/PricingSection";

export default function LandingPage() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-clip bg-[#f3f6fa] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Responsive Navigation Header */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-14 sm:pb-20 px-3 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full neu-pressed text-blue-700 text-[11px] sm:text-xs font-semibold mb-6 border border-blue-200 bg-white max-w-full">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <span className="truncate">Official WhatsApp Business API Platform</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.15] sm:leading-[1.1] text-slate-900 break-words">
            Turn WhatsApp into your <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
              #1 Sales Conversion Machine.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate single-device phone limits, missed follow-ups, and lost leads. Equip your entire sales team with a unified WhatsApp inbox and a visual sales pipeline.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 neu-btn-primary text-white font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              Start Free Workspace
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-7 py-3.5 neu-btn text-slate-800 font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              View Pricing Plans
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Shared Team Inbox
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Visual Sales Funnel
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Instant Lead Sync
            </span>
          </div>
        </div>
      </section>

      {/* Core Pain Points Solved */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
              Built for Modern Sales Teams
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Why growing businesses choose ConvoDeck
            </h3>
            <p className="mt-3 text-slate-600 text-xs sm:text-sm">
              Move beyond single phones and scattered chats. Centralize your sales communications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Zero Missed Opportunities",
                desc: "High chat volume causes hot inquiries to get buried. Keep track of every follow-up with real-time alerts.",
                solution: "Centralized inbox with complete chat history.",
              },
              {
                title: "Multiple Team Logins",
                desc: "Never pass a single phone around the office. Connect your entire sales department at once.",
                solution: "Unlimited authorized agent access.",
              },
              {
                title: "Pipeline Transparency",
                desc: "Know exactly which leads have received quotations, who is awaiting a demo, and who is ready to buy.",
                solution: "Visual drag-and-drop lead stages.",
              },
              {
                title: "Instant Inbound Capture",
                desc: "Incoming inquiries from ads, websites, or social media are instantly directed to the right agent.",
                solution: "Real-time automated notification & sync.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl neu-card neu-card-hover bg-white text-slate-800"
              >
                <div className="w-8 h-8 rounded-full neu-pressed text-blue-600 flex items-center justify-center font-bold text-xs mb-4 bg-[#f1f5f9]">
                  0{idx + 1}
                </div>
                <h4 className="font-bold text-base text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="pt-3 border-t border-slate-200/80 text-xs font-semibold text-blue-600">
                  ✦ {item.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Currency Toggle */}
      <section id="pricing" className="py-14 sm:py-24 px-3 sm:px-6 border-t border-slate-200/80 relative bg-[#f3f6fa]">
        <PricingSection />
      </section>

      {/* Real Inbound Lead Capture Section */}
      <section id="contact" className="py-12 sm:py-20 px-3 sm:px-6 border-t border-slate-200/80 relative bg-[#f3f6fa]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Get Started Today
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Ready to streamline your sales operations?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Reach out directly with your requirements. Our specialists will help you configure your shared team inbox and visual pipeline.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Dedicated account onboarding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Official Meta WhatsApp Business verification assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Custom team training and pipeline configuration</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <PublicLeadForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-200 text-slate-500 text-xs bg-white pb-[max(2.5rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="w-7 h-7 rounded-xl neu-convex text-slate-900 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              C
            </div>
            <span className="font-bold text-slate-800">ConvoDeck CRM</span>
            <span>— The WhatsApp Sales Operating System.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
