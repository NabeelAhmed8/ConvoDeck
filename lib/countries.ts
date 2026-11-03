export interface Country {
  code: string;      // ISO 2-letter code e.g. "PK"
  name: string;      // Country name e.g. "Pakistan"
  dialCode: string;  // International dialing prefix e.g. "+92"
  flag: string;      // Unicode emoji flag e.g. "🇵🇰"
}

export const COUNTRIES: Country[] = [
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Pakistan (+92)

/**
 * Find country by dial code or iso code
 */
export function findCountry(identifier: string): Country | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  return COUNTRIES.find(
    (c) =>
      c.dialCode.toLowerCase() === clean ||
      c.code.toLowerCase() === clean ||
      c.dialCode.replace("+", "") === clean.replace("+", "")
  );
}

/**
 * Parses a full phone number string into dial code and national digits
 */
export function parsePhoneNumber(rawPhone?: string): {
  dialCode: string;
  nationalNumber: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return { dialCode: DEFAULT_COUNTRY.dialCode, nationalNumber: "" };
  }
  const clean = rawPhone.trim();
  // Sort longest dial codes first to prevent ambiguity
  const sorted = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );
  const matched = sorted.find((c) => clean.startsWith(c.dialCode));
  if (matched) {
    return {
      dialCode: matched.dialCode,
      nationalNumber: clean.slice(matched.dialCode.length).trim(),
    };
  }
  return {
    dialCode: DEFAULT_COUNTRY.dialCode,
    nationalNumber: clean.replace(/^\+/, ""),
  };
}
