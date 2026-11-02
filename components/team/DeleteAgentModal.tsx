"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { IUser } from "@/types";

interface DeleteAgentModalProps {
  agent: IUser | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAgentModal({
  agent,
  isLoading,
  onClose,
  onConfirm,
}: DeleteAgentModalProps) {
  if (!agent) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="neu-card rounded-3xl max-w-sm w-full p-6 bg-white border border-slate-200/80 space-y-4 animate-in zoom-in-95 duration-150 text-slate-900">
        <div className="w-12 h-12 rounded-2xl neu-pressed text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900">
            Delete Agent Account?
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{agent.name}</strong>? This action
            cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 neu-btn text-slate-700 font-bold text-xs rounded-full cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full transition-colors shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
