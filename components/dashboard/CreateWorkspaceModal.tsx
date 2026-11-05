"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Plus, Loader2 } from "lucide-react";
import { createNewWorkspace } from "@/actions/workspaceActions";
import { NeumorphicAutocompleteInput } from "@/components/ui/NeumorphicAutocompleteInput";

export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workspaceId: string, name: string) => void;
}

/**
 * Single-responsibility component for creating a new business workspace.
 * Features tactile Neumorphic styling, portal-to-body rendering (to prevent
 * drawer/sidebar transform clipping and stray lines), responsive layout,
 * and keyboard/backdrop navigation.
 */
export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = workspaceName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a workspace name with at least 2 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createNewWorkspace(cleanName);
      if (res.success && res.workspaceId) {
        setWorkspaceName("");
        onClose();
        if (onSuccess) {
          onSuccess(res.workspaceId, res.workspaceName || cleanName);
        } else {
          // Immediately redirect to dashboard with new active workspace context
          window.location.href = "/dashboard";
        }
      } else {
        setError(res.error || "Failed to create workspace. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred while creating workspace.");
    } finally {
      setLoading(false);
    }
  };

  const isTouch =
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0);

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 md:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[94vw] sm:max-w-md my-auto neu-card rounded-3xl p-5 sm:p-7 bg-[#edf1f7] text-slate-900 shadow-2xl relative border border-white/90 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neu-convex flex items-center justify-center text-[#ff6422] shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="create-workspace-title"
                className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate"
              >
                Create Workspace
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Add an additional business or company
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <NeumorphicAutocompleteInput
            id="workspace-name-input"
            name="workspaceName"
            type="text"
            label="Workspace / Company Name"
            required
            autoFocus={!isTouch}
            value={workspaceName}
            onChange={setWorkspaceName}
            placeholder="e.g. Acme Corp, Beta Agency"
            disabled={loading}
            icon={<Building2 className="w-4 h-4" />}
          />

          <div className="p-3 sm:p-3.5 rounded-2xl neu-pressed bg-[#edf2f8] text-[11px] text-slate-600 leading-relaxed font-medium border border-slate-300/40">
            <span className="font-bold text-slate-800">💡 Multi-Workspace:</span> Switch between your workspaces instantly anytime from your sidebar without logging out or disturbing active chats.
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
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold text-white neu-btn-primary flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create & Switch</span>
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
