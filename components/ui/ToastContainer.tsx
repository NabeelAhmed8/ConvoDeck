"use client";

import React from "react";
import { useToastStore } from "@/store/useToastStore";
import { ToastCard } from "@/components/ui/ToastCard";

/**
 * ToastContainer
 * Viewport positioning container for floating toast notifications.
 *
 * Positioning rules:
 * - Mobile (< sm): Top-middle (`top-4 inset-x-0 mx-auto px-4 max-w-sm`)
 * - Desktop (>= sm): Top-right (`sm:inset-x-auto sm:left-auto sm:right-4 sm:mx-0 sm:px-0`)
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 inset-x-0 mx-auto px-4 sm:inset-x-auto sm:left-auto sm:right-4 sm:mx-0 sm:px-0 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}
