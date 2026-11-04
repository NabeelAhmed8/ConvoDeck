"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, User, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { getOwnershipInviteDetails, completeOwnershipInvite } from "@/actions/workspaceActions";

function AcceptOwnershipContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError("Missing invitation token. Please check the link in your email.");
        setLoading(false);
        return;
      }

      try {
        const res = await getOwnershipInviteDetails(token);
        if (res.success && res.email) {
          setEmail(res.email);
          setWorkspaceName(res.workspaceName || "Workspace");
        } else {
          setError(res.error || "This invitation link is invalid or has expired.");
        }
      } catch {
        setError("Failed to verify invitation link. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await completeOwnershipInvite({
        token,
        name: name.trim(),
        password,
      });

      if (res.success) {
        setSuccess(true);
        // Direct redirect into the workspace dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setError(res.error || "Failed to activate your account. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-[#ff6422] animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Validating invitation link...</p>
      </div>
    );
  }

  // Error State: Invalid or Expired Token
  if (error && !email) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200/60 shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Invitation Link Expired</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {error}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold neu-btn text-slate-800 hover:text-slate-900 transition-all"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs animate-in zoom-in-75 duration-200">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Account Activated!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Opening your <strong>{workspaceName}</strong> dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Workspace Invitation Badge */}
      <div className="p-3.5 rounded-2xl neu-convex bg-[#edf1f7] border border-white/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff6422] flex items-center justify-center shrink-0 border border-orange-200/50">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Workspace Owner Invite
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
            {workspaceName}
          </span>
        </div>
      </div>

      {/* Header text */}
      <div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Set Up Your Owner Account
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter your name and choose a secure password to claim full ownership.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email (Read-only) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Registered Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3.5 py-2.5 text-xs neu-pressed rounded-2xl text-slate-500 font-semibold bg-[#e6edf5] cursor-not-allowed border border-transparent"
          />
        </div>

        {/* Full Name */}
        <div>
          <label
            htmlFor="owner-full-name"
            className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1"
          >
            Your Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="owner-full-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={submitting}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="owner-new-password"
            className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1"
          >
            Choose Password
          </label>
          <PasswordInput
            id="owner-new-password"
            name="newPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            required
            disabled={submitting}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="owner-confirm-password"
            className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1"
          >
            Confirm Password
          </label>
          <PasswordInput
            id="owner-confirm-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            disabled={submitting}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 neu-btn-primary text-white rounded-full text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating...</span>
              </>
            ) : (
              <>
                <span>Activate &amp; Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AcceptOwnershipPage() {
  return (
    <div className="min-h-screen bg-[#edf1f7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#ff6422]/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand squircle logo */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl neu-convex flex items-center justify-center font-black text-slate-900 text-2xl shadow-sm">
            C
          </div>
        </div>

        {/* Main tactile card */}
        <div className="neu-card rounded-3xl p-6 sm:p-8 bg-[#edf1f7] text-slate-900 shadow-xl border border-white/80">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-8 space-y-3">
                <Loader2 className="w-8 h-8 text-[#ff6422] animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Loading invitation...</p>
              </div>
            }
          >
            <AcceptOwnershipContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

