import { describe, it, expect, vi, afterEach } from "vitest"
import {
  VERIFICATION_LOG,
  dockItemsFor,
  recentEntries,
  latestFor,
  lastCheckedForCountry,
  checkedCountries,
  type VerificationEntry,
} from "@/lib/data/verification-log"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"

/**
 * The verification log is the spine of the site's central claim: that a person checked a
 * listing on a stated date. These tests guard the two things that make the claim true.
 *
 * 1. **The log's own integrity.** An entry pointing at a competition that no longer
 *    exists, or carrying a malformed country code, silently degrades into a date shown
 *    next to nothing.
 * 2. **The dock's content rules.** Freshness window and country scoping are not cosmetic
 *    filters — they are the difference between "we re-checked this for you yesterday" and
 *    a trending strip. A regression that widened the window or dropped the country filter
 *    would leave the dock making a claim the data does not support.
 *
 * The clock is pinned wherever a window is under test, because the seeded entries age and
 * an unpinned test would quietly stop exercising the branch it was written for.
 */

const COMPETITIONS = COMPETITION_RIGHTS.map((c) => ({
  id: c.id,
  name: c.name,
  href: c.href,
}))

/** A moment twelve hours after the seeded entries, so they sit inside a one-day window. */
const JUST_AFTER_SEED = new Date("2026-07-31T12:00:00Z")

afterEach(() => {
  vi.useRealTimers()
})

describe("verification log integrity", () => {
  it("every entry names a competition that still exists", () => {
    const known = new Set(COMPETITION_RIGHTS.map((c) => c.id))
    for (const entry of VERIFICATION_LOG) {
      expect(known, `unknown competition "${entry.competition}"`).toContain(entry.competition)
    }
  })

  it("every country is an uppercase ISO 3166-1 alpha-2 code", () => {
    for (const entry of VERIFICATION_LOG) {
      expect(entry.country).toMatch(/^[A-Z]{2}$/)
    }
  })

  it("every date parses", () => {
    for (const entry of VERIFICATION_LOG) {
      expect(Number.isNaN(new Date(entry.at).getTime())).toBe(false)
    }
  })

  it("reports the countries it has actually checked", () => {
    expect(checkedCountries()).toEqual([...checkedCountries()].sort())
    expect(checkedCountries().length).toBeGreaterThan(0)
  })
})

describe("queries", () => {
  it("latestFor is scoped to one competition in one country", () => {
    const gb = latestFor("premier-league", "GB")
    expect(gb?.country).toBe("GB")
    expect(gb?.competition).toBe("premier-league")
  })

  it("latestFor accepts a lowercase country code", () => {
    expect(latestFor("premier-league", "gb")).toEqual(latestFor("premier-league", "GB"))
  })

  it("returns null rather than guessing for a country never checked", () => {
    expect(latestFor("premier-league", "JP")).toBeNull()
    expect(lastCheckedForCountry("JP")).toBeNull()
  })
})

describe("dock content rules", () => {
  it("says nothing when the viewer's country is unknown", () => {
    // The geo helper returns null rather than defaulting to a country, so the dock must
    // treat "we don't know where you are" as "we have nothing to tell you".
    expect(dockItemsFor(null, COMPETITIONS)).toEqual([])
  })

  it("shows only entries from the viewer's own country", () => {
    vi.useFakeTimers()
    vi.setSystemTime(JUST_AFTER_SEED)

    const fr = dockItemsFor("FR", COMPETITIONS)
    expect(fr.length).toBeGreaterThan(0)
    expect(fr.every((i) => i.title === "Champions League")).toBe(true)

    const gb = dockItemsFor("GB", COMPETITIONS)
    expect(gb.map((i) => i.title).sort()).toEqual(["Champions League", "Premier League"])
  })

  it("defaults to a one-day window and falls silent outside it", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-01T00:00:00Z")) // a month past the seeded entries
    expect(dockItemsFor("GB", COMPETITIONS)).toEqual([])
    expect(recentEntries(1)).toEqual([])
  })

  it("does not promote a withdrawn listing as something to go and watch", () => {
    vi.useFakeTimers()
    vi.setSystemTime(JUST_AFTER_SEED)

    const withdrawn: VerificationEntry = {
      at: "2026-07-31",
      competition: "premier-league",
      country: "IE",
      broadcaster: "Some Broadcaster",
      action: "removed",
    }
    VERIFICATION_LOG.push(withdrawn)
    try {
      expect(dockItemsFor("IE", COMPETITIONS)).toEqual([])
    } finally {
      VERIFICATION_LOG.splice(VERIFICATION_LOG.indexOf(withdrawn), 1)
    }
  })

  it("does not print the same date twice on one card", () => {
    vi.useFakeTimers()
    vi.setSystemTime(JUST_AFTER_SEED)

    for (const item of dockItemsFor("GB", COMPETITIONS)) {
      // The card footer renders checkedAt. The lead must carry something else or the
      // card shows one string in two places.
      expect(item.lead).not.toBe(item.checkedAt.slice(0, 10))
      expect(item.lead).toMatch(/Re-checked|Newly added/)
    }
  })

  it("links every item to a real competition page", () => {
    vi.useFakeTimers()
    vi.setSystemTime(JUST_AFTER_SEED)

    const hrefs = new Set(COMPETITION_RIGHTS.map((c) => c.href))
    for (const item of dockItemsFor("GB", COMPETITIONS)) {
      expect(hrefs).toContain(item.href)
    }
  })
})
