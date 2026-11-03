"use client";

import React, { useState } from "react";
import { UserPlus, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createTeamAgent } from "@/actions/teamActions";
import { IUser, UserRole } from "@/types";
import { AgentFormFields } from "@/components/team/AgentFormFields";
import { AgentCreationSuccessView } from "@/components/team/AgentCreationSuccessView";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (newMember: IUser) => void;
}

/**
 * AddAgentModal
 * Modal dialog for onboarding a new team agent.
 * Automatically transitions to a compact, non-scrollable confirmation view
 * upon success with an immediately visible 'Done' button.
 */
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createdMember, setCreatedMember] = useState<IUser | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsDone(false);
    setError("");
    setPreviewUrl(null);
    setCreatedMember(null);
    setName("");
    setEmail("");
    setPassword("Agent@2026!");
    setRole("agent");
    onClose();
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await createTeamAgent({
      name,
      email,
      password,
      role,
    });

    setLoading(false);

    if (res.success && res.member) {
      onAgentCreated(res.member);
      setCreatedMember(res.member);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setIsDone(true);
    } else {
      setError(res.error || "Failed to create agent");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
    >
      <div className="neu-card rounded-3xl max-w-lg w-full p-5 sm:p-6 bg-white border border-slate-200/80 relative space-y-4 animate-in zoom-in-95 duration-150 text-slate-900 shadow-2xl">
        {/* Close Icon Top-Right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-xl neu-btn transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isDone && createdMember ? (
          /* 1. Compact Success View: Directly visible, ZERO scrolling needed */
          <AgentCreationSuccessView
            agentName={createdMember.name}
            agentEmail={createdMember.email}
            agentRole={createdMember.role}
            previewUrl={previewUrl}
            onDone={handleClose}
          />
        ) : (
          /* 2. Compact Creation Form View */
          <>
            <div>
              <div className="w-9 h-9 rounded-2xl neu-pressed text-[#ff6422] flex items-center justify-center mb-2">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Add New Team Agent
              </h3>
              <p className="text-xs text-slate-500">
                Credentials will be generated and dispatched automatically via email.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <AgentFormFields
                name={name}
                email={email}
                password={password}
                role={role}
                disabled={loading}
                onNameChange={setName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onRoleChange={setRole}
              />

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="neu-btn text-slate-700 border-none cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="neu-btn-primary cursor-pointer border-none text-xs font-bold px-4 py-2"
                >
                  {loading ? "Creating..." : "Create & Send Credentials"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
