"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/actions/forgotPasswordActions";

interface ForgotPasswordResetStepProps {
  identifier: string;
  code: string;
  onSuccess: () => void;
}

export function ForgotPasswordResetStep({
  identifier,
  code,
  onSuccess,
}: ForgotPasswordResetStepProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isMinLength) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords are identical.");
      return;
    }

    setLoading(true);

    const res = await resetPassword({
      identifier,
      code,
      newPassword,
      confirmPassword,
    });

    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            New Password <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="new-password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Confirm New Password <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-base sm:text-xs neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="space-y-1 text-[11px] pt-1">
          <div
            className={`flex items-center gap-1.5 ${
              isMinLength ? "text-emerald-600 font-medium" : "text-slate-400"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>At least 6 characters long</span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              isMatching ? "text-emerald-600 font-medium" : "text-slate-400"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Both passwords match</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !isMinLength || !isMatching}
          className="w-full neu-btn-primary py-2.5 text-xs font-semibold rounded-2xl transition cursor-pointer"
        >
          {loading ? "Updating Password..." : "Reset Password & Secure Account"}
        </Button>
      </form>
    </div>
  );
}

