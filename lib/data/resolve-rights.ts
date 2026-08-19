import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { countryName } from "@/lib/geo/country"
import type { RightsCountry } from "@/components/sightline/rights-panel"

/**
 * Resolves the broadcast rights panel for a fixture.
 *
 * Rights in this project are **competition-level, never fixture-level** — competition
 * rights are stable across a rights cycle while fixture-to-channel mappings change
 * weekly, and a wrong channel is worse than no channel on a site whose whole claim is
 * accuracy.
 *
 * The country list deliberately includes markets we have **not** verified. Showing only
 * the four we have checked would imply those are the only four that exist, and would hide
 * the gap the product is honest about. A reader in Germany should be able to select
 * Germany and be told plainly that we have not checked it.
 */

/**
 * Major markets shown alongside the verified ones so the gap is visible rather than
 * implied. Not a coverage claim — quite the opposite.
 */
const UNVERIFIED_EXAMPLES = ["DE", "ES"]

function matchCompetition(leagueName: string | null | undefined) {
  if (!leagueName) return null
  const needle = leagueName.toLowerCase()
  return (
    COMPETITION_RIGHTS.find((c) => needle.includes(c.name.toLowerCase())) ??
    COMPETITION_RIGHTS.find((c) => c.name.toLowerCase().includes(needle)) ??
    null
  )
}

export interface ResolvedRights {
  countries: RightsCountry[]
  /** YYYY-MM-DD from the data, or null when this competition is not covered at all. */
  verifiedDate: string | null
  competitionName: string
  /** Which country the panel should open on. */
  initialCountry: string
  /** e.g. "2 competitions across 4 countries". Derived, so it cannot drift. */
  verifiedSummary: string
}

export function resolveRights(
  leagueName: string | null | undefined,
  viewerCountry: string | null,
): ResolvedRights {
  const competition = matchCompetition(leagueName)
  const competitionName = competition?.name ?? leagueName ?? "This competition"

  const verified: RightsCountry[] = (competition?.listings ?? []).reduce<RightsCountry[]>(
    (acc, listing) => {
      const existing = acc.find((c) => c.code === listing.country)
      const entry = { broadcaster: listing.broadcaster, streamingOn: listing.streamingOn }
      if (existing) {
        existing.listings!.push(entry)
      } else {
        acc.push({
          code: listing.country,
          name: listing.countryName,
          listings: [entry],
        })
      }
      return acc
    },
    [],
  )

  const codes = new Set(verified.map((c) => c.code))

  // Unverified markets, plus the viewer's own country when we have nothing for it —
  // the most important "we have not checked" a given reader can be shown.
  const unverifiedCodes = [
    ...UNVERIFIED_EXAMPLES,
    ...(viewerCountry && !codes.has(viewerCountry) ? [viewerCountry] : []),
  ].filter((code, i, arr) => !codes.has(code) && arr.indexOf(code) === i)

  const unverified: RightsCountry[] = unverifiedCodes.map((code) => ({
    code,
    name: countryName(code),
    listings: null,
  }))

  const countries = [...verified, ...unverified]

  // Open on the viewer's country when it is in the list, so the first thing they see is
  // their own answer -- verified or not.
  const initialCountry =
    viewerCountry && countries.some((c) => c.code === viewerCountry)
      ? viewerCountry
      : countries[0]?.code ?? ""

  const allCountries = new Set(
    COMPETITION_RIGHTS.flatMap((c) => c.listings.map((l) => l.country)),
  )
  const comps = COMPETITION_RIGHTS.length
  const verifiedSummary =
    `${comps} ${comps === 1 ? "competition" : "competitions"} across ` +
    `${allCountries.size} ${allCountries.size === 1 ? "country" : "countries"}`

  return {
    countries,
    verifiedDate: competition?.verified ?? null,
    competitionName,
    initialCountry,
    verifiedSummary,
  }
}
