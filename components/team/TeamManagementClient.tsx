"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  UserX,
  Activity,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  toggleAgentStatus,
  revokeAgentSession,
  deleteTeamAgent,
  updateTeamMemberRole,
} from "@/actions/teamActions";
import { IUser, IAuditLog, UserRole } from "@/types";
import { toast } from "@/store/useToastStore";
import { TeamAgentsList } from "@/components/team/TeamAgentsList";
import { TeamAuditLogs } from "@/components/team/TeamAuditLogs";
import { AddAgentModal } from "@/components/team/AddAgentModal";
import { DeleteAgentModal } from "@/components/team/DeleteAgentModal";
import { ROLE_OPTIONS } from "@/components/team/AgentRoleSelect";

interface TeamManagementClientProps {
  initialMembers: IUser[];
  initialLogs: IAuditLog[];
  currentUserId: string;
  currentUserRole: string;
}

export function TeamManagementClient({
  initialMembers,
  initialLogs,
  currentUserId,
  currentUserRole,
}: TeamManagementClientProps) {
  const [members, setMembers] = useState<IUser[]>(initialMembers);
  const [logs, setLogs] = useState<IAuditLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState<"agents" | "audit">("agents");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<IUser | null>(null);
  const [search, setSearch] = useState("");

  const isAdmin = currentUserRole === "admin";
  const activeAgentsCount = members.filter((m) => m.status !== "suspended").length;
  const suspendedCount = members.filter((m) => m.status === "suspended").length;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = logs.filter(
    (l) =>
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevokeSession = async (memberId: string) => {
    setActionLoadingId(memberId);
    const res = await revokeAgentSession(memberId);
    setActionLoadingId(null);

    if (res.success) {
      toast.success(
        "Session Terminated",
        "Agent credentials revoked. They have been logged out instantly."
      );
    } else {
      toast.error("Action Failed", res.error || "Could not revoke session");
    }
  };

  const handleToggleStatus = async (member: IUser) => {
    const isCurrentlySuspended = member.status === "suspended";
    const newStatus = isCurrentlySuspended ? "active" : "suspended";
    setActionLoadingId(member._id!);

    const res = await toggleAgentStatus({
      agentId: member._id!,
      newStatus,
    });
    setActionLoadingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, status: newStatus } : m))
      );
      toast.success(
        isCurrentlySuspended ? "Agent Reactivated" : "Agent Deactivated",
        `${member.name} status updated to ${newStatus}`
      );
    } else {
      toast.error("Status Change Failed", res.error || "Could not change status");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setActionLoadingId(memberId);
    const res = await updateTeamMemberRole({ memberId, newRole });
    setActionLoadingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
      );
      const roleTitle =
        ROLE_OPTIONS.find((r) => r.id === newRole)?.title || newRole;
      toast.success(
        "Role Updated",
        `Team member permissions updated to ${roleTitle}.`
      );
    } else {
      toast.error("Role Update Failed", res.error || "Could not update role");
    }
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete?._id) return;
    setActionLoadingId(agentToDelete._id);

    const res = await deleteTeamAgent(agentToDelete._id);
    setActionLoadingId(null);

    if (res.success) {
      setMembers((prev) => prev.filter((m) => m._id !== agentToDelete._id));
      toast.success(
        "Agent Deleted",
        `Removed ${agentToDelete.name} from your workspace`
      );
      setAgentToDelete(null);
    } else {
      toast.error("Delete Failed", res.error || "Could not delete agent");
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto w-full pb-8">
      {/* Top Banner Header - Sleek & Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Team &amp; Sales Agents
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Manage unique agent logins, revoke access for offboarded staff, and inspect message audit trails.
          </p>
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 neu-btn-primary cursor-pointer border-none rounded-full px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Agent</span>
          </Button>
        )}
      </div>

      {/* Metrics Row - Compact Horizontal Stat Cards to Elevate Content */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="neu-card p-3 sm:p-3.5 rounded-2xl bg-white flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block truncate">Total Team</span>
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">{members.length}</p>
          </div>
          <div className="p-2 rounded-xl neu-pressed text-[#ff6422] bg-[#f1f5f9] shrink-0 ml-2">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="neu-card p-3 sm:p-3.5 rounded-2xl bg-white flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block truncate">Active Now</span>
            <p className="text-lg sm:text-xl font-black text-emerald-600 leading-tight mt-0.5">{activeAgentsCount}</p>
          </div>
          <div className="p-2 rounded-xl neu-pressed text-emerald-600 bg-[#f1f5f9] shrink-0 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
          </div>
        </div>

        <div className="neu-card p-3 sm:p-3.5 rounded-2xl bg-white flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block truncate">Deactivated</span>
            <p className="text-lg sm:text-xl font-black text-rose-600 leading-tight mt-0.5">{suspendedCount}</p>
          </div>
          <div className="p-2 rounded-xl neu-pressed text-rose-600 bg-[#f1f5f9] shrink-0 ml-2">
            <UserX className="w-4 h-4" />
          </div>
        </div>

        <div className="neu-card p-3 sm:p-3.5 rounded-2xl bg-white flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block truncate">Audit Logs</span>
            <p className="text-lg sm:text-xl font-black text-purple-600 leading-tight mt-0.5">{logs.length}</p>
          </div>
          <div className="p-2 rounded-xl neu-pressed text-purple-600 bg-[#f1f5f9] shrink-0 ml-2">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Users Details Container - Moved Up Above The Fold */}
      <div className="neu-card rounded-3xl overflow-hidden text-slate-900 bg-white">
        {/* Tab Navigation & Search */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="neu-tab-container p-1 rounded-2xl sm:rounded-full w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("agents")}
              className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
                activeTab === "agents" ? "neu-tab-active" : "neu-tab"
              }`}
            >
              <span className="hidden sm:inline">Team </span>Agents ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
                activeTab === "audit" ? "neu-tab-active" : "neu-tab"
              }`}
            >
              Audit Trail<span className="hidden sm:inline"> &amp; Logs</span> ({logs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <label htmlFor="team-search-input" className="sr-only">
              Search agents or audit events
            </label>
            <Search
              className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="team-search-input"
              name="teamSearch"
              type="search"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              aria-label={
                activeTab === "agents"
                  ? "Search agents by name or email"
                  : "Search audit events"
              }
              placeholder={
                activeTab === "agents"
                  ? "Search agents by name or email..."
                  : "Search audit events..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 text-base sm:text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Agents */}
        {activeTab === "agents" ? (
          <TeamAgentsList
            members={filteredMembers}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            actionLoadingId={actionLoadingId}
            onRevokeSession={handleRevokeSession}
            onToggleStatus={handleToggleStatus}
            onRequestDelete={(member) => setAgentToDelete(member)}
            onRoleChange={handleRoleChange}
          />
        ) : (
          /* Tab 2: Audit Logs */
          <TeamAuditLogs logs={filteredLogs} />
        )}
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAgentCreated={(newMember) => {
          setMembers((prev) => [newMember, ...prev]);
        }}
      />

      {/* Delete Agent Modal */}
      <DeleteAgentModal
        agent={agentToDelete}
        isLoading={actionLoadingId === agentToDelete?._id}
        onClose={() => setAgentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
