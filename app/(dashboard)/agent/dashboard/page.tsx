import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Kanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  Headphones,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/actions/authActions";
import { getLeads } from "@/actions/leadActions";
import { StageBadge } from "@/components/ui/Badge";
import { ILead } from "@/types";

export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const authData = await getCurrentUser();

  if (!authData?.user) {
    redirect("/agent/login");
  }

  const user = authData.user;
  const workspace = authData.workspace;
  const leads = await getLeads();

  // Filter or calculate agent metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l: ILead) => l.stage === "WON");
  const inProgressLeads = leads.filter(
    (l: ILead) => l.stage !== "WON" && l.stage !== "LOST"
  );
  const totalPipelineValue = inProgressLeads.reduce(
    (sum: number, l: ILead) => sum + (l.dealValue || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {/* Agent Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl neu-card p-4 sm:p-6 md:p-8 text-slate-900 bg-[#edf1f7]">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-pressed text-[#ea5414] text-xs font-bold mb-3 border border-orange-200 bg-orange-50">
            <Headphones className="w-3.5 h-3.5 text-[#ff6422]" />
            Agent Workstation • {workspace?.name || "ConvoDeck CRM"}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your sales workstation is live. Manage customer WhatsApp conversations, move leads through pipeline stages, and close deals faster.
          </p>

          <div className="mt-5 flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 sm:gap-3">
            <Link
              href="/chat"
              className="px-5 py-2.5 neu-btn-primary rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-white shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              Open WhatsApp Inbox
            </Link>
            <Link
              href="/pipeline"
              className="px-5 py-2.5 neu-btn text-slate-800 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Kanban className="w-4 h-4" />
              View Sales Pipeline
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-[#ff6422]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Agent Performance & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card neu-card-hover p-5 rounded-2xl text-slate-900 bg-[#edf1f7]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Inquiries</span>
            <div className="w-8 h-8 rounded-xl neu-pressed text-[#ff6422] flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalLeads}</p>
          <span className="text-[11px] text-slate-500">Total customer conversations</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl text-slate-900 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deals in Progress</span>
            <div className="w-8 h-8 rounded-xl neu-pressed text-amber-600 flex items-center justify-center font-bold bg-[#f1f5f9]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{inProgressLeads.length}</p>
          <span className="text-[11px] text-slate-500">Awaiting follow-up & demo</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl text-slate-900 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl neu-pressed text-purple-600 flex items-center justify-center font-bold bg-[#f1f5f9]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 font-mono mt-2">
            ${totalPipelineValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Potential deal value</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl text-slate-900 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deals Won</span>
            <div className="w-8 h-8 rounded-xl neu-pressed text-emerald-600 flex items-center justify-center font-bold bg-[#f1f5f9]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{wonLeads.length}</p>
          <span className="text-[11px] text-slate-500">Successfully closed deals</span>
        </div>
      </div>

      {/* Main Grid: Recent Active Customers & Agent Workstation Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent WhatsApp Chats */}
        <div className="lg:col-span-8 neu-card rounded-3xl p-6 space-y-4 text-slate-900 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Customer Inquiries
              </h2>
              <p className="text-xs text-slate-500">
                Reply to your assigned WhatsApp prospects
              </p>
            </div>
            <Link
              href="/chat"
              className="text-xs font-semibold text-[#ea5414] hover:text-[#c2410c] flex items-center gap-1 transition-colors"
            >
              Open Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/60">
            {leads.slice(0, 6).map((lead: ILead) => (
              <div
                key={lead._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:neu-flat p-2.5 rounded-2xl transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl neu-pressed text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 bg-[#f1f5f9]">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {lead.name}
                      </span>
                      <StageBadge stage={lead.stage} />
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-2.5 h-2.5 text-emerald-600" />
                      +{lead.phone} {lead.company && `• ${lead.company}`}
                    </p>
                    <p className="text-xs text-slate-500 truncate max-w-md mt-1 italic">
                      &quot;{lead.lastMessage || "No message snippet"}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href="/chat"
                    className="px-4 py-1.5 neu-btn-primary text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    Reply
                  </Link>
                </div>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No customer inquiries assigned yet. Incoming WhatsApp messages will appear here.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Agent Checklist & Security Notice */}
        <div className="lg:col-span-4 space-y-6">
          {/* Agent Security Attribution Card */}
          <div className="neu-card text-slate-900 rounded-3xl p-6 space-y-3 bg-[#edf1f7]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#ff6422]" />
              <h3 className="font-bold text-sm text-slate-900">
                Agent Security & Accountability
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every message you send from this workstation is stamped with your agent name (<strong className="text-slate-900">{user.name}</strong>) and logged to the company audit trail.
            </p>
            <div className="pt-2 text-[11px] text-[#ea5414] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Verified Agent Session Active
            </div>
          </div>

          {/* Daily Sales Best Practices */}
          <div className="neu-card rounded-3xl p-6 space-y-3 text-slate-900 bg-[#edf1f7]">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-[#ff6422]" />
              <span>Agent Daily Best Practices</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full neu-pressed text-[#ff6422] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong className="text-slate-900">Speed to Lead:</strong> Reply within 5 minutes of inquiry to maximize conversion.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full neu-pressed text-[#ff6422] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong className="text-slate-900">Stage Progression:</strong> Update the deal stage after every WhatsApp phone call or demo.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full neu-pressed text-[#ff6422] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong className="text-slate-900">Customer Notes:</strong> Keep internal notes updated for team continuity.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
