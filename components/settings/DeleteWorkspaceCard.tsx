"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, ShieldAlert, Lock } from "lucide-react";
import { DeleteWorkspaceModal } from "@/components/settings/DeleteWorkspaceModal";

export interface DeleteWorkspaceCardProps {
  workspaceName: string;
  workspaceId?: string;
  workspaceCount?: number;
  onDeleted?: (nextWorkspaceId: string) => void;
}

/**
 * Single-responsibility component for displaying the Workspace Danger Zone card.
 * Automatically disables deletion if the current workspace is the user's only remaining workspace.
 */
export function DeleteWorkspaceCard({
  workspaceName,
  workspaceId,
  workspaceCount = 1,
  onDeleted,
}: DeleteWorkspaceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOnlyWorkspace = workspaceCount <= 1;

  return (
    <>
      <div className="neu-card rounded-3xl p-4 sm:p-7 space-y-4 border border-rose-200/70 bg-[#edf1f7] min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/50 pb-3 min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${
              isOnlyWorkspace
                ? "bg-slate-200/60 text-slate-500 border-slate-300/60"
                : "bg-rose-100 text-rose-600 border-rose-200/80"
            }`}>
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-rose-600">
                  Danger Zone: Delete Workspace
                </h2>
                {isOnlyWorkspace ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-600 border border-slate-300/60 shrink-0">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Only Workspace
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/80 text-rose-700 border border-rose-200 shrink-0">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    Irreversible
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Permanently delete this workspace and wipe all associated leads, chats, and configurations.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isOnlyWorkspace}
            onClick={() => {
              if (!isOnlyWorkspace) {
                setIsModalOpen(true);
              }
            }}
            title={
              isOnlyWorkspace
                ? "Cannot delete your only workspace. You must maintain at least one active workspace."
                : "Delete this workspace permanently"
            }
            className={`w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              isOnlyWorkspace
                ? "opacity-50 cursor-not-allowed bg-slate-200/80 text-slate-500 border border-slate-300 shadow-none pointer-events-auto"
                : "text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-300/80 cursor-pointer shadow-xs active:scale-98"
            }`}
          >
            {isOnlyWorkspace ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Delete Workspace</span>
          </button>
        </div>

        {/* Informational Notice */}
        {isOnlyWorkspace ? (
          <div className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed min-w-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-800">
                Deletion Disabled: This is your only remaining workspace.
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                ConvoDeck requires you to maintain at least one active workspace. If you wish to delete <strong>&quot;{workspaceName}&quot;</strong>, please create another workspace first from your sidebar, switch to it, and then delete this one.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-rose-900 text-[11px] leading-relaxed min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              Deleting <strong>{workspaceName || "this workspace"}</strong> cannot be undone. If you manage multiple workspaces, your session will automatically switch to one of your remaining workspaces upon deletion.
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {!isOnlyWorkspace && (
        <DeleteWorkspaceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceName={workspaceName}
          workspaceId={workspaceId}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}
