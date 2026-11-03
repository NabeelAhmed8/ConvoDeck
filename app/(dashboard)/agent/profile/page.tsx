"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Headphones, ArrowRight, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/actions/authActions";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfileSecurityCard } from "@/components/profile/ProfileSecurityCard";
import { ProfilePreferencesCard } from "@/components/profile/ProfilePreferencesCard";
import { ProfileSessionsCard } from "@/components/profile/ProfileSessionsCard";

interface AgentProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  workspaceName: string;
}

/**
 * Dedicated Agent Profile Page (/agent/profile)
 * Provides sales agents with a focused view to manage their workstation identity,
 * custom avatar, login password, and live customer chat chime alerts.
 */
export default function AgentProfilePage() {
  const [profileData, setProfileData] = useState<AgentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAgentData() {
      try {
        const authData = await getCurrentUser();
        if (authData?.user) {
          setProfileData({
            id: authData.user._id || authData.user.id || "",
            name: authData.user.name || "Sales Agent",
            email: authData.user.email || "",
            phone: authData.user.phone || "",
            avatar: authData.user.avatar || "",
            role: authData.user.role || "agent",
            workspaceName: authData.workspace?.name || "ConvoDeck Workspace",
          });
        }
      } catch (err) {
        console.error("Failed to load agent profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAgentData();
  }, []);

  const handleProfileUpdated = (newName: string, newAvatar?: string) => {
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            name: newName,
            ...(newAvatar !== undefined ? { avatar: newAvatar } : {}),
          }
        : null
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#ff6422] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading agent profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-sm font-bold text-slate-700">Unable to load agent profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-16 text-slate-800 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Agent Workstation Quick Switcher Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl neu-card bg-[#edf2f8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-orange-200/50 w-full min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/60 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm font-black text-slate-900 truncate">Agent Workstation Identity</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                Live Seat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">
              Assigned to {profileData.workspaceName}. Manage your credentials &amp; customer chat chimes.
            </p>
          </div>
        </div>

        <Link
          href="/agent/dashboard"
          className="w-full sm:w-auto px-4 py-2 neu-btn-primary rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer hover:scale-102 transition-transform"
        >
          Open Workstation
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        role={profileData.role}
        workspaceName={profileData.workspaceName}
      />

      {/* 1. Identity & Avatar Uploader */}
      <ProfileIdentityCard
        initialName={profileData.name}
        email={profileData.email}
        initialPhone={profileData.phone}
        initialAvatar={profileData.avatar}
        role={profileData.role}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* 2. Security & Password Change */}
      <ProfileSecurityCard />

      {/* 3. CRM & Audio Notification Preferences */}
      <ProfilePreferencesCard />

      {/* 4. Active Device & Workstation Session */}
      <ProfileSessionsCard />
    </div>
  );
}

