"use client";

import React from "react";
import { UserRole } from "@/types";

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
 * Single-responsibility component for rendering agent creation form inputs.
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
    <div className="space-y-4">
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
          className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={disabled}
          placeholder="asad@agency.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={disabled}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="agent-role-select"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Agent Role &amp; Permissions (RBAC) <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <select
          id="agent-role-select"
          name="agentRole"
          aria-label="Agent Role and Permissions"
          disabled={disabled}
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 font-semibold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="agent">Sales Agent (Chat &amp; Pipeline access only)</option>
          <option value="manager">Team Manager (Pipeline, Analytics &amp; Reports)</option>
          <option value="admin">Administrator / Co-Owner (Full access)</option>
        </select>
      </div>
    </div>
  );
}

