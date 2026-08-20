/**
 * Append-only record of every time a human confirmed a broadcast listing.
 *
 * This is the spine of the product's central claim. `broadcast-rights.ts` says *what* we
 * believe; this says *when a person last checked it, and against what source*. Without
 * it, "verified" is an adjective. With it, it is a record.
 *
 * It unblocks three things that were otherwise impossible:
 *
 *  1. **Per-country dates.** The design shows a different date per country. The rights
 *     file carries one date per competition, so the finer answer has to live here.
 *  2. **A real changelog.** "What we changed this week" reads from actual entries rather
 *     than being written by hand and going stale.
 *  3. **The discovery dock**, which requires things re-verified in the last 24 hours —
 *     a query only this file can answer.
 *
 * ## Rules
 *
 * - **Append only.** Never edit or delete an entry. A wrong entry is corrected by adding
 *   a new one; the history is the point, and rewriting it destroys the audit trail that
 *   makes the claim credible.
 * - **One entry per country per check**, not one per competition. Checking the Premier
 *   League in four countries is four entries, because that is four separate acts.
 * - **`source` should be the rights holder's own listing** wherever possible. A press
 *   article is weaker evidence than the broadcaster's schedule.
 * - **Never generate entries automatically.** The whole value is that a person looked.
 *   An entry written by a script is a lie about what happened.
 */

export type VerificationAction =
  /** Checked an existing listing and it is still correct. */
  | "confirmed"
  /** A listing we did not previously hold. */
  | "added"
  /** Withdrawn because it could no longer be confirmed. */
  | "removed"
  /** The rights holder changed. */
  | "changed"

export interface VerificationEntry {
  /** ISO 8601 date, or date-time, of when the person checked. */
  at: string
  /** Matches an `id` in COMPETITION_RIGHTS. */
  competition: string
  /** ISO 3166-1 alpha-2. */
  country: string
  /** The broadcaster as the viewer would recognise it. */
  broadcaster: string
  action: VerificationAction
  /** Where it was checked. The rights holder's own listing is the strongest source. */
  source?: string
  /** Anything a future reader needs to understand the entry. */
  note?: string
}

/**
 * The log.
 *
 * Seeded from the only verification this project has actually recorded: both
 * competitions carry `verified: "2026-07-31"` in `broadcast-rights.ts`. Those entries are
 * transcribed here rather than invented, and they deliberately carry no `source`, because
 * none was recorded at the time — an empty source is honest, a fabricated one is not.
 *
 * Newest first is *not* enforced; helpers sort. Add new entries at the top for
 * readability.
 */
export const VERIFICATION_LOG: VerificationEntry[] = [
  {
    at: "2026-07-31",
    competition: "premier-league",
    country: "GB",
    broadcaster: "Sky Sports",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date. No source was recorded at the time.",
  },
  {
    at: "2026-07-31",
    competition: "premier-league",
    country: "US",
    broadcaster: "NBC Sports",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date.",
  },
  {
    at: "2026-07-31",
    competition: "premier-league",
    country: "AU",
    broadcaster: "Optus Sport",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date.",
  },
  {
    at: "2026-07-31",
    competition: "champions-league",
    country: "GB",
    broadcaster: "TNT Sports",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date.",
  },
  {
    at: "2026-07-31",
    competition: "champions-league",
    country: "US",
    broadcaster: "CBS Sports",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date.",
  },
  {
    at: "2026-07-31",
    competition: "champions-league",
    country: "FR",
    broadcaster: "Canal+",
    action: "confirmed",
    note: "Transcribed from the competition-level verified date.",
  },
]

/* ------------------------------------------------------------------ queries */

function toTime(iso: string): number {
  const t = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).getTime()
  return isNaN(t) ? 0 : t
}

/** Most recent entry for one competition in one country, or null. */
export function latestFor(competition: string, country: string): VerificationEntry | null {
  const matches = VERIFICATION_LOG.filter(
    (e) => e.competition === competition && e.country === country.toUpperCase(),
  )
  if (matches.length === 0) return null
  return matches.reduce((a, b) => (toTime(b.at) > toTime(a.at) ? b : a))
}

/**
 * When a country was last checked, across every competition.
 *
 * This is what the ledger renders per cell — a country's date is the most recent time
 * anyone looked at anything in it.
 */
export function lastCheckedForCountry(country: string): string | null {
  const matches = VERIFICATION_LOG.filter((e) => e.country === country.toUpperCase())
  if (matches.length === 0) return null
  return matches.reduce((a, b) => (toTime(b.at) > toTime(a.at) ? b : a)).at
}

/** The most recent check anywhere. Drives the ledger header. */
export function lastCheckedOverall(): string | null {
  if (VERIFICATION_LOG.length === 0) return null
  return VERIFICATION_LOG.reduce((a, b) => (toTime(b.at) > toTime(a.at) ? b : a)).at
}

/**
 * Entries within the last `days`, newest first.
 *
 * The discovery dock asks for 24 hours; the homepage changelog asks for a week. Returns
 * an empty array when nothing has happened, which callers must render as "nothing
 * changed" rather than padding with older entries.
 */
export function recentEntries(days: number): VerificationEntry[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return VERIFICATION_LOG.filter((e) => toTime(e.at) >= cutoff).sort(
    (a, b) => toTime(b.at) - toTime(a.at),
  )
}

/** Every country that has ever been checked. */
export function checkedCountries(): string[] {
  return [...new Set(VERIFICATION_LOG.map((e) => e.country))].sort()
}

/* --------------------------------------------------------- discovery dock feed */

/**
 * What the "just checked" dock shows.
 *
 * Two filters, both from the design and both load-bearing (design opinion 6):
 *
 *  1. **Re-verified within the window** — freshness of verification, never popularity
 *     and never payment. This is the only ordering the dock is allowed to use.
 *  2. **Only where we hold an offer in the viewer's country** — telling someone we
 *     re-checked Australia is not useful to a reader in France.
 *
 * Returns an empty array when nothing qualifies, which is the common case at a low
 * verification cadence. The dock must render nothing at all in that case rather than
 * announce "0 things verified", which would be worse than absent.
 */
export interface DockItem {
  /** Stable key. */
  id: string
  /** Competition or title name. */
  title: string
  /** Mono lead — a kick-off time or a year. */
  lead: string
  /** Uppercase mono sub-label. */
  sub: string
  /** Where it is shown. */
  where: string
  /** ISO date-time of the check. */
  checkedAt: string
  kind: "sport" | "film-tv"
  /** Where a click goes. */
  href: string
}

export function dockItemsFor(
  country: string | null,
  competitions: { id: string; name: string; href: string }[],
  withinDays = 1,
): DockItem[] {
  if (!country) return []

  return recentEntries(withinDays)
    .filter((e) => e.country === country.toUpperCase())
    // A withdrawal is a real event but not something to promote as "just checked" —
    // the dock exists to surface things a reader can now go and watch.
    .filter((e) => e.action !== "removed")
    .map((e) => {
      const competition = competitions.find((c) => c.id === e.competition)
      return {
        id: `${e.competition}-${e.country}-${e.at}`,
        title: competition?.name ?? e.competition,
        // The footer already carries the date. Repeating it as the lead put the same
        // string on the card twice, so the lead states what happened instead -- which is
        // the more useful half of the entry and is still nothing but recorded fact.
        lead: e.action === "added" ? "Newly added" : "Re-checked",
        sub: "Sport",
        where: e.broadcaster,
        checkedAt: e.at,
        kind: "sport" as const,
        href: competition?.href ?? "/watch",
      }
    })
}
