import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  Download,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PricingSection } from "@/components/pricing/PricingSection";
import { getCurrentUser } from "@/actions/authActions";
import { DownloadInvoiceButton } from "@/components/billing/DownloadInvoiceButton";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const authData = await getCurrentUser();

  // Enforce RBAC: Agents cannot access billing
  if (authData?.user?.role === "agent") {
    redirect("/agent/dashboard");
  }

  const workspace = authData?.workspace;
  const currentPlan = workspace?.plan || "trial";
  const planStatus = workspace?.planStatus || "trial";
  const paymentMethod = workspace?.paymentMethod || "None on file";

  return (
    <div className="max-w-7xl mx-auto space-y-8 w-full min-w-0">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Billing & Subscription Plans
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your workspace subscription, upgrade team seats, and view invoices.
        </p>
      </div>

      {/* Current Active Plan Overview Card */}
      <div className="neu-card rounded-3xl p-4 sm:p-6 md:p-8 text-slate-900 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-slate-200/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center font-black text-xl shrink-0 bg-[#f1f5f9]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 capitalize">
                  {currentPlan === "trial"
                    ? "Growth Plan (14-Day Free Evaluation)"
                    : `${currentPlan} Plan`}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold capitalize">
                  {planStatus === "trial" ? "Active Trial" : "Active Subscription"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentPlan === "trial"
                  ? "You have full access to multi-agent WhatsApp inbox and visual sales pipeline."
                  : `Your ${currentPlan} commercial license is active. Payment method: ${paymentMethod}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/checkout?plan=growth"
              className="px-5 py-2.5 neu-btn-primary text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Zap className="w-4 h-4 text-white" />
              Upgrade to Growth Plan
            </Link>
          </div>
        </div>

        {/* Seat & Usage Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div>
            <span className="text-xs text-slate-500 block font-medium">Team Agent Seats</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {currentPlan === "starter" ? "1 / 2 Seats" : currentPlan === "growth" ? "1 / 5 Seats" : "1 / Unlimited"}
            </p>
            <div className="w-full neu-pressed rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full w-[20%]" />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 block font-medium">WhatsApp Business Line</span>
            <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">
              {workspace?.whatsappPhoneNumber || "+92 300 1234567"}
            </p>
            <div className="w-full neu-pressed rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-[100%]" />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 block font-medium">Status</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {planStatus === "active" ? "Subscribed & Paid" : "Free Trial Active"}
            </p>
            <div className="w-full neu-pressed rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-[100%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div id="plans" className="neu-card rounded-3xl p-3.5 sm:p-6 md:p-10 text-slate-900 bg-white">
        <PricingSection />
      </div>

      {/* Invoices Table */}
      <div className="neu-card rounded-3xl p-4 sm:p-6 text-slate-900 bg-white">
        <h3 className="font-bold text-sm text-slate-900 mb-1">Billing Invoices & Receipts</h3>
        <p className="text-xs text-slate-500 mb-4">Official tax receipts for your business records.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Invoice Number</th>
                <th className="pb-3">Billing Date</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-3 font-mono font-medium text-slate-900">INV-2026-001</td>
                <td className="py-3">
                  {workspace?.lastPaymentDate
                    ? new Date(workspace.lastPaymentDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Trial Activation"}
                </td>
                <td className="py-3 font-semibold text-slate-900 capitalize">
                  {currentPlan} License
                </td>
                <td className="py-3 font-bold text-slate-900 font-mono">
                  {workspace?.amountPaid && workspace.amountPaid > 0
                    ? `${workspace.planCurrency || "$"}${workspace.amountPaid.toLocaleString()}`
                    : "$0.00 (Trial)"}
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                    Completed
                  </span>
                </td>
                <td className="py-3 text-right">
                  <DownloadInvoiceButton invoiceId="INV-2026-90412" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
