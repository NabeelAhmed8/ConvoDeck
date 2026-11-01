"use client";

import React, { useState } from "react";
import { Plus, Search, Layers } from "lucide-react";
import { ILead, LeadStage, KanbanColumnDef } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { AddLeadModal } from "./AddLeadModal";
import { updateLeadStage } from "@/actions/leadActions";
import { Button } from "@/components/ui/Button";

interface KanbanBoardProps {
  initialLeads: ILead[];
}

const COLUMNS: KanbanColumnDef[] = [
  { id: "NEW", title: "New Inquiries", color: "border-sky-500", badgeBg: "bg-sky-100 text-sky-800" },
  { id: "CONTACTED", title: "Contacted", color: "border-purple-500", badgeBg: "bg-purple-100 text-purple-800" },
  { id: "DEMO_SCHEDULED", title: "Demo Scheduled", color: "border-amber-500", badgeBg: "bg-amber-100 text-amber-800" },
  { id: "PROPOSAL_SENT", title: "Proposal Sent", color: "border-indigo-500", badgeBg: "bg-indigo-100 text-indigo-800" },
  { id: "WON", title: "Deals Won 🎉", color: "border-emerald-500", badgeBg: "bg-emerald-100 text-emerald-800" },
  { id: "LOST", title: "Lost", color: "border-rose-400", badgeBg: "bg-rose-100 text-rose-800" },
];

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<ILead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDragOverCol, setActiveDragOverCol] = useState<string | null>(null);

  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) => {
    const q = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      (lead.company && lead.company.toLowerCase().includes(q)) ||
      lead.phone.includes(q)
    );
  });

  // Calculate pipeline total value
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const totalWonValue = leads
    .filter((l) => l.stage === "WON")
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // Drag and Drop handlers
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (activeDragOverCol !== colId) {
      setActiveDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setActiveDragOverCol(null);
    if (!draggedLeadId) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === draggedLeadId ? { ...lead, stage: targetStage } : lead
      )
    );

    const leadIdToUpdate = draggedLeadId;
    setDraggedLeadId(null);

    // Save to Database
    await updateLeadStage(leadIdToUpdate, targetStage);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Header & Controls */}
      <div className="neu-card p-3 sm:p-5 rounded-3xl text-slate-900 bg-white space-y-3 sm:space-y-3.5 shadow-sm">
        {/* Top Row: Title, Subtitle & Action Controls (Search & Add Lead) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl neu-pressed text-slate-900 flex items-center justify-center shrink-0 bg-[#f1f5f9]">
              <Layers className="w-4 h-4 sm:w-6 sm:h-6 text-slate-900" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
                Visual Sales Pipeline
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                Drag-and-drop leads across stages to track conversion &amp; revenue.
              </p>
            </div>
          </div>

          {/* Right Controls: Search & Add Lead */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <label htmlFor="pipeline-search-input" className="sr-only">
                Search leads by name, company, or phone number
              </label>
              <Search
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="pipeline-search-input"
                name="pipelineSearch"
                type="search"
                aria-label="Search leads by name, company, or phone number"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>

            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              aria-label="Add new lead to pipeline"
              className="flex items-center gap-1 sm:gap-1.5 neu-btn-primary px-3 sm:px-4 py-2 text-xs font-bold rounded-full shrink-0 cursor-pointer border-none shadow-md"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span>Add Lead</span>
            </Button>
          </div>
        </div>

        {/* Bottom Snapshot Row: Perfectly Aligned Metrics Pills */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Snapshot:
            </span>

            {/* Total Pipeline Pill */}
            <div className="neu-pressed px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs bg-[#f1f5f9]">
              <span className="text-slate-500 font-semibold"><span className="hidden sm:inline">Total </span>Pipeline:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                ${totalPipelineValue.toLocaleString()}
              </span>
            </div>

            {/* Won Revenue Pill */}
            <div className="neu-pressed px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs bg-[#f1f5f9]">
              <span className="text-slate-500 font-semibold"><span className="hidden sm:inline">Won </span>Revenue:</span>
              <span className="font-extrabold text-emerald-600 font-mono">
                ${totalWonValue.toLocaleString()}
              </span>
            </div>

            {/* Total Leads Pill */}
            <div className="neu-pressed px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs bg-[#f1f5f9]">
              <span className="text-slate-500 font-semibold"><span className="hidden sm:inline">Total </span>Leads:</span>
              <span className="font-extrabold text-blue-600 font-mono">
                {filteredLeads.length}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" aria-hidden="true" />
            <span>Interactive Drag &amp; Drop Board</span>
          </div>
        </div>
      </div>

      {/* Pipeline Stages Grid */}
      <div className="flex-1 overflow-x-auto pb-4 scroll-smooth touch-pan-x">
        <div className="flex gap-4 min-w-[1300px] min-h-[calc(100vh-230px)] pb-2">
          {COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter(
              (lead) => lead.stage === column.id
            );
            const columnValue = columnLeads.reduce(
              (acc, l) => acc + (l.dealValue || 0),
              0
            );
            const isOver = activeDragOverCol === column.id;

            return (
              <div
                key={column.id}
                role="region"
                aria-label={`${column.title} column`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 flex flex-col min-w-[280px] max-w-[320px] neu-pressed rounded-3xl transition-all overflow-hidden ${
                  isOver
                    ? "ring-2 ring-blue-500/50 neu-pressed-accent"
                    : ""
                }`}
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-t-4 bg-white rounded-t-3xl border-b border-slate-200/80 flex items-center justify-between ${column.color}`}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-sm">
                      {column.title}
                    </h2>
                    <span
                      aria-label={`${columnLeads.length} leads`}
                      className={`text-xs px-2 py-0.5 rounded-full font-bold border border-slate-300/50 ${column.badgeBg}`}
                    >
                      {columnLeads.length}
                    </span>
                  </div>
                  {columnValue > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 font-mono">
                      ${columnValue.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Column Cards Dropzone */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={() => handleDragStart(lead._id!)}
                      className="cursor-grab active:cursor-grabbing transition-transform"
                    >
                      <KanbanCard lead={lead} />
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-300/60 rounded-xl flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                      No leads here yet. Drop leads into this stage!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding a new lead */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
