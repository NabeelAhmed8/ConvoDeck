"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ILead } from "@/types";
import { StageBadge } from "@/components/ui/Badge";
import { updateLead } from "@/actions/leadActions";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "@/store/useToastStore";

interface ChatLeadDrawerProps {
  activeLead: ILead;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatLeadDrawer({
  activeLead,
  isOpen,
  onClose,
}: ChatLeadDrawerProps) {
  const { updateLeadInStore } = useChatStore();
  const [notes, setNotes] = useState(activeLead.notes || "");

  useEffect(() => {
    setNotes(activeLead.notes || "");
  }, [activeLead._id, activeLead.notes]);

  const handleSaveNotes = async () => {
    if (notes === (activeLead.notes || "")) return;
    updateLeadInStore({ _id: activeLead._id!, notes });
    const res = await updateLead(activeLead._id!, { notes });
    if (res.success) {
      toast.success("Notes Saved", "Customer notes updated successfully");
    } else {
      toast.error("Failed to Save", "Could not save notes");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 xl:hidden animate-in fade-in"
        onClick={onClose}
      />
      <aside
        aria-label="Customer profile details"
        className="fixed inset-y-0 right-0 z-30 w-80 max-w-[85vw] bg-white p-4 overflow-y-auto chat-scrollbar space-y-4 shadow-2xl xl:static xl:w-80 xl:shadow-none xl:border-l xl:border-slate-200/70 animate-in slide-in-from-right duration-150 text-slate-800 shrink-0"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm">Customer Details</h4>
          <div className="flex items-center gap-2">
            <StageBadge stage={activeLead.stage} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="xl:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Customer Name
            </span>
            <p className="font-bold text-slate-900">{activeLead.name}</p>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              WhatsApp Phone
            </span>
            <p className="font-medium text-emerald-600">+{activeLead.phone}</p>
          </div>

          {activeLead.email && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Email
              </span>
              <p className="text-slate-700">{activeLead.email}</p>
            </div>
          )}

          {activeLead.company && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Company
              </span>
              <p className="text-slate-700">{activeLead.company}</p>
            </div>
          )}

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Deal Value
            </span>
            <p className="font-bold text-emerald-600 font-mono text-sm">
              ${activeLead.dealValue?.toLocaleString() || "0"}
            </p>
          </div>

          <div>
            <label
              htmlFor="customer-internal-notes"
              className="text-slate-500 block text-[10px] uppercase font-semibold mb-1"
            >
              Internal Sales Notes
            </label>
            <textarea
              id="customer-internal-notes"
              name="customerNotes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add meeting notes, customer preferences..."
              className="w-full p-3 neu-input rounded-2xl text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">
              Notes auto-save when you click away.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
