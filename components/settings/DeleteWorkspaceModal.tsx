"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { deleteWorkspace } from "@/actions/workspaceActions";
import { toast } from "@/store/useToastStore";

export interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  workspaceId?: string;
  onDeleted?: (nextWorkspaceId: string) => void;
}

/**
 * Single-responsibility confirmation modal for permanently deleting a workspace.
 * Features portal-to-body rendering, strict workspace name confirmation to prevent accidents,
 * Neumorphic danger styling, and responsive layout for mobile and desktop.
 */
export function DeleteWorkspaceModal({
  isOpen,
  onClose,
  workspaceName,
  workspaceId,
  onDeleted,
}: DeleteWorkspaceModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setConfirmInput("");
    setError("");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen || !mounted) return null;

  const isConfirmed = confirmInput.trim() === workspaceName.trim();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError(`Please type "${workspaceName}" exactly to confirm deletion.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await deleteWorkspace(workspaceId);
      if (res.success && res.nextWorkspaceId) {
        toast.success(
          "Workspace Deleted",
          res.message || `Workspace "${workspaceName}" was permanently removed.`
        );
        onClose();
        if (onDeleted) {
          onDeleted(res.nextWorkspaceId);
        } else {
          // Immediately redirect to dashboard under the new active workspace
          window.location.href = "/dashboard";
        }
      } else {
        setError(res.error || "Failed to delete workspace. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred while deleting the workspace.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-workspace-title"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 md:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[94vw] sm:max-w-md my-auto neu-card rounded-3xl p-5 sm:p-7 bg-[#edf1f7] text-slate-900 shadow-2xl relative border border-rose-200/60 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80 shadow-xs">
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="delete-workspace-title"
                className="text-base sm:text-lg font-black text-rose-600 tracking-tight truncate"
              >
                Delete Workspace
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Permanent and irreversible action
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs space-y-1.5 mb-4">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Warning: All workspace data will be erased!</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            This will permanently erase all <strong>leads</strong>, <strong>chat history</strong>, <strong>automations</strong>, and <strong>agent configurations</strong> belonging to this workspace.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold leading-relaxed"
          >
            {error}
          </div>
        )}

        {/* Confirmation Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label
              htmlFor="confirm-workspace-name-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              To confirm, type <strong className="text-slate-900 font-mono select-all bg-white/70 px-1.5 py-0.5 rounded-md border border-slate-300/60">{workspaceName}</strong> below:
            </label>
            <input
              id="confirm-workspace-name-input"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={workspaceName}
              disabled={loading}
              autoComplete="off"
              className="w-full py-2.5 px-3.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-hidden"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 neu-btn transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isConfirmed}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

