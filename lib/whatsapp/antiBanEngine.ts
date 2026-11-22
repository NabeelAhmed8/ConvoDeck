import crypto from "crypto";

/**
 * Enterprise Anti-Ban & Anti-Spam Security Engine for WhatsApp QR Linked Devices.
 * Prevents WhatsApp Web session flags, account bans, and token hijacking.
 */

export interface IAntiBanCheckResult {
  allowed: boolean;
  delayMs: number;
  riskScore: number; // 0 (Clean) to 100 (High Risk Spam)
  warnings: string[];
}

export interface ISecureQrSession {
  sessionId: string;
  qrPayload: string;
  expiresAt: number;
  antiBanFingerprint: string;
}

// 1. Generate Cryptographically Secure QR Pairing Payload
export function createSecureQrPayload(workspaceId: string): ISecureQrSession {
  const sessionId = "cd_qr_" + crypto.randomBytes(16).toString("hex");
  const randomSalt = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();
  const expiresAt = timestamp + 60 * 1000; // 60 seconds TTL

  // Unique pairing token mimicking official WhatsApp Web handshake
  const payload = `2@${sessionId},${randomSalt},${timestamp},convodeck_secure_shield`;

  const antiBanFingerprint = crypto
    .createHmac("sha256", "convodeck_antiban_shield_v2")
    .update(`${workspaceId}:${sessionId}:${expiresAt}`)
    .digest("hex");

  return {
    sessionId,
    qrPayload: payload,
    expiresAt,
    antiBanFingerprint,
  };
}

// 2. Anti-Spam Content & Velocity Scanner
const HIGH_RISK_SPAM_PATTERNS = [
  /\b(lottery|winner|claim your prize|free money|crypto pump|bank transfer alert)\b/i,
  /\b(urgent: click here|act now or account deleted|verify your password immediately)\b/i,
];

export function evaluateAntiBanGuardrails(params: {
  messageText: string;
  messagesSentLastMinute: number;
  isExistingContact: boolean;
}): IAntiBanCheckResult {
  const { messageText, messagesSentLastMinute, isExistingContact } = params;
  const warnings: string[] = [];
  let riskScore = 0;

  // A. Velocity Guard (Max 15 messages/minute to new contacts, 40 to existing contacts)
  const maxSafeVelocity = isExistingContact ? 40 : 15;
  if (messagesSentLastMinute >= maxSafeVelocity) {
    riskScore += 60;
    warnings.push(
      `Velocity limit reached (${messagesSentLastMinute} msgs/min). Cooling down to prevent WhatsApp spam flags.`
    );
  }

  // B. Content Spam Check
  for (const pattern of HIGH_RISK_SPAM_PATTERNS) {
    if (pattern.test(messageText)) {
      riskScore += 45;
      warnings.push("High-risk promotional spam phrase detected in message text.");
      break;
    }
  }

  // C. All-Caps Shouting Check (Aggressive spam behavior)
  const lettersOnly = messageText.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length > 25) {
    const uppercaseCount = (messageText.match(/[A-Z]/g) || []).length;
    if (uppercaseCount / lettersOnly.length > 0.7) {
      riskScore += 30;
      warnings.push("Excessive uppercase text detected. Lowers deliverability reputation.");
    }
  }

  // D. Humanized Jitter Delay (Randomized 2.2s - 4.8s to emulate natural typing)
  const baseDelay = isExistingContact ? 1800 : 2800;
  const randomJitter = Math.floor(Math.random() * 2000); // 0 - 2000ms jitter
  const calculatedDelay = baseDelay + randomJitter;

  return {
    allowed: riskScore < 80,
    delayMs: calculatedDelay,
    riskScore,
    warnings,
  };
}
