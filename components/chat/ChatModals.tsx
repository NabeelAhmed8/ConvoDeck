"use client";

import React from "react";
import { AlertTriangle, Trash2, Eraser } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ILead } from "@/types";

interface ChatModalsProps {
  targetLead: ILead | null;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  showClearModal: boolean;
  setShowClearModal: (show: boolean) => void;
  isProcessingAction: boolean;
  onConfirmDelete: () => void;
  onConfirmClear: () => void;
}

export function ChatModals({
  targetLead,
  showDeleteModal,
  setShowDeleteModal,
  showClearModal,
  setShowClearModal,
  isProcessingAction,
  onConfirmDelete,
  onConfirmClear,
}: ChatModalsProps) {
  return (
    <>
      {/* Delete Conversation Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isProcessingAction) setShowDeleteModal(false);
        }}
        title="Delete Conversation?"
        description="Permanently remove conversation and contact profile."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Deletion</p>
              <p className="mt-0.5 text-rose-700 leading-relaxed">
                Are you sure you want to delete <strong>{targetLead?.name}</strong>{" "}
                and all chat messages? This action cannot be reversed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 neu-btn rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={onConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isProcessingAction ? "Deleting..." : "Delete Chat"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Chat Messages Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => {
          if (!isProcessingAction) setShowClearModal(false);
        }}
        title="Clear Chat Messages?"
        description="Erase all messages while keeping contact details intact."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            All messages exchanged with <strong>{targetLead?.name}</strong> will be
            erased. The lead contact details, deal value, and pipeline stage will be
            preserved.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={() => setShowClearModal(false)}
              className="px-4 py-2 neu-btn rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessingAction}
              onClick={onConfirmClear}
              className="px-4 py-2 neu-btn-primary text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{isProcessingAction ? "Clearing..." : "Clear Messages"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
