// Single source for Arvo's Restricted Jurisdictions (legal page, app notice and
// optional location blocking). Edit here only; ISO 3166-1 alpha-2 codes.
export const RESTRICTED_JURISDICTIONS: readonly { code: string; name: string }[] = [
  { code: "KP", name: "North Korea" }, { code: "IR", name: "Iran" }, { code: "MM", name: "Myanmar" },
  { code: "AO", name: "Angola" }, { code: "BO", name: "Bolivia" }, { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BG", name: "Bulgaria" }, { code: "CM", name: "Cameroon" }, { code: "CI", name: "Côte d’Ivoire" },
  { code: "CD", name: "Democratic Republic of the Congo" }, { code: "HT", name: "Haiti" }, { code: "IQ", name: "Iraq" },
  { code: "KE", name: "Kenya" }, { code: "KW", name: "Kuwait" }, { code: "LA", name: "Laos" },
  { code: "LB", name: "Lebanon" }, { code: "MC", name: "Monaco" }, { code: "NP", name: "Nepal" },
  { code: "PG", name: "Papua New Guinea" }, { code: "SS", name: "South Sudan" }, { code: "SY", name: "Syria" },
  { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" }, { code: "VG", name: "British Virgin Islands" },
  { code: "YE", name: "Yemen" }, { code: "US", name: "United States of America" }, { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" }, { code: "AU", name: "Australia" }, { code: "CN", name: "China" },
  { code: "RU", name: "Russia" },
];

export const RESTRICTED_JURISDICTION_NAMES = RESTRICTED_JURISDICTIONS.map(j => j.name);

/** Human list, e.g. "North Korea, Iran, … and Russia". */
export function restrictedJurisdictionList() {
  const names = RESTRICTED_JURISDICTION_NAMES;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function isRestrictedCountry(code: string | null | undefined) {
  const value = (code || "").trim().toUpperCase();
  return value.length === 2 && RESTRICTED_JURISDICTIONS.some(j => j.code === value);
}

/** Version of the notice; bump to ask everyone to confirm again after a change. */
export const JURISDICTION_NOTICE_VERSION = "2026-11-18";
