import { getAvailableRegions } from "@/lib/api/tmdb"
import { countryName } from "@/lib/geo/country"
import type { CountryOption } from "@/components/sightline/country-select"

/**
 * Every country the site can actually answer for.
 *
 * Deliberately derived from TMDB's regions endpoint rather than a hand-kept list. The
 * owner's instruction is that coverage is "as global as possible" and driven by what the
 * APIs genuinely return — so the list is whatever the provider supports today (139 at the
 * time of writing) and grows on its own when they add a market.
 *
 * A hardcoded list would be a second source of truth that silently drifts from the data,
 * and would let the country selector offer a country we cannot answer for.
 *
 * Names come from `Intl.DisplayNames` rather than the provider's `english_name`, so every
 * country name on the site is rendered by one mechanism and can be localised later
 * without touching this file.
 *
 * Note this is the **film and television** footprint. Hand-verified sports broadcast
 * rights are a much smaller, separate set in `lib/data/broadcast-rights.ts`, and no API
 * supplies them — TheSportsDB's TV endpoint returns a single row for country
 * "International". Never conflate the two counts.
 */
export async function getSelectableCountries(): Promise<CountryOption[]> {
  const codes = await getAvailableRegions()

  return codes
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
