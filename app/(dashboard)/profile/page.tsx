"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/actions/authActions";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfileSecurityCard } from "@/components/profile/ProfileSecurityCard";
import { ProfilePreferencesCard } from "@/components/profile/ProfilePreferencesCard";
import { ProfileSessionsCard } from "@/components/profile/ProfileSessionsCard";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  workspaceName: string;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const authData = await getCurrentUser();
        if (authData?.user) {
          setProfileData({
            id: authData.user._id || authData.user.id || "",
            name: authData.user.name || "",
            email: authData.user.email || "",
            phone: authData.user.phone || "",
            avatar: authData.user.avatar || "",
            role: authData.user.role || "admin",
            workspaceName: authData.workspace?.name || "My Workspace",
          });
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
        <p className="text-xs font-semibold text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-sm font-bold text-slate-700">Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-16 text-slate-800 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Page Header */}
      <ProfileHeader
        role={profileData.role}
        workspaceName={profileData.workspaceName}
      />

      {/* 1. Personal Identity & Contact */}
      <ProfileIdentityCard
        initialName={profileData.name}
        email={profileData.email}
        initialPhone={profileData.phone}
        initialAvatar={profileData.avatar}
        role={profileData.role}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* 2. Security & Password */}
      <ProfileSecurityCard />

      {/* 3. CRM & Audio Notification Preferences */}
      <ProfilePreferencesCard />

      {/* 4. Active Device & Session Info */}
      <ProfileSessionsCard />
    </div>
  );
}

