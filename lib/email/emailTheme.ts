/**
 * Centralized Neumorphic styling tokens for transactional HTML emails.
 * Matches ConvoDeck's soft-grey clay surfaces (#ebf0f7, #edf1f7) and orange (#ff6422) accents.
 */
export const EMAIL_THEME = {
  // Surfaces
  bodyBg: "#ebf0f7",
  cardBg: "#edf1f7",
  insetBg: "#e9eff6",
  white: "#ffffff",

  // Text Colors
  textHeading: "#0f172a",
  textBody: "#334155",
  textMuted: "#64748b",
  textSubtle: "#94a3b8",

  // Brand Accents
  accentOrange: "#ff6422",
  accentOrangeDark: "#ea5414",
  accentOrangeLight: "rgba(255, 100, 34, 0.08)",
  whatsappGreen: "#25D366",

  // Borders
  borderLight: "#e2e8f0",
  borderCard: "rgba(255, 255, 255, 0.8)",

  // Neumorphic Shadows (Inline for modern email clients)
  cardShadow: "box-shadow: 12px 12px 28px rgba(166, 178, 196, 0.45), -10px -10px 24px #ffffff;",
  insetShadow: "box-shadow: inset 3px 3px 6px rgba(166, 178, 196, 0.45), inset -3px -3px 6px #ffffff;",
  buttonShadow: "box-shadow: 0 6px 14px rgba(255, 100, 34, 0.35);",
  iconShadow: "box-shadow: 4px 4px 8px rgba(166, 178, 196, 0.35), -4px -4px 8px #ffffff;",
};

