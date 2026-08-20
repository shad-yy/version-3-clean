import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import {
  EDITORIAL_CLAIMS,
  CORROBORATION_REQUIRED,
  getClaim,
  getClaims,
  sourcesFor,
  lastCheckedFor,
  underCorroborated,
} from "@/lib/data/editorial-claims"

/**
 * The corroboration rule, enforced.
 *
 * `/watch/world-cup-2026` carried a fabricated scoreline for roughly a month, in four
 * machine-readable places at once. The registry exists so that cannot recur; these tests
 * exist because a rule written only in a doc-block is a suggestion.
 *
 * The test that matters most is the last one. It reads the actual page sources and checks
 * every claim id they reference resolves — so a renamed or deleted claim fails the suite
 * rather than silently rendering a page with no provenance, which is the exact state the
 * World Cup page was in.
 */

const ROOT = process.cwd()

/** Every .tsx under app/ and components/, so page references can be checked for real. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) acc.push(full)
  }
  return acc
}

describe("editorial claims — shape", () => {
  it("ids are unique", () => {
    const ids = EDITORIAL_CLAIMS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every claim carries at least one source", () => {
    for (const claim of EDITORIAL_CLAIMS) {
      expect(claim.sources.length, `"${claim.id}" has no source`).toBeGreaterThan(0)
    }
  })

  it("every claim states something", () => {
    for (const claim of EDITORIAL_CLAIMS) {
      expect(claim.statement.trim().length).toBeGreaterThan(20)
    }
  })
})

describe("editorial claims — the corroboration rule", () => {
  it("results and records carry two sources", () => {
    for (const claim of EDITORIAL_CLAIMS) {
      if (!CORROBORATION_REQUIRED.has(claim.kind)) continue
      expect(
        claim.sources.length,
        `"${claim.id}" is a ${claim.kind} and needs two independent sources`,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it("those two sources are actually independent", () => {
    // Two links to the same publisher is one source cited twice, which is the failure
    // the rule exists to prevent rather than a way of satisfying it.
    for (const claim of EDITORIAL_CLAIMS) {
      if (!CORROBORATION_REQUIRED.has(claim.kind)) continue
      const publishers = new Set(claim.sources.map((s) => s.publisher.toLowerCase()))
      expect(publishers.size, `"${claim.id}" cites one publisher twice`).toBeGreaterThanOrEqual(2)
    }
  })

  it("underCorroborated() reports nothing", () => {
    expect(underCorroborated().map((c) => c.id)).toEqual([])
  })
})

describe("editorial claims — sources", () => {
  it("every source URL is absolute and secure", () => {
    for (const claim of EDITORIAL_CLAIMS) {
      for (const source of claim.sources) {
        expect(source.url, `"${claim.id}"`).toMatch(/^https:\/\//)
        expect(() => new URL(source.url)).not.toThrow()
      }
    }
  })

  it("nothing cites this site as its own source", () => {
    // Citing ourselves would make the registry circular: the claim would be sourced to
    // the page that makes it.
    for (const claim of EDITORIAL_CLAIMS) {
      for (const source of claim.sources) {
        const host = new URL(source.url).hostname
        expect(host, `"${claim.id}" cites itself`).not.toMatch(/sightline|localhost/i)
      }
    }
  })

  it("every source names the article that was read", () => {
    // A citation of "Wikipedia" is not a citation. It also collapses two distinct
    // articles from one publisher into one indistinguishable label on the page.
    for (const claim of EDITORIAL_CLAIMS) {
      for (const source of claim.sources) {
        expect(source.title.trim().length, `"${claim.id}"`).toBeGreaterThan(5)
        expect(source.title, `"${claim.id}"`).not.toBe(source.publisher)
      }
    }
  })

  it("every publisher is named for a reader, not as a domain", () => {
    for (const claim of EDITORIAL_CLAIMS) {
      for (const source of claim.sources) {
        expect(source.publisher.trim().length).toBeGreaterThan(0)
        expect(source.publisher, `"${claim.id}"`).not.toMatch(/^https?:|\.(com|org|net)$/i)
      }
    }
  })

  it("every checkedAt is a real date, and not in the future", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    for (const claim of EDITORIAL_CLAIMS) {
      for (const source of claim.sources) {
        expect(source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        const when = new Date(`${source.checkedAt}T00:00:00Z`)
        expect(Number.isNaN(when.getTime())).toBe(false)
        expect(when.getTime(), `"${claim.id}" checked in the future`).toBeLessThan(
          tomorrow.getTime(),
        )
      }
    }
  })
})

describe("editorial claims — queries", () => {
  it("getClaim returns null for an unknown id rather than throwing", () => {
    expect(getClaim("no-such-claim")).toBeNull()
  })

  it("getClaims skips ids it cannot resolve", () => {
    const found = getClaims(["wc-2026-final-result", "no-such-claim"])
    expect(found.map((c) => c.id)).toEqual(["wc-2026-final-result"])
  })

  it("sourcesFor de-duplicates a source shared by several claims", () => {
    const ids = ["wc-2026-final-result", "wc-2026-final-goalscorer"]
    const urls = sourcesFor(ids).map((s) => s.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it("lastCheckedFor reports the most recent consultation, or null", () => {
    expect(lastCheckedFor(["wc-2026-final-result"])).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(lastCheckedFor(["no-such-claim"])).toBeNull()
  })
})

describe("editorial claims — page references resolve", () => {
  it("every claim id referenced from a page exists in the registry", () => {
    const known = new Set(EDITORIAL_CLAIMS.map((c) => c.id))
    const files = [
      ...sourceFiles(join(ROOT, "app")),
      ...sourceFiles(join(ROOT, "components")),
    ]

    const referenced: { id: string; file: string }[] = []
    for (const file of files) {
      const text = readFileSync(file, "utf8")
      const block = text.match(/claimIds=\{\[([\s\S]*?)\]\}/g)
      if (!block) continue
      for (const b of block) {
        for (const m of b.matchAll(/['"]([a-z0-9-]+)['"]/g)) {
          referenced.push({ id: m[1], file: file.replace(ROOT, "") })
        }
      }
    }

    // The wiring itself must exist -- a passing test over zero references would mean the
    // mechanism had been quietly disconnected.
    expect(referenced.length).toBeGreaterThan(0)

    for (const ref of referenced) {
      expect(known, `${ref.file} references unknown claim "${ref.id}"`).toContain(ref.id)
    }
  })
})
