"use client";

import React from "react";
import { Lock, UserX, UserCheck, Trash2 } from "lucide-react";
import { IUser } from "@/types";

interface TeamAgentsListProps {
  members: IUser[];
  currentUserId: string;
  isAdmin: boolean;
  actionLoadingId: string | null;
  onRevokeSession: (memberId: string) => void;
  onToggleStatus: (member: IUser) => void;
  onRequestDelete: (member: IUser) => void;
}

export function TeamAgentsList({
  members,
  currentUserId,
  isAdmin,
  actionLoadingId,
  onRevokeSession,
  onToggleStatus,
  onRequestDelete,
}: TeamAgentsListProps) {
  if (members.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No team members match your search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto chat-scrollbar w-full max-w-full">
      <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
        <thead className="bg-[#f8fafc] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-6 whitespace-nowrap">Agent Name</th>
            <th className="py-3 px-6 whitespace-nowrap">Work Email</th>
            <th className="py-3 px-6 whitespace-nowrap">Role (RBAC)</th>
            <th className="py-3 px-6 whitespace-nowrap">Status</th>
            <th className="py-3 px-6 whitespace-nowrap">Last Active</th>
            {isAdmin && (
              <th className="py-3 px-6 text-right whitespace-nowrap">
                Access Controls
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80">
          {members.map((member) => {
            const isSuspended = member.status === "suspended";
            const isSelf = member._id === currentUserId;
            const isLoading = actionLoadingId === member._id;

            return (
              <tr
                key={member._id}
                className="hover:bg-slate-200/40 transition-colors"
              >
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full neu-pressed text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {member.name}{" "}
                        {isSelf && (
                          <span className="text-[10px] text-[#ea5414] font-bold">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Joined{" "}
                        {new Date(
                          member.createdAt || Date.now()
                        ).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6 font-mono text-slate-700 whitespace-nowrap">
                  {member.email}
                </td>

                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-[#ff6422]/10 text-[#ea5414] border border-[#ff6422]/20"
                    }`}
                  >
                    {member.role === "admin" ? "Workspace Admin" : "Sales Agent"}
                  </span>
                </td>

                <td className="py-4 px-6 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isSuspended
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSuspended ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    {isSuspended ? "Deactivated" : "Active"}
                  </span>
                </td>

                <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                  {member.lastLoginAt
                    ? new Date(member.lastLoginAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </td>

                {isAdmin && (
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {!isSelf && (
                      <div className="flex items-center justify-end gap-2">
                        {/* Revoke Session */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => onRevokeSession(member._id!)}
                          aria-label={`Revoke active sessions for ${member.name}`}
                          title="Instant offboarding: Terminate all active sessions"
                          className="p-1.5 text-slate-500 hover:text-amber-700 neu-btn rounded-xl transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Suspend / Reactivate */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => onToggleStatus(member)}
                          aria-label={
                            isSuspended
                              ? `Reactivate account for ${member.name}`
                              : `Deactivate account for ${member.name}`
                          }
                          title={
                            isSuspended ? "Reactivate Agent" : "Deactivate Agent"
                          }
                          className={`p-1.5 neu-btn rounded-xl transition-colors cursor-pointer ${
                            isSuspended
                              ? "text-emerald-700 hover:bg-emerald-100"
                              : "text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {isSuspended ? (
                            <UserCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete Agent */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => onRequestDelete(member)}
                          aria-label={`Permanently delete agent ${member.name}`}
                          title="Delete Agent"
                          className="p-1.5 text-rose-600 hover:text-rose-700 neu-btn rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
  );
}
