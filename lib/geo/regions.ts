/**
 * Country to continent grouping, for the availability page.
 *
 * The design groups every country into exactly four collapsible groups. That grouping is
 * a **presentation** decision from the handoff, not a geographic standard — "Asia-Pacific"
 * and "Middle East & Africa" are how the design chooses to break up 139 rows so they do
 * not read as one undifferentiated wall.
 *
 * Codes are ISO 3166-1 alpha-2. Anything not listed falls into `Other`, which renders as
 * a real group rather than being dropped — silently discarding a country would be the
 * worst possible failure on a page whose entire claim is per-country completeness.
 */

export const REGION_ORDER = [
  "Europe",
  "Americas",
  "Asia-Pacific",
  "Middle East & Africa",
  "Other",
] as const

export type RegionName = (typeof REGION_ORDER)[number]

const EUROPE = new Set([
  "AD", "AL", "AT", "AX", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE",
  "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT",
  "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT",
  "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA", "XK",
])

const AMERICAS = new Set([
  "AG", "AI", "AR", "AW", "BB", "BL", "BM", "BO", "BQ", "BR", "BS", "BZ", "CA", "CL",
  "CO", "CR", "CU", "CW", "DM", "DO", "EC", "FK", "GD", "GF", "GL", "GP", "GT", "GY",
  "HN", "HT", "JM", "KN", "KY", "LC", "MF", "MQ", "MS", "MX", "NI", "PA", "PE", "PM",
  "PR", "PY", "SR", "SV", "SX", "TC", "TT", "US", "UY", "VC", "VE", "VG", "VI",
])

const ASIA_PACIFIC = new Set([
  "AS", "AU", "BD", "BN", "BT", "CC", "CK", "CN", "CX", "FJ", "FM", "GU", "HK", "ID",
  "IN", "JP", "KH", "KI", "KP", "KR", "LA", "LK", "MH", "MM", "MN", "MO", "MP", "MV",
  "MY", "NC", "NF", "NP", "NR", "NU", "NZ", "PF", "PG", "PH", "PK", "PN", "PW", "SB",
  "SG", "TH", "TK", "TL", "TO", "TV", "TW", "VN", "VU", "WF", "WS",
  // Central Asia sits here rather than in Europe or MEA.
  "KG", "KZ", "TJ", "TM", "UZ", "AF",
])

const MIDDLE_EAST_AFRICA = new Set([
  "AE", "AM", "AO", "AZ", "BF", "BH", "BI", "BJ", "BW", "CD", "CF", "CG", "CI", "CM",
  "CV", "DJ", "DZ", "EG", "EH", "ER", "ET", "GA", "GE", "GH", "GM", "GN", "GQ", "GW",
  "IL", "IQ", "IR", "JO", "KE", "KM", "KW", "LB", "LR", "LS", "LY", "MA", "MG", "ML",
  "MR", "MU", "MW", "MZ", "NA", "NE", "NG", "OM", "PS", "QA", "RE", "RW", "SA", "SC",
  "SD", "SL", "SN", "SO", "SS", "ST", "SY", "SZ", "TD", "TG", "TN", "TR", "TZ", "UG",
  "YE", "YT", "ZA", "ZM", "ZW",
])

/** Which group a country belongs to. Never returns undefined. */
export function regionOf(code: string): RegionName {
  const c = code.toUpperCase()
  if (EUROPE.has(c)) return "Europe"
  if (AMERICAS.has(c)) return "Americas"
  if (ASIA_PACIFIC.has(c)) return "Asia-Pacific"
  if (MIDDLE_EAST_AFRICA.has(c)) return "Middle East & Africa"
  return "Other"
}

/**
 * Every ISO 3166-1 alpha-2 code this module knows about.
 *
 * Used to say honestly how many countries we have **not** checked: the ribbon's trailing
 * muted group is the difference between this and what the provider actually covers. That
 * number is derived, never hardcoded — the handoff's "56 NOT CHECKED" is copy from a
 * prototype, and the real figure moves whenever the provider adds a market.
 */
export const KNOWN_COUNTRY_CODES: string[] = [
  ...EUROPE, ...AMERICAS, ...ASIA_PACIFIC, ...MIDDLE_EAST_AFRICA,
].sort()

/** How many countries we hold no data for at all. */
export function notCheckedCount(coveredCodes: string[]): number {
  const covered = new Set(coveredCodes.map((c) => c.toUpperCase()))
  return KNOWN_COUNTRY_CODES.filter((c) => !covered.has(c)).length
}
