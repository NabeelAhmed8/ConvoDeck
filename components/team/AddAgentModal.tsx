"use client";

import React, { useState } from "react";
import { UserPlus, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createTeamAgent } from "@/actions/teamActions";
import { IUser, UserRole } from "@/types";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (newMember: IUser) => void;
}

export function AddAgentModal({
  isOpen,
  onClose,
  onAgentCreated,
}: AddAgentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Agent@2026!");
  const [role, setRole] = useState<UserRole>("agent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await createTeamAgent({
      name,
      email,
      password,
      role,
    });

    setLoading(false);

    if (res.success && res.member) {
      onAgentCreated(res.member);
      setSuccessMsg(`Agent account created successfully for ${res.member.name}`);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setName("");
      setEmail("");
      setPassword("Agent@2026!");
    } else {
      setError(res.error || "Failed to create agent");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="neu-card rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200/80 relative space-y-5 animate-in zoom-in-95 duration-150 text-slate-900">
        <div>
          <div className="w-10 h-10 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Add New Team Agent
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Generate a unique login for your sales representative. Credentials will be emailed automatically.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#ea5414] underline pt-1 font-semibold flex items-center gap-1"
              >
                View Dispatched Email Preview <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <label
              htmlFor="agent-full-name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Agent Full Name <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="agent-full-name"
              name="agentName"
              required
              placeholder="e.g. Asad Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="agent-work-email"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Agent Work Email <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="agent-work-email"
              name="agentEmail"
              type="email"
              required
              placeholder="asad@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="agent-initial-password"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Temporary Password <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="agent-initial-password"
              name="agentPassword"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="agent-role-select"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Agent Role & Permissions (RBAC) <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <select
              id="agent-role-select"
              name="agentRole"
              aria-label="Agent Role and Permissions"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 font-semibold focus:outline-none"
            >
              <option value="agent">Sales Agent (Chat & Pipeline access only)</option>
              <option value="manager">Team Manager (Pipeline, Analytics & Reports)</option>
              <option value="admin">Administrator / Co-Owner (Full access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="neu-btn text-slate-700 border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="neu-btn-primary cursor-pointer border-none"
            >
              {loading ? "Creating..." : "Create & Send Credentials"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
