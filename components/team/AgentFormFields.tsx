"use client";

import React from "react";
import { UserRole } from "@/types";
import { AgentRoleSelect } from "./AgentRoleSelect";

interface AgentFormFieldsProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  disabled?: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onRoleChange: (val: UserRole) => void;
}

/**
 * AgentFormFields
 * Single-responsibility component for rendering agent creation form inputs
 * in a compact, responsive 2-column grid layout.
 */
export function AgentFormFields({
  name,
  email,
  password,
  role,
  disabled = false,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
}: AgentFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Full Name */}
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
          disabled={disabled}
          placeholder="e.g. Asad Ali"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Work Email */}
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
          disabled={disabled}
          placeholder="asad@agency.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Temporary Password */}
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
          disabled={disabled}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full px-3.5 py-2 text-xs neu-input rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Role & Permissions Dynamic Select */}
      <div>
        <label
          htmlFor="agent-role-select"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Role (RBAC) <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <AgentRoleSelect
          id="agent-role-select"
          value={role}
          onChange={onRoleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
