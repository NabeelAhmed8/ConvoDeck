import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | ConvoDeck CRM",
  description: "Terms of Service and Customer Usage Agreement for ConvoDeck WhatsApp CRM platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#ebf0f7] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#ff6422]/20">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors neu-btn px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        {/* Header Card */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-3 bg-[#edf1f7]">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/60 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: January 2026 • Effective for all ConvoDeck SaaS subscribers and teams.
          </p>
        </div>

        {/* Content Sections */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 bg-[#edf1f7] text-xs leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or subscribing to ConvoDeck (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. ConvoDeck provides multi-agent WhatsApp inbox synchronization, visual sales pipeline tracking, and customer relationship management tools powered by the official Meta WhatsApp Cloud API.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Meta Platform &amp; WhatsApp Policy Compliance</h2>
            <p>
              Users must strictly comply with Meta&rsquo;s WhatsApp Business Policy, Meta Cloud API Terms, and applicable anti-spam laws. Automated spamming, unsolicited messaging, or transmitting harmful content is strictly prohibited and subject to immediate suspension without refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Subscription, Billing &amp; Cancellations</h2>
            <p>
              ConvoDeck subscriptions are billed on a recurring monthly or annual basis. You may cancel your subscription at any time through the Billing &amp; Plans portal. Cancellations take effect at the conclusion of your current billing period.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">4. Data Security &amp; Ownership</h2>
            <p>
              You maintain full ownership of all customer contacts, pipeline stages, and communication records stored in your workspace. ConvoDeck employs end-to-end encryption in transit and secure database storage to safeguard all business data.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-300/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
            <span>Questions regarding our terms? Reach out to support@convodeck.com</span>
            <Link href="/privacy" className="text-[#ea5414] hover:underline font-bold">
              View Privacy Policy &rarr;
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

