"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { DeleteWorkspaceModal } from "@/components/settings/DeleteWorkspaceModal";

export interface DeleteWorkspaceCardProps {
  workspaceName: string;
  workspaceId?: string;
  onDeleted?: (nextWorkspaceId: string) => void;
}

/**
 * Single-responsibility component for displaying the Workspace Danger Zone card.
 * Provides a clear, secure entry point for administrators to permanently delete a workspace.
 */
export function DeleteWorkspaceCard({
  workspaceName,
  workspaceId,
  onDeleted,
}: DeleteWorkspaceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4 border border-rose-200/70 bg-[#edf1f7]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/50 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200/80 shadow-xs shrink-0">
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-rose-600 truncate">
                  Danger Zone: Delete Workspace
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/80 text-rose-700 border border-rose-200 shrink-0">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Irreversible
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently delete this workspace and wipe all associated leads, chats, and configurations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-full text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-300/80 transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Workspace</span>
          </button>
        </div>

        {/* Informational Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-rose-900 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>
            Deleting <strong>{workspaceName || "this workspace"}</strong> cannot be undone. If you manage multiple workspaces, your session will automatically switch to one of your remaining workspaces upon deletion.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DeleteWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        onDeleted={onDeleted}
      />
    </>
  );
}

