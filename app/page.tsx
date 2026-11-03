import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { PublicLeadForm } from "@/components/landing/PublicLeadForm";
import { PricingSection } from "@/components/pricing/PricingSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-clip bg-[#ebf0f7] text-slate-900 selection:bg-[#ff6422] selection:text-white flex flex-col justify-between">
      {/* Responsive Navigation Header */}
      <LandingNavbar />

      {/* Tactile Neumorphic Hero Section */}
      <HeroSection />

      {/* Core Pain Points Solved */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 border-t border-slate-300/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#ff6422] mb-3">
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
                className="p-6 rounded-3xl neu-card neu-card-hover bg-[#edf1f7] text-slate-800"
              >
                <div className="w-8 h-8 rounded-full neu-pressed text-[#ff6422] flex items-center justify-center font-bold text-xs mb-4">
                  0{idx + 1}
                </div>
                <h4 className="font-bold text-base text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="pt-3 border-t border-slate-300/40 text-xs font-semibold text-[#ea5414]">
                  ✦ {item.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Currency Toggle */}
      <section id="pricing" className="py-14 sm:py-24 px-3 sm:px-6 border-t border-slate-300/40 relative bg-[#ebf0f7]">
        <PricingSection />
      </section>

      {/* Real Inbound Lead Capture Section */}
      <section id="contact" className="py-12 sm:py-20 px-3 sm:px-6 border-t border-slate-300/40 relative bg-[#ebf0f7]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff6422]">
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
                <CheckCircle2 className="w-4 h-4 text-[#ff6422]" />
                <span>Dedicated account onboarding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff6422]" />
                <span>Official Meta WhatsApp Business verification assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff6422]" />
                <span>Custom team training and pipeline configuration</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <PublicLeadForm />
          </div>
        </div>
      </section>

      {/* Clean Modular Neumorphic Footer */}
      <LandingFooter />
    </div>
  );
}
