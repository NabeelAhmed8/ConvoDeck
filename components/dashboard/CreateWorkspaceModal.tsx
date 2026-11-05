"use client";

import React, { useState } from "react";
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
 * Features tactile Neumorphic styling, input validation, and clear error feedback.
 */
export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
          // Hard reload to refresh entire dashboard context to the new workspace
          window.location.reload();
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md neu-card rounded-3xl p-6 sm:p-7 bg-[#edf1f7] text-slate-900 shadow-2xl border border-white/80 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-convex flex items-center justify-center text-[#ff6422] shrink-0">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="create-workspace-title"
                className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight"
              >
                Create Workspace
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add an additional business or company
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
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
            autoFocus
            value={workspaceName}
            onChange={setWorkspaceName}
            placeholder="e.g. Acme Corp, Beta Agency"
            disabled={loading}
            storageKey="workspace_names"
            icon={<Building2 className="w-4 h-4" />}
          />

          <div className="p-3 rounded-2xl bg-slate-200/50 text-[11px] text-slate-600 leading-relaxed font-medium">
            💡 <strong>Multi-Workspace Support:</strong> You will be able to switch between your workspaces instantly anytime from your sidebar without logging out or disturbing active chats.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 neu-btn transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white neu-btn-primary flex items-center gap-2 cursor-pointer transition-transform hover:scale-102 disabled:opacity-60"
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
}

