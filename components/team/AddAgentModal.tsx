"use client";

import React, { useState } from "react";
import { UserPlus, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createTeamAgent } from "@/actions/teamActions";
import { IUser, UserRole } from "@/types";
import { AgentFormFields } from "@/components/team/AgentFormFields";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (newMember: IUser) => void;
}

/**
 * AddAgentModal
 * Modal dialog for onboarding a new team agent, sending credentials,
 * and transitioning to a 'Done' confirmation state that closes on click.
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
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsDone(false);
    setError("");
    setSuccessMsg("");
    setPreviewUrl(null);
    setName("");
    setEmail("");
    setPassword("Agent@2026!");
    setRole("agent");
    onClose();
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    // If already completed, clicking Done immediately closes the modal
    if (isDone) {
      handleClose();
      return;
    }

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
      setIsDone(true);
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
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#ea5414] underline pt-0.5 font-semibold flex items-center gap-1 hover:text-[#ff6422] transition-colors"
              >
                View Dispatched Email Preview <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleCreateAgent} className="space-y-4">
          <AgentFormFields
            name={name}
            email={email}
            password={password}
            role={role}
            disabled={loading || isDone}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRoleChange={setRole}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            {isDone ? (
              <Button
                type="button"
                onClick={handleClose}
                className="neu-btn-primary cursor-pointer border-none px-8 py-2.5 text-xs font-bold shadow-md hover:scale-102 transition-transform"
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="neu-btn text-slate-700 border-none cursor-pointer"
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
