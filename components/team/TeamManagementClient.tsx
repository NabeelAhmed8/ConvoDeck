"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserX,
  UserCheck,
  LogOut,
  Trash2,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Activity,
  ExternalLink,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createTeamAgent,
  toggleAgentStatus,
  revokeAgentSession,
  deleteTeamAgent,
} from "@/actions/teamActions";
import { IUser, IAuditLog, UserRole, UserStatus } from "@/types";
import { toast } from "@/store/useToastStore";

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

  // Add Agent Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Agent@2026!");
  const [role, setRole] = useState<UserRole>("agent");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<IUser | null>(null);

  // Search filter
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
      setMembers([res.member, ...members]);
      setSuccessMsg(`Agent account for ${name} created! Credentials sent to ${email}.`);
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      toast.success(
        `Agent Created: ${name}`,
        `Invitation & credentials dispatched to ${email}`
      );
      setName("");
      setEmail("");
      setPassword("Agent@2026!");
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccessMsg("");
      }, 3500);
    } else {
      setError(res.error || "Failed to create agent");
      toast.error("Creation Failed", res.error || "Failed to create agent account");
    }
  };

  const handleToggleStatus = async (agent: IUser) => {
    const isCurrentActive = agent.status !== "suspended";
    const nextStatus: UserStatus = isCurrentActive ? "suspended" : "active";

    setActionLoadingId(agent._id!);
    const res = await toggleAgentStatus({
      agentId: agent._id!,
      newStatus: nextStatus,
    });
    setActionLoadingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m._id === agent._id ? { ...m, status: nextStatus } : m))
      );
      if (nextStatus === "suspended") {
        toast.warning(
          "Account Deactivated",
          `${agent.name} is now suspended and logged out from ConvoDeck.`
        );
      } else {
        toast.success(
          "Account Activated",
          `${agent.name}'s account is active and authorized to login.`
        );
      }
    } else {
      toast.error("Action Failed", res.error || "Failed to update agent status");
    }
  };

  const handleRevokeSession = async (agent: IUser) => {
    setActionLoadingId(agent._id!);
    const res = await revokeAgentSession(agent._id!);
    setActionLoadingId(null);

    if (res.success) {
      toast.success(
        "Session Terminated",
        `Access revoked. ${agent.name} has been force logged out.`
      );
    } else {
      toast.error("Revocation Failed", res.error || "Failed to revoke session");
    }
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete?._id) return;
    const targetAgent = agentToDelete;
    setAgentToDelete(null);
    setActionLoadingId(targetAgent._id!);

    const res = await deleteTeamAgent(targetAgent._id!);
    setActionLoadingId(null);

    if (res.success) {
      setMembers((prev) => prev.filter((m) => m._id !== targetAgent._id));
      toast.success(
        "Agent Removed",
        `${targetAgent.name}'s account has been permanently deleted.`
      );
    } else {
      toast.error("Deletion Failed", res.error || "Failed to delete agent");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Role-Based Access Control (RBAC) & Offboarding
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Team Management & Security Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage unique agent logins, revoke access for offboarded staff, and inspect message audit trails.
          </p>
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 neu-btn-primary cursor-pointer border-none rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Agent</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card neu-card-hover p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Team</span>
            <div className="p-2.5 rounded-xl neu-pressed text-blue-600 bg-[#f1f5f9]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{members.length}</p>
          <span className="text-[11px] text-slate-500">Registered agent logins</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Now</span>
            <div className="p-2.5 rounded-xl neu-pressed text-emerald-600 bg-[#f1f5f9]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeAgentsCount}</p>
          <span className="text-[11px] text-slate-500">Authorized to chat</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deactivated / Offboarded</span>
            <div className="p-2.5 rounded-xl neu-pressed text-rose-600 bg-[#f1f5f9]">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{suspendedCount}</p>
          <span className="text-[11px] text-slate-500">Access revoked</span>
        </div>

        <div className="neu-card neu-card-hover p-5 rounded-2xl bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Audit Trail Events</span>
            <div className="p-2.5 rounded-xl neu-pressed text-purple-600 bg-[#f1f5f9]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">{logs.length}</p>
          <span className="text-[11px] text-slate-500">Logged actions</span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="neu-card rounded-3xl overflow-hidden text-slate-900 bg-white">
        {/* Tab Navigation & Search */}
        <div className="p-3 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="neu-tab-container p-1 rounded-2xl sm:rounded-full w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("agents")}
              className={`px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
                activeTab === "agents"
                  ? "neu-tab-active"
                  : "neu-tab"
              }`}
            >
              <span className="hidden sm:inline">Team </span>Agents ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
                activeTab === "audit"
                  ? "neu-tab-active"
                  : "neu-tab"
              }`}
            >
              Audit Trail<span className="hidden sm:inline"> & Logs</span> ({logs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <label htmlFor="team-search-input" className="sr-only">
              Search agents or audit events
            </label>
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="team-search-input"
              name="teamSearch"
              type="search"
              aria-label={activeTab === "agents" ? "Search agents by name or email" : "Search audit events"}
              placeholder={activeTab === "agents" ? "Search agents by name or email..." : "Search audit events..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-2 text-base sm:text-xs neu-input rounded-full text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Team Agents Table */}
        {activeTab === "agents" ? (
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 whitespace-nowrap">Agent Name</th>
                  <th className="py-3 px-6 whitespace-nowrap">Work Email</th>
                  <th className="py-3 px-6 whitespace-nowrap">Role (RBAC)</th>
                  <th className="py-3 px-6 whitespace-nowrap">Status</th>
                  <th className="py-3 px-6 whitespace-nowrap">Last Active</th>
                  {isAdmin && <th className="py-3 px-6 text-right whitespace-nowrap">Access Controls</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredMembers.map((member) => {
                  const isSuspended = member.status === "suspended";
                  const isSelf = member._id === currentUserId;

                  return (
                    <tr key={member._id} className="hover:bg-slate-200/40 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full neu-pressed text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {member.name} {isSelf && <span className="text-[10px] text-blue-600 font-bold">(You)</span>}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Joined {new Date(member.createdAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700 whitespace-nowrap">{member.email}</td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            member.role === "admin"
                              ? "bg-purple-100 text-purple-800 border border-purple-300"
                              : member.role === "manager"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "neu-pressed text-slate-700"
                          }`}
                        >
                          {member.role === "admin" ? "Admin / Owner" : member.role === "manager" ? "Team Manager" : "Sales Agent"}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            Deactivated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Never"}
                      </td>

                      {isAdmin && (
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-500 italic">Owner Account</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Active / Suspended (Offboarding) */}
                              <button
                                type="button"
                                disabled={actionLoadingId === member._id}
                                onClick={() => handleToggleStatus(member)}
                                className={`px-3.5 py-1.5 rounded-full font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                  isSuspended
                                    ? "neu-btn-emerald text-emerald-950"
                                    : "bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300"
                                }`}
                              >
                                {isSuspended ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Activate
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    Disable Account
                                  </>
                                )}
                              </button>

                              {/* Force Logout */}
                              {!isSuspended && (
                                <button
                                  type="button"
                                  title="Force Logout / Revoke Active Session"
                                  disabled={actionLoadingId === member._id}
                                  onClick={() => handleRevokeSession(member)}
                                  className="p-2 text-amber-700 hover:text-amber-900 neu-btn rounded-full transition-colors cursor-pointer"
                                >
                                  <LogOut className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete Agent */}
                              <button
                                type="button"
                                title="Delete Agent Account"
                                disabled={actionLoadingId === member._id}
                                onClick={() => setAgentToDelete(member)}
                                className="p-2 text-slate-500 hover:text-rose-600 neu-btn rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Live Audit Trail Table */
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 whitespace-nowrap">Timestamp</th>
                  <th className="py-3 px-6 whitespace-nowrap">Actor (Agent)</th>
                  <th className="py-3 px-6 whitespace-nowrap">Action Performed</th>
                  <th className="py-3 px-6 whitespace-nowrap">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-200/40 transition-colors">
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-500">
                        {new Date(log.createdAt || Date.now()).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.actorName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full neu-pressed text-slate-700 font-semibold uppercase">
                            {log.actorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{log.actorEmail}</span>
                      </td>

                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            log.action === "SENT_MESSAGE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : log.action === "DEACTIVATED_AGENT" || log.action === "REVOKED_ACCESS"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : log.action === "UPDATED_LEAD_STAGE"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-purple-100 text-purple-800 border border-purple-300"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-800 max-w-md font-mono text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Agent Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="neu-card rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200/80 relative space-y-5 animate-in zoom-in-95 duration-150 text-slate-900">
            <div>
              <div className="w-10 h-10 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center mb-3">
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
                    className="text-blue-600 underline pt-1 font-semibold flex items-center gap-1"
                  >
                    View Dispatched Email Preview <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label htmlFor="agent-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label htmlFor="agent-work-email" className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label htmlFor="agent-initial-password" className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label htmlFor="agent-role-select" className="block text-xs font-semibold text-slate-700 mb-1">
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="neu-btn text-slate-700 border-none"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="neu-btn-primary cursor-pointer border-none">
                  {loading ? "Creating..." : "Create & Send Credentials"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal for Permanent Delete */}
      {agentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="neu-card rounded-3xl max-w-sm w-full p-6 bg-white border border-slate-200/80 space-y-4 animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="w-12 h-12 rounded-2xl neu-pressed text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Delete Agent Account?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-slate-900">{agentToDelete.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="flex-1 py-2.5 px-4 neu-btn text-slate-700 font-bold text-xs rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === agentToDelete._id}
                onClick={confirmDeleteAgent}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full transition-colors shadow-md shadow-rose-600/30 cursor-pointer"
              >
                {actionLoadingId === agentToDelete._id ? "Deleting..." : "Delete Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
