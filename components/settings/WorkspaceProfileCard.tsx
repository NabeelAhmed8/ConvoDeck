"use client";

import React, { useState, useEffect } from "react";
import { Building2, Mail, Save, Loader2 } from "lucide-react";
import { updateWorkspaceSettings } from "@/actions/workspaceActions";
import { toast } from "@/store/useToastStore";

export interface WorkspaceProfileCardProps {
  initialName: string;
  initialContactEmail?: string;
  ownerEmail?: string;
  onSaved?: (updated: { name: string; contactEmail: string }) => void;
}

/**
 * Single-responsibility component for managing workspace name and contact/notification email.
 * Applies Neumorphic styling and responsive inputs.
 */
export function WorkspaceProfileCard({
  initialName,
  initialContactEmail = "",
  ownerEmail = "",
  onSaved,
}: WorkspaceProfileCardProps) {
  const [name, setName] = useState(initialName);
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setContactEmail(initialContactEmail);
  }, [initialContactEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateWorkspaceSettings({
        name,
        contactEmail: contactEmail.trim().toLowerCase(),
      });

      if (res.success) {
        toast.success("Saved", "Workspace details updated successfully.");
        if (onSaved) {
          onSaved({ name, contactEmail: contactEmail.trim().toLowerCase() });
        }
      } else {
        toast.error("Error", res.error || "Failed to update workspace profile.");
      }
    } catch {
      toast.error("Error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50 shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-slate-900">Workspace Profile &amp; Contact Email</h2>
          <p className="text-xs text-slate-500">
            Define this workspace's organization name and dedicated contact email for reports and alerts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Workspace Name Input */}
          <div>
            <label
              htmlFor="settings-company-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Company / Workspace Name
            </label>
            <input
              id="settings-company-name"
              name="companyName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Agency"
              disabled={saving}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Dedicated Contact Email Input */}
          <div>
            <label
              htmlFor="settings-contact-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Workspace Contact / Notification Email
            </label>
            <div className="relative">
              <input
                id="settings-contact-email"
                name="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder={ownerEmail || "e.g. alerts@company.com"}
                disabled={saving}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-hidden"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              WhatsApp alerts, billing invoices, and lead digests for this workspace will be routed here. Defaults to owner email.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all hover:scale-102"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Workspace Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

