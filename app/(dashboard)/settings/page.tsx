"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Copy,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Laptop,
  RefreshCw,
} from "lucide-react";
import { getWorkspaceSettings, updateWorkspaceSettings } from "@/actions/workspaceActions";
import { getCurrentUser } from "@/actions/authActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/store/useToastStore";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+92 300 1234567");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [desktopVersion, setDesktopVersion] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI?.isDesktop) {
      setIsDesktopApp(true);
      if (window.electronAPI.getAppVersion) {
        window.electronAPI.getAppVersion().then((ver) => setDesktopVersion(ver));
      }
    }
  }, []);

  const handleCheckForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      if (typeof window !== "undefined" && window.electronAPI?.checkForUpdates) {
        const res = await window.electronAPI.checkForUpdates();
        if (res?.updateAvailable) {
          toast.info(
            "Update Available",
            `A new version (v${res.latestVersion}) is ready to download.`
          );
        } else if (res?.success) {
          toast.success(
            "Up to Date",
            `ConvoDeck Desktop v${res.currentVersion || "0.2.0"} is up to date.`
          );
        } else if (res?.error) {
          toast.error("Check Failed", res.error);
        }
      } else {
        const res = await fetch("/api/version");
        const data = await res.json();
        toast.success(
          "Latest Cloud Version",
          `ConvoDeck is running version v${data.latestVersion || "0.2.0"}.`
        );
      }
    } catch {
      toast.error("Update Check Failed", "Unable to reach update server.");
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    async function load() {
      const userRes = await getCurrentUser();
      if (userRes?.user?.role === "agent") {
        router.push("/agent/dashboard");
        return;
      }

      const data = await getWorkspaceSettings();
      if (data) {
        setName(data.name || "");
        setPhoneNumber(data.whatsappPhoneNumber || "+92 300 1234567");
        setPhoneNumberId(data.whatsappPhoneNumberId || "108492019482910");
        setWabaId(data.whatsappBusinessAccountId || "293847561029384");
        setAccessToken(data.whatsappAccessToken || "EAAGm0PX4ZC_dummy_verified_token_convodeck");
        setWebhookToken(data.webhookVerifyToken || "convodeck_secure_token");
      }
    }
    load();
  }, []);

  const handleCopyWebhook = () => {
    const url = `${origin}/api/webhook/whatsapp`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Webhook URL Copied", "Webhook callback URL has been copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateWorkspaceSettings({
      name,
      whatsappPhoneNumber: phoneNumber,
      whatsappPhoneNumberId: phoneNumberId,
      whatsappBusinessAccountId: wabaId,
      whatsappAccessToken: accessToken,
      webhookVerifyToken: webhookToken,
    });

    setSaving(false);
    if (res.success) {
      toast.success(
        "Settings Saved",
        "WhatsApp Business line configuration updated successfully."
      );
      setMessage({
        type: "success",
        text: "Configuration saved successfully. Your WhatsApp Business line is active.",
      });
    } else {
      toast.error(
        "Save Failed",
        res.error || "Unable to save configuration. Please verify your details."
      );
      setMessage({
        type: "error",
        text: res.error || "Unable to save configuration. Please verify your details.",
      });
    }
  };

  const webhookUrl = `${origin || "https://your-domain.com"}/api/webhook/whatsapp`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Workspace & WhatsApp Integration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your organization details and configure your official WhatsApp Business line.
        </p>
      </div>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            message.type === "success"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-rose-100 text-rose-800 border border-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Active WhatsApp Business Line Overview Card */}
      <div className="neu-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center shrink-0 bg-[#f1f5f9]">
            <Phone className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Active WhatsApp Business Number</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Verified
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
              {phoneNumber}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Line Status</span>
          <span className="text-blue-600 font-bold flex items-center gap-1.5 sm:justify-end">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Ready for Multi-Agent Chat
          </span>
        </div>
      </div>

      {/* Live Webhook Sync Card */}
      <div className="neu-card text-slate-900 p-4 sm:p-6 rounded-3xl space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full neu-pressed text-blue-600 flex items-center justify-center font-bold shrink-0 bg-[#f1f5f9]">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Live Webhook Synchronization</h2>
              <p className="text-[11px] text-slate-500">Syncs incoming customer messages instantly across your team</p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs neu-pressed text-emerald-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Live Sync
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Copy this Webhook Callback URL and paste it into your <strong>Meta App Dashboard &gt; WhatsApp &gt; Configuration</strong> to automatically receive customer messages in real-time.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 neu-pressed p-2 rounded-2xl sm:rounded-full">
          <span className="text-xs text-slate-800 font-mono flex-1 break-all sm:truncate select-all px-3 py-1">
            {webhookUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyWebhook}
            aria-label="Copy webhook URL to clipboard"
            className="w-full sm:w-auto px-4 py-2 neu-btn-emerald rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                Copy URL
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} aria-label="WhatsApp and Workspace settings form" className="neu-card p-4 sm:p-6 rounded-3xl space-y-5 sm:space-y-6 text-slate-900 bg-white">
        {/* Section 1: Business Profile */}
        <div>
          <div className="border-b border-slate-200/80 pb-3 mb-4">
            <h2 className="font-bold text-sm text-slate-900">Organization Profile</h2>
            <p className="text-xs text-slate-500">Your company name as displayed to team members.</p>
          </div>

          <div className="max-w-md">
            <label htmlFor="settings-workspace-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Workspace Name <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="settings-workspace-name"
              name="workspaceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Marketing Agency"
              autoComplete="organization"
              required
              className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Section 2: WhatsApp Connection Parameters */}
        <div>
          <div className="border-b border-slate-200/80 pb-3 mb-4">
            <h2 className="font-bold text-sm text-slate-900">WhatsApp Business API Setup</h2>
            <p className="text-xs text-slate-500">
              Pre-configured with your active business line. You can customize these with your official Meta developer keys anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="settings-phone-number" className="block text-xs font-semibold text-slate-700 mb-1">
                Connected WhatsApp Phone
              </label>
              <input
                id="settings-phone-number"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+92 300 1234567"
                autoComplete="tel"
                className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="settings-phone-number-id" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number ID
              </label>
              <input
                id="settings-phone-number-id"
                name="phoneNumberId"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="108492019482910"
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="settings-waba-account-id" className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Business Account ID
              </label>
              <input
                id="settings-waba-account-id"
                name="wabaAccountId"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="293847561029384"
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="settings-webhook-verification-token" className="block text-xs font-semibold text-slate-700 mb-1">
                Webhook Verification Token <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="settings-webhook-verification-token"
                name="webhookToken"
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="convodeck_secure_token"
                autoComplete="off"
                required
                className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="settings-system-access-token" className="block text-xs font-semibold text-slate-700 mb-1">
              System User Access Token
            </label>
            <input
              id="settings-system-access-token"
              name="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAGm0PX4ZC..."
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm neu-input rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Line is verified and active across all agent seats
          </span>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 neu-btn-primary px-6 cursor-pointer border-none"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {saving ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </div>
      </form>

      {/* Application Version & Update Control */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <Laptop className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900">
                  {isDesktopApp ? "ConvoDeck Desktop Client" : "ConvoDeck SaaS Platform"}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  v{desktopVersion || "0.2.0"}
                </span>
                {isDesktopApp && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                    Windows x64
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isDesktopApp
                  ? "Automatic startup version check is active. You can also trigger an instant API check anytime."
                  : "Cloud platform version control and updates. Check for the latest release updates."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={checkingUpdate}
            variant="outline"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-600 ${
                checkingUpdate ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />
            {checkingUpdate ? "Checking Server..." : "Check for Updates"}
          </Button>
        </div>
      </div>

      {/* Onboarding & Tour Guide */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Interactive Onboarding & Platform Tour
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Walk through ConvoDeck features including WhatsApp Inbox, Visual Pipelines, Team Management, and API settings.
              </p>
            </div>
          </div>
          <TourLauncherButton variant="settings" />
        </div>
      </div>
    </div>
  );
}
