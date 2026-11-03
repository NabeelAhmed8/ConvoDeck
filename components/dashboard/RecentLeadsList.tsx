import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, Phone } from "lucide-react";
import { ILead } from "@/types";
import { StageBadge } from "@/components/ui/Badge";

interface RecentLeadsListProps {
  leads: ILead[];
}

export function RecentLeadsList({ leads }: RecentLeadsListProps) {
  return (
    <div className="neu-card rounded-3xl p-5 sm:p-6 text-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">Recent Leads</h2>
          <p className="text-xs text-slate-500">Latest active prospects from WhatsApp</p>
        </div>
        <Link
          href="/pipeline"
          aria-label="View all leads in sales pipeline"
          className="text-xs font-bold text-[#ea5414] hover:text-[#c2410c] flex items-center gap-1 transition-colors"
        >
          View Pipeline <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div role="list" aria-label="Recent leads" className="divide-y divide-slate-300/40">
        {leads.slice(0, 5).map((lead) => (
          <div
            key={lead._id}
            role="listitem"
            className="py-3 flex items-center justify-between gap-3 hover:neu-flat rounded-2xl px-3 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center font-bold text-xs shrink-0"
              >
                {lead.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{lead.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Phone className="w-2.5 h-2.5 text-emerald-600" aria-hidden="true" />
                    <span aria-label={`Phone number: ${lead.phone}`}>+{lead.phone}</span>
                  </span>
                  {lead.company && <span className="truncate text-slate-500">• {lead.company}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StageBadge stage={lead.stage} />
              <Link
                href={`/chat?leadId=${lead._id}`}
                aria-label={`Open WhatsApp conversation with ${lead.name}`}
                className="w-8 h-8 rounded-full neu-btn text-[#ff6422] hover:text-[#ea5414] flex items-center justify-center transition-all cursor-pointer"
                title="Open WhatsApp Chat"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            No leads yet. Create or capture your first lead!
          </div>
        )}
      </div>
    </div>
  );
}
