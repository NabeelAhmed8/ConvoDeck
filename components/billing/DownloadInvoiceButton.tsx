"use client";

import React from "react";
import { Download } from "lucide-react";
import { toast } from "@/store/useToastStore";

export function DownloadInvoiceButton({ invoiceId }: { invoiceId?: string }) {
  const handleDownload = () => {
    toast.info("Invoice Document", `Opening print and download preview for ${invoiceId || "Invoice"}...`);
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="p-2 text-slate-600 hover:text-slate-900 neu-btn rounded-full transition-all cursor-pointer inline-flex items-center justify-center"
      title={invoiceId ? `Download / Print Invoice ${invoiceId}` : "Download / Print Invoice"}
      aria-label="Download or print invoice receipt"
    >
      <Download className="w-4 h-4" />
    </button>
  );
}
