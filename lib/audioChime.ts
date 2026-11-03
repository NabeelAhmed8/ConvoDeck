/**
 * lib/audioChime.ts
 * Single Responsibility: Web Audio API synthesizer for generating clean,
 * ephemeral notification chimes with guaranteed audio hardware cleanup
 * (preventing lingering oscillator beeps on mobile devices).
 */

export interface ChimeOptions {
  volume?: number;
  duration?: number;
  frequencyStart?: number;
  frequencyEnd?: number;
}

/**
 * Plays a pleasant SaaS double-tone chime and immediately closes the
 * Web Audio context to ensure no lingering audio tones remain active on mobile.
 */
export function playNotificationChime({
  volume = 0.15,
  duration = 0.28,
  frequencyStart = 587.33, // D5
  frequencyEnd = 880,      // A5
}: ChimeOptions = {}): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // In some mobile browsers, context must be resumed if suspended
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequencyStart, now);
    osc.frequency.exponentialRampToValueAtTime(frequencyEnd, now + 0.1);

    // Smooth envelope: Attack -> Decay -> Cutoff
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.gain.setValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Guaranteed hardware cleanup function
    const cleanup = () => {
      try {
        osc.disconnect();
        gain.disconnect();
        if (ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
      } catch {
        // Safe to ignore if already cleaned up
      }
    };

    // Terminate oscillator at exact duration
    osc.onended = cleanup;
    osc.start(now);
    osc.stop(now + duration);

    // Safety fallback timer in case onended is skipped by browser
    setTimeout(cleanup, (duration + 0.1) * 1000);
  } catch {
    // Gracefully ignore browser autoplay policy restrictions
  }
}

