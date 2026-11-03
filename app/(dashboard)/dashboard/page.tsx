import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  DollarSign,
  Trophy,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Settings,
  Plus,
} from "lucide-react";
import { getLeads } from "@/actions/leadActions";
import { getCurrentUser } from "@/actions/authActions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentLeadsList } from "@/components/dashboard/RecentLeadsList";
import { ILead } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [leads, authData] = await Promise.all([
    getLeads(),
    getCurrentUser(),
  ]);

  // If logged-in user is an agent, send them to their dedicated Agent Workstation
  if (authData?.user?.role === "agent") {
    redirect("/agent/dashboard");
  }

  const workspaceName = authData?.workspace?.name || "Your Workspace";

  // Metrics computation
  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((sum: number, l: ILead) => sum + (l.dealValue || 0), 0);
  const wonLeads = leads.filter((l: ILead) => l.stage === "WON");
  const wonRevenue = wonLeads.reduce((sum: number, l: ILead) => sum + (l.dealValue || 0), 0);
  const unreadCount = leads.reduce((sum: number, l: ILead) => sum + (l.unreadCount || 0), 0);

  const stageCounts = {
    NEW: leads.filter((l: ILead) => l.stage === "NEW").length,
    CONTACTED: leads.filter((l: ILead) => l.stage === "CONTACTED").length,
    DEMO_SCHEDULED: leads.filter((l: ILead) => l.stage === "DEMO_SCHEDULED").length,
    PROPOSAL_SENT: leads.filter((l: ILead) => l.stage === "PROPOSAL_SENT").length,
    WON: wonLeads.length,
    LOST: leads.filter((l: ILead) => l.stage === "LOST").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 w-full min-w-0">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl neu-card p-4 sm:p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-pressed text-[#ea5414] text-xs font-bold mb-3 border border-orange-200 bg-orange-50">
            <span className="w-2 h-2 rounded-full bg-[#ff6422] animate-pulse" />
            {workspaceName}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Sales Overview & Live Inbox
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
            Manage your active leads, track team conversations, and move deals forward across each pipeline stage.
          </p>
          <div className="mt-5 flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 sm:gap-3">
            <Link
              id="tour-btn-dashboard-chat"
              href="/chat"
              className="px-5 py-2.5 neu-btn-primary rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              Open WhatsApp Inbox
            </Link>
            <Link
              id="tour-btn-dashboard-pipeline"
              href="/pipeline"
              className="px-5 py-2.5 neu-btn text-slate-800 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              Sales Pipeline
              <ArrowUpRight className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-[#ff6422]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          subtitle="Active prospects"
          icon={Users}
          color="orange"
        />
        <StatsCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          subtitle="Deals in progress"
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Revenue Won"
          value={`$${wonRevenue.toLocaleString()}`}
          subtitle={`${wonLeads.length} deals closed`}
          icon={Trophy}
          color="green"
        />
        <StatsCard
          title="Unread Messages"
          value={unreadCount}
          subtitle="Awaiting response"
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Guidance Banner when pipeline has zero leads */}
      {totalLeads === 0 && (
        <div className="p-6 neu-card rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Your sales pipeline is ready for new prospects
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Add your first contact using the button on the left or connect your WhatsApp Business account in Settings.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="px-5 py-2.5 neu-btn-primary rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              WhatsApp Setup
            </Link>
          </div>
        </div>
      )}

      {/* Pipeline Funnel Distribution */}
      <div className="neu-card p-4 sm:p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-lg">
              Pipeline Stage Breakdown
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Live count of leads across each conversion stage
            </p>
          </div>
          <Link
            href="/pipeline"
            className="text-xs font-bold text-[#ea5414] hover:text-[#c2410c] flex items-center gap-1 transition-colors shrink-0"
          >
            Manage Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { stage: "New Inquiries", count: stageCounts.NEW, color: "text-slate-800 border-slate-300/40" },
            { stage: "Contacted", count: stageCounts.CONTACTED, color: "text-slate-800 border-slate-300/40" },
            { stage: "Demo Given", count: stageCounts.DEMO_SCHEDULED, color: "text-[#ff6422] border-orange-200/50" },
            { stage: "Proposal Sent", count: stageCounts.PROPOSAL_SENT, color: "text-slate-800 border-slate-300/40" },
            { stage: "Won Deals 🎉", count: stageCounts.WON, color: "text-emerald-700 border-emerald-300/40" },
            { stage: "Lost", count: stageCounts.LOST, color: "text-rose-700 border-rose-300/40" },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-2.5 sm:p-3.5 rounded-2xl neu-pressed text-center transition-all ${item.color}`}
            >
              <span className="text-[11px] sm:text-xs font-bold block truncate text-slate-600">
                {item.stage}
              </span>
              <span className="text-xl sm:text-2xl font-black mt-1 block text-slate-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentLeadsList leads={leads} />
        </div>

        <div className="space-y-4">
          {/* Quick Setup Card */}
          <div className="neu-card p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#ff6422]" />
              <h4 className="font-bold text-sm sm:text-base text-slate-900">WhatsApp Business Connection</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Connect your official WhatsApp number to allow your team to reply to customer messages from a single dashboard.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold neu-btn-primary px-5 py-2.5 rounded-full cursor-pointer text-white"
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              Configure Connection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
