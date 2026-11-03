"use client";

import React, { useRef } from "react";
import { Upload, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "@/store/useToastStore";

interface ProfileAvatarUploaderProps {
  currentAvatar: string;
  initials: string;
  onAvatarChange: (newAvatar: string) => void;
}

// 8 Curated high-contrast SVG avatar presets (100% offline & instant)
export const AVATAR_PRESETS = [
  {
    id: "orange",
    label: "ConvoDeck Orange",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23ff6422'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "emerald",
    label: "Emerald Live",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%2310b981'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "indigo",
    label: "Indigo Pro",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%236366f1'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "sky",
    label: "Sky Tech",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%230284c7'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "purple",
    label: "Purple Executive",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%238b5cf6'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "rose",
    label: "Rose Vibrant",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23f43f5e'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "amber",
    label: "Amber Gold",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23d97706'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
  {
    id: "slate",
    label: "Slate Minimal",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23334155'/><circle cx='40' cy='32' r='14' fill='%23ffffff'/><path d='M18 66c0-12 10-20 22-20s22 8 22 20' fill='%23ffffff'/></svg>",
  },
];

export function ProfileAvatarUploader({
  currentAvatar,
  initials,
  onAvatarChange,
}: ProfileAvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", "Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Limit to 1.5MB to ensure fast loading and responsive DB queries
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("File Too Large", "Please select an image smaller than 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onAvatarChange(dataUrl);
        toast.success("Avatar Selected", "Click 'Save Identity' below to persist changes.");
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick the same file again if desired
    e.target.value = "";
  };

  return (
    <div className="p-4 rounded-2xl neu-pressed bg-[#e9eff6] space-y-4">
      {/* Current Avatar & Actions Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar Preview */}
          <div className="w-16 h-16 rounded-full neu-convex flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/80 shadow-md">
            {currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-black text-lg text-slate-800">{initials}</span>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-900">Profile Photo &amp; Avatar</p>
            <p className="text-[11px] text-slate-500">
              Upload custom image or pick from curated preset avatars below.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload custom avatar image"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 neu-btn rounded-xl text-xs font-bold text-slate-700 hover:text-[#ea5414] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </button>

          {currentAvatar && (
            <button
              type="button"
              onClick={() => {
                onAvatarChange("");
                toast.info("Avatar Reset", "Reverted to initials. Save to persist.");
              }}
              title="Remove custom avatar and revert to initials"
              className="p-1.5 neu-btn rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Remove avatar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Curated Presets Bar */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-[#ff6422]" />
          <span className="text-[11px] font-bold text-slate-700">Quick Avatar Presets:</span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 chat-scrollbar">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = currentAvatar === preset.src;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onAvatarChange(preset.src);
                  toast.success("Preset Selected", `${preset.label} selected. Save to apply.`);
                }}
                title={preset.label}
                aria-label={`Select ${preset.label} avatar`}
                className={`w-9 h-9 rounded-full neu-convex p-0.5 shrink-0 transition-transform cursor-pointer hover:scale-110 ${
                  isSelected ? "ring-2 ring-[#ff6422] scale-105" : "opacity-85 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.src}
                  alt={preset.label}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

