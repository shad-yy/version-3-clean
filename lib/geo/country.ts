import { cookies, headers } from "next/headers"

/**
 * Which country the viewer is in.
 *
 * Every Sightline screen answers "where can I watch this **in your country**", so this is
 * not a preference — it is the axis the whole product turns on.
 *
 * Resolution order:
 *
 *  1. An explicit choice the viewer made, stored in a cookie. A person who picks a
 *     country always outranks a guess about them.
 *  2. Vercel's `x-vercel-ip-country` edge header, present on every request in production
 *     at no cost. Absent locally, which is why 3 exists.
 *  3. A neutral fallback.
 *
 * The fallback is deliberately **not** a country. Defaulting to GB or US would silently
 * answer a global question with one market's answer, which is the exact defect this
 * rebuild exists to remove. `null` means "we do not know yet" and the UI says so.
 */

/** Cookie holding an explicit viewer choice. Readable server-side, so SSR stays correct. */
export const COUNTRY_COOKIE = "sl_country"

/** Vercel sets this on every edge request. Documented and free on all plans. */
const VERCEL_COUNTRY_HEADER = "x-vercel-ip-country"

/** ISO 3166-1 alpha-2, or null when genuinely unknown. */
export type CountryCode = string | null

function normalise(value: string | undefined | null): CountryCode {
  if (!value) return null
  const code = value.trim().toUpperCase()
  // Two ASCII letters. Vercel sends "XX" for unknown, which is not a country.
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

/**
 * The viewer's country for this request. Server components and route handlers only.
 *
 * Returns null rather than guessing. Callers must handle that — it is a real state,
 * common in local development and for viewers behind privacy relays.
 */
export function getViewerCountry(): CountryCode {
  const chosen = normalise(cookies().get(COUNTRY_COOKIE)?.value)
  if (chosen) return chosen

  return normalise(headers().get(VERCEL_COUNTRY_HEADER))
}

/**
 * English country name for a code, e.g. "GB" to "United Kingdom".
 *
 * Uses Intl rather than a hand-kept list: a hardcoded map would be one more place to
 * drift, and TMDB alone returns 139 codes. Falls back to the raw code, which is still
 * more useful than nothing.
 */
export function countryName(code: string, locale = "en"): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code
  } catch {
    return code
  }
}

/**
 * Country name for display where a null is possible.
 *
 * The design never renders an empty slot where a country belongs — the sentence has to
 * still read. "your country" keeps the copy grammatical while staying honest that we do
 * not know which one.
 */
export function countryLabel(code: CountryCode, locale = "en"): string {
  return code ? countryName(code, locale) : "your country"
}
