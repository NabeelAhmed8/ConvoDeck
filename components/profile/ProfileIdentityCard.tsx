"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Save, Lock } from "lucide-react";
import { updateUserProfile } from "@/actions/profileActions";
import { toast } from "@/store/useToastStore";
import { ProfileAvatarUploader } from "@/components/profile/ProfileAvatarUploader";

interface ProfileIdentityCardProps {
  initialName: string;
  email: string;
  initialPhone?: string;
  initialAvatar?: string;
  role: string;
  onProfileUpdated?: (newName: string, newAvatar?: string) => void;
}

export function ProfileIdentityCard({
  initialName,
  email,
  initialPhone = "",
  initialAvatar = "",
  role,
  onProfileUpdated,
}: ProfileIdentityCardProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [isSaving, setIsSaving] = useState(false);

  // Compute initials
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validation Error", "Full name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfile({ name, phone, avatar });
      if (res.success) {
        toast.success("Profile Updated", "Your personal details have been saved.");
        onProfileUpdated?.(name, avatar);
      } else {
        toast.error("Update Failed", res.error || "Could not update profile.");
      }
    } catch {
      toast.error("Error", "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="neu-card rounded-3xl p-5 sm:p-7 space-y-5">
      {/* Card Title */}
      <div className="flex items-center gap-3 border-b border-slate-300/40 pb-3">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            Personal Identity
          </h2>
          <p className="text-xs text-slate-500">
            Your name and contact details visible to team members and in internal logs.
          </p>
        </div>
      </div>

      {/* Avatar Uploader Component */}
      <ProfileAvatarUploader
        currentAvatar={avatar}
        initials={initials}
        onAvatarChange={setAvatar}
      />

      {/* Account Info Bar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl neu-pressed bg-[#edf2f8] text-xs">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{name || "User"}</p>
          <p className="text-[11px] text-slate-500 truncate">{email}</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100/70 text-[#ea5414] border border-orange-200/60 uppercase tracking-wider">
          {role === "admin" ? "Workspace Owner" : "Sales Agent"}
        </span>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="profile-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nabeel Ahmed"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="profile-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Primary Login
              </span>
            </div>
            <div className="relative">
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled
                value={email}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-pressed rounded-2xl text-slate-500 cursor-not-allowed bg-[#edf2f8]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Contact Phone */}
        <div>
          <label
            htmlFor="profile-phone"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Personal Contact / WhatsApp (Optional)
          </label>
          <div className="relative">
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +923001234567"
              className="w-full pl-9 pr-3.5 py-2.5 text-xs neu-input rounded-2xl text-slate-900 focus:outline-none font-mono"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Used for urgent system alerts and account recovery.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 neu-btn-primary rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Identity"}
          </button>
        </div>
      </form>
    </div>
  );
}

