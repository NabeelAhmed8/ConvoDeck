"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Laptop,
  RefreshCw,
  Sparkles,
  Building2,
  Save,
  MessageSquare,
} from "lucide-react";
import { getWorkspaceSettings, updateWorkspaceSettings } from "@/actions/workspaceActions";
import { getCurrentUser } from "@/actions/authActions";
import { toast } from "@/store/useToastStore";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { EmbeddedSignupButton } from "@/components/settings/EmbeddedSignupButton";
import { ConnectedLineCard } from "@/components/settings/ConnectedLineCard";
import { ManualConfigAccordion } from "@/components/settings/ManualConfigAccordion";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [savingName, setSavingName] = useState(false);
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
          toast.info("Update Available", `A new version (v${res.latestVersion}) is ready.`);
        } else if (res?.success) {
          toast.success("Up to Date", `ConvoDeck Desktop v${res.currentVersion || "0.2.0"} is up to date.`);
        } else if (res?.error) {
          toast.error("Check Failed", res.error);
        }
      } else {
        const res = await fetch("/api/version");
        const data = await res.json();
        toast.success("Latest Cloud Version", `ConvoDeck is running version v${data.latestVersion || "0.2.0"}.`);
      }
    } catch {
      toast.error("Update Check Failed", "Unable to reach update server.");
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    async function load() {
      const userRes = await getCurrentUser();
      if (userRes?.user?.role === "agent") {
        router.push("/agent/dashboard");
        return;
      }

      const data = await getWorkspaceSettings();
      if (data) {
        setName(data.name || "");
        setPhoneNumber(data.whatsappPhoneNumber || "");
        setPhoneNumberId(data.whatsappPhoneNumberId || "");
        setWabaId(data.whatsappBusinessAccountId || "");
        setAccessToken(data.whatsappAccessToken || "");
        setWebhookToken(data.webhookVerifyToken || "convodeck_secure_token");
      }
    }
    load();
  }, [router]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    const res = await updateWorkspaceSettings({
      name,
      whatsappPhoneNumber: phoneNumber,
      whatsappPhoneNumberId: phoneNumberId,
      whatsappBusinessAccountId: wabaId,
      whatsappAccessToken: accessToken,
      webhookVerifyToken: webhookToken,
    });
    setSavingName(false);
    if (res.success) {
      toast.success("Updated", "Workspace name updated.");
    } else {
      toast.error("Error", res.error || "Failed to update workspace name.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-slate-800">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings &amp; WhatsApp Integration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your company profile, connect your official WhatsApp business line, and configure system preferences.
        </p>
      </div>

      {/* 1. Workspace Profile Card */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Workspace Profile</h2>
            <p className="text-xs text-slate-500">Your organization name shown on reports and agent seats.</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Workspace Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Agency"
              className="w-full px-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={savingName}
            className="px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {savingName ? "Saving..." : "Save Name"}
          </button>
        </form>
      </div>

      {/* 2. WhatsApp Integration Card (Embedded 1-Click Signup + Connected Line Card) */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">WhatsApp Business Connection</h2>
              <p className="text-xs text-slate-500">Connect your WhatsApp number with 1-click to start receiving &amp; sending chats.</p>
            </div>
          </div>
        </div>

        {phoneNumber ? (
          <ConnectedLineCard
            phoneNumber={phoneNumber}
            onDisconnected={() => {
              setPhoneNumber("");
              setPhoneNumberId("");
              setWabaId("");
              setAccessToken("");
            }}
          />
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Fast 1-Click WhatsApp Connection</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                No complex Meta developer consoles needed. Link your WhatsApp business number directly to ConvoDeck.
              </p>
            </div>
            <EmbeddedSignupButton
              onSuccess={(phone) => {
                setPhoneNumber(phone);
              }}
            />
          </div>
        )}

        {/* Manual / Advanced Developer Accordion */}
        <ManualConfigAccordion
          name={name}
          phoneNumber={phoneNumber}
          phoneNumberId={phoneNumberId}
          wabaId={wabaId}
          accessToken={accessToken}
          webhookToken={webhookToken}
          onSaved={(data) => {
            setPhoneNumber(data.phoneNumber);
            setPhoneNumberId(data.phoneNumberId);
            setWabaId(data.wabaId);
            setAccessToken(data.accessToken);
          }}
        />
      </div>

      {/* 3. Platform & Desktop Version Control */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Laptop className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {isDesktopApp ? "ConvoDeck Desktop Client" : "ConvoDeck SaaS Platform"}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                v{desktopVersion || "0.2.0"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Automatic startup version check and live cloud updates.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckForUpdates}
          disabled={checkingUpdate}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? "animate-spin" : ""}`} />
          {checkingUpdate ? "Checking..." : "Check for Updates"}
        </button>
      </div>

      {/* 4. Onboarding & Tour Guide */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Interactive Tour &amp; Buttons Guide</h3>
            <p className="text-xs text-slate-500 mt-1">
              Relaunch the interactive walkthrough or browse all button definitions across ConvoDeck.
            </p>
          </div>
        </div>
        <TourLauncherButton variant="settings" />
      </div>
    </div>
  );
}
