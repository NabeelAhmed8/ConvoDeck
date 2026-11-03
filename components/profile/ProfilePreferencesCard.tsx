"use client";

import React, { useState, useEffect } from "react";
import { Bell, Volume2, BellRing, CheckCircle2 } from "lucide-react";
import { toast } from "@/store/useToastStore";
import { playNotificationChime } from "@/lib/audioChime";

export function ProfilePreferencesCard() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check saved sound preference
    const savedSound = localStorage.getItem("convodeck_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }

    // Check browser notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const playTestChime = () => {
    setIsPlayingChime(true);
    playNotificationChime();
    setTimeout(() => {
      setIsPlayingChime(false);
    }, 350);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("convodeck_sound_enabled", String(next));
    if (next) {
      playTestChime();
      toast.success("Sound Alerts", "Audio chimes enabled for new WhatsApp messages.");
    } else {
      toast.info("Sound Alerts", "Audio chimes muted.");
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Not Supported", "Browser notifications are not supported on this device.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast.success("Notifications Enabled", "You will now receive desktop alerts for incoming messages.");
        new Notification("ConvoDeck CRM", {
          body: "Desktop notifications are now connected and active!",
          icon: "/favicon.ico",
        });
      } else if (permission === "denied") {
        toast.warning(
          "Permission Denied",
          "Notifications were blocked in your browser settings."
        );
      }
    } catch {
      toast.error("Error", "Could not request notification permission.");
    }
  };

  return (
    <div className="neu-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 border-b border-slate-300/40 pb-3 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff6422] flex items-center justify-center border border-orange-200/50 shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            Notifications &amp; Audio Preferences
          </h2>
          <p className="text-xs text-slate-500 leading-tight">
            Customize incoming lead chimes and desktop alert settings.
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Audio Chime Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl neu-pressed bg-[#edf2f8] w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl neu-convex flex items-center justify-center text-slate-700 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                Incoming Message Audio Chimes
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Play a pleasant audio chime when new WhatsApp leads arrive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={playTestChime}
              disabled={isPlayingChime}
              aria-label="Play test chime"
              className="px-3 py-1.5 neu-btn rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-75"
            >
              <Volume2 className={`w-3.5 h-3.5 text-[#ff6422] ${isPlayingChime ? "animate-pulse" : ""}`} />
              <span>{isPlayingChime ? "Playing..." : "Test Chime"}</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={toggleSound}
              aria-label="Toggle audio chimes"
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                soundEnabled ? "bg-[#ff6422]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Desktop Notifications Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl neu-pressed bg-[#edf2f8] w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl neu-convex flex items-center justify-center text-slate-700 shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                Browser Desktop Notifications
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Receive pop-up notifications even when ConvoDeck is minimized.
              </p>
            </div>
          </div>

          <div className="self-end sm:self-auto shrink-0">
            {notificationPermission === "granted" ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            ) : notificationPermission === "denied" ? (
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-bold">
                Blocked in Browser
              </span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 neu-btn rounded-xl text-xs font-bold text-[#ea5414] hover:text-[#ff6422] cursor-pointer transition-colors"
              >
                Enable Alerts
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

