"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { getWorkspaceSettings } from "@/actions/workspaceActions";
import { getCurrentUser } from "@/actions/authActions";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { ConnectedLineCard } from "@/components/settings/ConnectedLineCard";
import { MetaApiConnectionForm } from "@/components/settings/MetaApiConnectionForm";
import { WebhookCard } from "@/components/settings/WebhookCard";
import { WorkspaceProfileCard } from "@/components/settings/WorkspaceProfileCard";
import { TransferWorkspaceOwnershipCard } from "@/components/settings/TransferWorkspaceOwnershipCard";
import { DeleteWorkspaceCard } from "@/components/settings/DeleteWorkspaceCard";

export default function SettingsPage() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState("");
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookToken, setWebhookToken] = useState("");

  useEffect(() => {
    async function load() {
      const userRes = await getCurrentUser();
      if (userRes?.user?.role === "agent") {
        router.push("/agent/dashboard");
        return;
      }

      const data = await getWorkspaceSettings();
      if (data) {
        setWorkspaceId(data._id?.toString() || "");
        setName(data.name || "");
        setContactEmail(data.contactEmail || "");
        setOwnerEmail(data.ownerEmail || "");
        setPhoneNumber(data.whatsappPhoneNumber || "");
        setPhoneNumberId(data.whatsappPhoneNumberId || "");
        setWabaId(data.whatsappBusinessAccountId || "");
        setAccessToken(data.whatsappAccessToken || "");
        setWebhookToken(data.webhookVerifyToken || "convodeck_secure_token");
      }
    }
    load();
  }, [router]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-slate-800">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Workspace Settings &amp; WhatsApp Integration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage workspace identity, dedicated contact routing, ownership transfer, and Meta WhatsApp Cloud API credentials.
        </p>
      </div>

      {/* 1. Workspace Profile & Dedicated Contact Email Card */}
      <WorkspaceProfileCard
        initialName={name}
        initialContactEmail={contactEmail}
        ownerEmail={ownerEmail}
        onSaved={({ name: newName, contactEmail: newEmail }) => {
          setName(newName);
          setContactEmail(newEmail);
        }}
      />

      {/* 2. Official Meta WhatsApp Cloud API Card */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900">Official Meta WhatsApp Cloud API</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  100% Official &amp; Ban-Proof
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official enterprise connection via Meta Graph API v21.0. Zero ban risk for your business line.
              </p>
            </div>
          </div>
        </div>

        {/* Connected Line Banner if active */}
        {phoneNumber && (
          <ConnectedLineCard
            phoneNumber={phoneNumber}
            onDisconnected={() => {
              setPhoneNumber("");
              setPhoneNumberId("");
              setWabaId("");
              setAccessToken("");
            }}
          />
        )}

        {/* Meta API Connection Form */}
        <MetaApiConnectionForm
          initialPhone={phoneNumber}
          initialPhoneId={phoneNumberId}
          initialWabaId={wabaId}
          initialToken={accessToken}
          webhookToken={webhookToken}
          onSaved={(data) => {
            setPhoneNumber(data.phoneNumber);
            setPhoneNumberId(data.phoneNumberId);
            setWabaId(data.wabaId);
            setAccessToken(data.accessToken);
          }}
        />

        {/* Webhook Configuration Card */}
        <WebhookCard webhookToken={webhookToken} />
      </div>

      {/* 3. Transfer Workspace Ownership Card */}
      <TransferWorkspaceOwnershipCard
        currentOwnerEmail={ownerEmail}
        workspaceName={name}
        onTransferred={(newOwner) => setOwnerEmail(newOwner)}
      />

      {/* 4. Danger Zone: Delete Workspace */}
      <DeleteWorkspaceCard
        workspaceName={name}
        workspaceId={workspaceId}
      />

      {/* 5. Onboarding & Tour Guide */}
      <div className="neu-card rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/50 flex items-center justify-center shrink-0 text-[#ff6422]">
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
