/**
 * Competition-level broadcast rights, used by the homepage broadcast resolver demo.
 *
 * VERIFY BEFORE PUBLISHING, AND RE-VERIFY EACH SEASON.
 *
 * These are deliberately COMPETITION-level, not fixture-level, because
 * competition rights are stable across a rights cycle while fixture-to-channel
 * mappings change weekly. Do not add fixture-level claims here.
 *
 * Every entry must be checked against the rights holder's own listings before it
 * goes live. Publishing a broadcaster the user cannot actually watch on is worse
 * than publishing nothing — it is the one claim this whole site is built on.
 *
 * `verified` records when a human last confirmed the row. Anything stale should
 * be re-checked or removed rather than shipped on trust.
 */

export interface BroadcastListing {
  /** ISO 3166-1 alpha-2 country code. */
  country: string
  /** Display name of the country. */
  countryName: string
  /** Flag emoji for compact display. */
  /** Rights-holding broadcaster as the viewer would recognise it. */
  broadcaster: string
  /** Where the viewer actually streams it, if different from the broadcaster. */
  streamingOn?: string
  /** IANA timezone used to render a local kick-off time. */
  timeZone: string
}

export interface CompetitionRights {
  id: string
  /** Competition name as viewers know it. */
  name: string
  /** Internal route to the full broadcast guide. */
  href: string
  /** ISO 8601 date-time of a representative kick-off, used for local-time display. */
  sampleKickoff: string
  /** Human-readable label for the sample fixture. Illustrative, not a real listing. */
  sampleFixture: string
  listings: BroadcastListing[]
  /** YYYY-MM-DD — when a human last verified these listings. */
  verified: string
}

export const COMPETITION_RIGHTS: CompetitionRights[] = [
  {
    id: "premier-league",
    name: "Premier League",
    href: "/watch/premier-league",
    sampleKickoff: "2026-08-22T17:30:00+01:00",
    sampleFixture: "Saturday evening fixture",
    verified: "2026-07-31",
    listings: [
      {
        country: "GB",
        countryName: "United Kingdom",
        broadcaster: "Sky Sports",
        streamingOn: "Sky Go / NOW",
        timeZone: "Europe/London",
      },
      {
        country: "US",
        countryName: "United States",
        broadcaster: "NBC Sports",
        streamingOn: "Peacock",
        timeZone: "America/New_York",
      },
      {
        country: "AU",
        countryName: "Australia",
        broadcaster: "Optus Sport",
        timeZone: "Australia/Sydney",
      },
    ],
  },
  {
    id: "champions-league",
    name: "Champions League",
    href: "/watch/champions-league",
    sampleKickoff: "2026-09-16T20:00:00+01:00",
    sampleFixture: "League phase matchday",
    verified: "2026-07-31",
    listings: [
      {
        country: "GB",
        countryName: "United Kingdom",
        broadcaster: "TNT Sports",
        streamingOn: "discovery+",
        timeZone: "Europe/London",
      },
      {
        country: "US",
        countryName: "United States",
        broadcaster: "CBS Sports",
        streamingOn: "Paramount+",
        timeZone: "America/New_York",
      },
      {
        country: "FR",
        countryName: "France",
        broadcaster: "Canal+",
        timeZone: "Europe/Paris",
      },
    ],
  },
]
