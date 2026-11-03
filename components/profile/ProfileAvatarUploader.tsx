"use client";

import React, { useState } from "react";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/store/useToastStore";
import { processAvatarImage } from "@/lib/imageUtils";

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

/**
 * ProfileAvatarUploader
 * Single Responsibility: Manages user avatar selection, camera capture,
 * client-side instant optimization (< 50KB), and curated preset selections.
 * 100% reliable on iOS Safari, Android Chrome, and Desktop.
 */
export function ProfileAvatarUploader({
  currentAvatar,
  initials,
  onAvatarChange,
}: ProfileAvatarUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", "Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    setIsProcessing(true);
    try {
      // Auto-compress and center-crop to lightweight 256x256 avatar (< 50KB)
      // This handles photos of any size (even 10MB camera shots) instantly
      const optimizedDataUrl = await processAvatarImage(file, {
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.85,
        mimeType: "image/jpeg",
      });

      onAvatarChange(optimizedDataUrl);
      toast.success(
        "Avatar Selected",
        "Photo processed! Click 'Save Identity' below to persist changes."
      );
    } catch (err) {
      console.error("Avatar compression failed:", err);
      toast.error(
        "Upload Failed",
        err instanceof Error ? err.message : "Could not process image."
      );
    } finally {
      setIsProcessing(false);
      // Reset input value so the same file can be re-selected if desired
      e.target.value = "";
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl neu-pressed bg-[#e9eff6] space-y-3.5 sm:space-y-4 w-full max-w-full overflow-hidden">
      {/* Current Avatar & Actions Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Avatar Preview Circle */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full neu-convex flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/80 shadow-md relative">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <Loader2 className="w-5 h-5 text-[#ff6422] animate-spin" />
              </div>
            ) : currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-black text-base sm:text-lg text-slate-800">{initials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">Profile Photo &amp; Avatar</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              {isProcessing
                ? "Optimizing photo for mobile..."
                : "Upload custom photo or pick from instant offline avatars."}
            </p>
          </div>
        </div>

        {/* Action Buttons: Native HTML Label trigger prevents iOS Safari click blocking */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <label
            htmlFor="profile-avatar-file-input"
            className="px-3 py-1.5 neu-btn rounded-xl text-xs font-bold text-slate-700 hover:text-[#ea5414] flex items-center gap-1.5 transition-colors cursor-pointer select-none"
          >
            <Upload className="w-3.5 h-3.5 text-[#ff6422]" />
            <span>{isProcessing ? "Processing..." : "Upload Photo"}</span>
            <input
              id="profile-avatar-file-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
              disabled={isProcessing}
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="Upload custom avatar photo"
            />
          </label>

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
      <div className="w-full max-w-full min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-[#ff6422]" />
          <span className="text-[11px] font-bold text-slate-700">Quick Avatar Presets:</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1.5 chat-scrollbar w-full max-w-full touch-pan-x">
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
