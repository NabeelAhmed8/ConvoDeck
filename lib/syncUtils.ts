// Audio tone & Cross-Tab BroadcastChannel utilities for ConvoDeck Live Real-Time Sync
import { playNotificationChime } from "@/lib/audioChime";

export function playIncomingMessageSound() {
  playNotificationChime({
    volume: 0.18,
    duration: 0.26,
    frequencyStart: 587.33,
    frequencyEnd: 880,
  });
}

export function getChatBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      return new BroadcastChannel("convodeck_chat_sync");
    } catch {
      return null;
    }
  }
  return null;
}
