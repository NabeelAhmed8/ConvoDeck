import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | ConvoDeck CRM",
  description: "Privacy Policy and Customer Data Handling Practices for ConvoDeck CRM.",
};

export default function PrivacyPage() {
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
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: January 2026 • We respect your data confidentiality and customer privacy.
          </p>
        </div>

        {/* Content Sections */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 bg-[#edf1f7] text-xs leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect information provided during registration (name, work email, workspace company name) and technical integration credentials (Meta Cloud API Tokens and Phone IDs) required to synchronize your team WhatsApp inbox.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. How We Protect Your Customer Chats</h2>
            <p>
              We never sell, rent, or monetize your customer data or WhatsApp conversations. All communication data synchronized through webhooks is encrypted in transit using TLS 1.3 and stored securely in dedicated MongoDB clusters.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Third-Party Integrations</h2>
            <p>
              ConvoDeck communicates with official Meta Graph APIs to send and receive WhatsApp messages and Stripe for secure subscription processing. We do not store sensitive payment card details directly on our servers.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-300/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
            <span>Privacy inquiries: privacy@convodeck.com</span>
            <Link href="/terms" className="text-[#ea5414] hover:underline font-bold">
              View Terms of Service &rarr;
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

