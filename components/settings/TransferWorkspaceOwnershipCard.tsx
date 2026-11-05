"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, ArrowRightLeft, ShieldAlert, Loader2, Mail } from "lucide-react";
import { transferWorkspaceOwnership } from "@/actions/workspaceActions";
import { getTeamMembers } from "@/actions/teamActions";
import { toast } from "@/store/useToastStore";
import { NeumorphicCheckbox } from "@/components/ui/NeumorphicCheckbox";
import {
  NeumorphicAutocompleteInput,
  saveInputSuggestionHistory,
} from "@/components/ui/NeumorphicAutocompleteInput";

export interface TransferWorkspaceOwnershipCardProps {
  currentOwnerEmail: string;
  workspaceName: string;
  onTransferred?: (newOwnerEmail: string) => void;
}

/**
 * Single-responsibility component for safely transferring workspace ownership to another email address.
 * Conforms to SaaS industry standard multi-tenant administrative workflows.
 */
export function TransferWorkspaceOwnershipCard({
  currentOwnerEmail,
  workspaceName,
  onTransferred,
}: TransferWorkspaceOwnershipCardProps) {
  const [targetEmail, setTargetEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState(currentOwnerEmail);
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await getTeamMembers();
        if (res?.success && res.members) {
          const emails = res.members
            .map((m) => m.email)
            .filter(
              (email): email is string =>
                Boolean(email) &&
                email.toLowerCase() !== currentOwnerEmail.toLowerCase()
            );
          setTeamSuggestions(emails);
        }
      } catch {
        // Safe fallback
      }
    }
    loadTeam();
  }, [currentOwnerEmail]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Invalid Email", "Please enter a valid recipient email address.");
      return;
    }

    if (cleanEmail === owner.toLowerCase()) {
      toast.error("Duplicate Owner", "This workspace is already owned by this email.");
      return;
    }

    if (!confirmed) {
      toast.error("Confirmation Required", "Please check the confirmation box before proceeding.");
      return;
    }

    setLoading(true);

    try {
      const res = await transferWorkspaceOwnership(cleanEmail);
      if (res.success && res.newOwnerEmail) {
        saveInputSuggestionHistory("owner_transfer_emails", cleanEmail);
        setOwner(res.newOwnerEmail);
        setTargetEmail("");
        setConfirmed(false);
        toast.success(
          "Ownership Transferred",
          res.message || `Ownership transferred to ${cleanEmail}.`
        );
        if (onTransferred) {
          onTransferred(res.newOwnerEmail);
        } else {
          // Hard reload to refresh permissions
          window.location.reload();
        }
      } else {
        toast.error("Transfer Failed", res.error || "Failed to transfer ownership.");
      }
    } catch {
      toast.error("Error", "An unexpected error occurred during transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5 border border-slate-200/80">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-300/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shrink-0">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Transfer Workspace Ownership</h2>
            <p className="text-xs text-slate-500">
              Reassign primary ownership and billing administration of &ldquo;{workspaceName}&rdquo; to another account.
            </p>
          </div>
        </div>
      </div>

      {/* Current Owner Info Pill */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-200/50 text-xs text-slate-700">
        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">Current Primary Owner:</span>
        <span className="font-bold text-slate-900 bg-white/70 px-2 py-0.5 rounded-lg border border-slate-300/50">
          {owner || "Owner"}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleTransfer} className="space-y-4">
        <NeumorphicAutocompleteInput
          id="transfer-target-email"
          name="targetEmail"
          type="email"
          label="New Owner Email Address"
          required
          value={targetEmail}
          onChange={setTargetEmail}
          placeholder="partner@example.com"
          disabled={loading}
          storageKey="owner_transfer_emails"
          suggestions={[
            ...teamSuggestions,
            "partner@company.com",
            "manager@agency.com",
            "admin@domain.com",
          ]}
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Industry standard safeguard note */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Important Notice:</strong> Once transferred, the new owner will hold primary administrative control of this workspace, its connected WhatsApp lines, and billing details.
          </div>
        </div>

        {/* Dynamic Neumorphic Confirmation Checkbox */}
        <div className="pt-0.5">
          <NeumorphicCheckbox
            id="transfer-confirm-checkbox"
            name="transferConfirmed"
            label="I understand and want to transfer this workspace to the specified email."
            checked={confirmed}
            onChange={(checked) => setConfirmed(checked)}
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !confirmed || !targetEmail}
            className="px-5 py-2.5 neu-btn rounded-2xl text-xs font-bold text-slate-800 hover:text-amber-700 hover:border-amber-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                <span>Transfer Ownership</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

