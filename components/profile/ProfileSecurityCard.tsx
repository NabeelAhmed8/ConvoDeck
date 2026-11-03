"use client";

import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { changeUserPassword } from "@/actions/profileActions";
import { toast } from "@/store/useToastStore";

export function ProfileSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Validation Error", "All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Weak Password", "New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mismatch", "New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Identical Password", "New password cannot be the same as your current password.");
      return;
    }

    setIsChanging(true);
    try {
      const res = await changeUserPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Password Updated", "Your account password has been changed securely.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Password Change Failed", res.error || "Could not update password.");
      }
    } catch {
      toast.error("Error", "An unexpected error occurred while changing password.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50">
          <KeyRound className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            Account Security &amp; Password
          </h2>
          <p className="text-xs text-slate-500">
            Update your master login credentials and secure your account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="sec-current-password"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              id="sec-current-password"
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 pr-10 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? "Hide password" : "Show password"}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password & Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sec-new-password"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              New Password (min 6 chars)
            </label>
            <div className="relative">
              <input
                id="sec-new-password"
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 pr-10 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="sec-confirm-password"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="sec-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 rounded-2xl neu-pressed bg-[#edf2f8] flex items-center gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] leading-tight text-slate-500">
            Changing your password will keep this session active while safely invalidating previous tokens on unverified devices.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isChanging}
            className="px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            {isChanging ? "Updating Password..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

