"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Layers,
  Sparkles,
  MessageSquare,
  Calendar,
  FileText,
  Trophy,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Lock,
} from "lucide-react";
import { ILead, LeadStage } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { AddLeadModal } from "./AddLeadModal";
import { updateLeadStage } from "@/actions/leadActions";
import { Button } from "@/components/ui/Button";

interface KanbanBoardProps {
  initialLeads: ILead[];
  userRole?: string;
}

interface ColumnConfig {
  id: LeadStage;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  topBorder: string;
  badgeBg: string;
  headerGradient: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "NEW",
    title: "New Inquiries",
    icon: Sparkles,
    accentColor: "text-blue-600",
    topBorder: "border-t-blue-500",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    headerGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    id: "CONTACTED",
    title: "Contacted",
    icon: MessageSquare,
    accentColor: "text-purple-600",
    topBorder: "border-t-purple-500",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    headerGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    id: "DEMO_SCHEDULED",
    title: "Demo Scheduled",
    icon: Calendar,
    accentColor: "text-amber-600",
    topBorder: "border-t-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    headerGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    id: "PROPOSAL_SENT",
    title: "Proposal Sent",
    icon: FileText,
    accentColor: "text-indigo-600",
    topBorder: "border-t-indigo-500",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    headerGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
  },
  {
    id: "WON",
    title: "Deals Won 🎉",
    icon: Trophy,
    accentColor: "text-emerald-600",
    topBorder: "border-t-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    headerGradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  },
  {
    id: "LOST",
    title: "Lost",
    icon: XCircle,
    accentColor: "text-rose-600",
    topBorder: "border-t-rose-400",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    headerGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
  },
];

export function KanbanBoard({ initialLeads, userRole = "admin" }: KanbanBoardProps) {
  const [leads, setLeads] = useState<ILead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetAddStage, setTargetAddStage] = useState<LeadStage>("NEW");
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

  // Calculate dynamic metrics
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const wonLeads = leads.filter((l) => l.stage === "WON");
  const totalWonValue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const avgDealValue = leads.length > 0 ? Math.round(totalPipelineValue / leads.length) : 0;

  // Open modal with specific target stage
  const handleOpenAddModal = (stage: LeadStage = "NEW") => {
    setTargetAddStage(stage);
    setIsAddModalOpen(true);
  };

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

  const handleStageChangeFromCard = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, stage: newStage } : lead))
    );
  };

  return (
    <div className="flex flex-col w-full min-w-0 space-y-4 lg:h-full">
      {/* Board Header & Controls */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-3xl space-y-4 shadow-sm">
        {/* Top Row: Title, Subtitle & Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#ea5414] border border-[#ea5414]/20 flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-5 h-5 text-[#ea5414]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
                Sales Pipeline &amp; Deals
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Track revenue, drag deals across conversion stages, and message clients via WhatsApp.
              </p>
            </div>
          </div>

          {/* Right Controls: Search & Add Deal Button */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <label htmlFor="pipeline-search-input" className="sr-only">
                Search leads by name, company, or phone number
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="pipeline-search-input"
                name="pipelineSearch"
                type="search"
                autoComplete="off"
                placeholder="Search deals or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            {userRole === "agent" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Agent View (View Only)</span>
              </span>
            ) : (
              <Button
                type="button"
                onClick={() => handleOpenAddModal("NEW")}
                aria-label="Add new lead to pipeline"
                className="flex items-center gap-1.5 bg-[#ea5414] hover:bg-[#d0460c] text-white px-4 py-2 text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-md transition-all active:scale-95 border-none"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Deal</span>
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Metric Snapshot Cards */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Total Pipeline */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Pipeline Value
              </span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono block truncate">
                ${totalPipelineValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. Won Revenue */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block tracking-wider">
                Won Revenue
              </span>
              <span className="font-extrabold text-emerald-800 text-xs sm:text-sm font-mono block truncate">
                ${totalWonValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3. Total Deals */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Active Deals
              </span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono block truncate">
                {filteredLeads.length} deals
              </span>
            </div>
          </div>

          {/* 4. Average Deal */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Avg Deal Size
              </span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono block truncate">
                ${avgDealValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Pipeline Stage Boxes */}
      <div className="flex-1 overflow-x-auto chat-scrollbar pb-4 scroll-smooth touch-pan-x w-full max-w-full">
        <div className="flex gap-4 min-w-[1300px] min-h-[calc(100vh-250px)] pb-2 items-start">
          {COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter(
              (lead) => lead.stage === column.id
            );
            const columnValue = columnLeads.reduce(
              (acc, l) => acc + (l.dealValue || 0),
              0
            );
            const valuePercent =
              totalPipelineValue > 0
                ? Math.round((columnValue / totalPipelineValue) * 100)
                : 0;
            const isOver = activeDragOverCol === column.id;
            const ColumnIcon = column.icon;

            return (
              <div
                key={column.id}
                role="region"
                aria-label={`${column.title} column`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 flex flex-col min-w-[285px] max-w-[325px] bg-slate-50/90 rounded-3xl border border-slate-200/90 shadow-sm transition-all overflow-hidden ${
                  isOver
                    ? "ring-2 ring-[#ea5414] bg-orange-50/50 shadow-md scale-[1.01]"
                    : ""
                }`}
              >
                {/* Column Box Header with Dynamic Gradient & Metrics */}
                <div
                  className={`p-4 bg-gradient-to-b ${column.headerGradient} bg-white border-t-4 ${column.topBorder} border-b border-slate-200/70 space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center ${column.accentColor}`}
                      >
                        <ColumnIcon className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {column.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        aria-label={`${columnLeads.length} leads`}
                        className={`text-xs px-2 py-0.5 rounded-full font-extrabold border ${column.badgeBg}`}
                      >
                        {columnLeads.length}
                      </span>
                      {userRole !== "agent" && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(column.id)}
                          title={`Add Deal to ${column.title}`}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stage Revenue & Value Share Progress Bar */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-medium">Stage Value:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${columnValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Mini Percentage Bar */}
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#ea5414] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(valuePercent, 100)}%` }}
                      title={`${valuePercent}% of total pipeline`}
                    />
                  </div>
                </div>

                {/* Column Cards Dropzone */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[300px]">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={() => handleDragStart(lead._id!)}
                      className="cursor-grab active:cursor-grabbing transition-transform"
                    >
                      <KanbanCard
                        lead={lead}
                        userRole={userRole}
                        onStageChange={handleStageChangeFromCard}
                      />
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 space-y-2 bg-white/50">
                      <span className="text-xs text-slate-400">
                        No deals in {column.title}
                      </span>
                      {userRole !== "agent" && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(column.id)}
                          className="text-xs font-semibold text-[#ea5414] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Add a Deal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding a new lead with target default stage */}
      <AddLeadModal
        key={targetAddStage + String(isAddModalOpen)}
        isOpen={isAddModalOpen}
        defaultStage={targetAddStage}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
