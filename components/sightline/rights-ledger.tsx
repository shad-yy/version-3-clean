import Link from "next/link"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { KNOWN_COUNTRY_CODES } from "@/lib/geo/regions"
import { formatLongDate } from "@/lib/utils/datetime"

/**
 * "14 AUG 2026" — the mono date form the reference uses throughout.
 *
 * Built from Intl rather than a month lookup table so it stays correct if the site is
 * ever localised, and uppercased to match the mono treatment.
 */
function verifiedDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (isNaN(d.getTime())) return iso
  // Assembled from parts rather than formatted as a whole string, because the reference
  // is day-first ("14 AUG 2026") and Intl's "en" locale orders it month-first. Reading
  // the parts gives the designed order without pinning a regional locale.
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return `${get("day")} ${get("month")} ${get("year")}`.toUpperCase()
}

/**
 * Verified-rights ledger — design/sightline/HANDOFF.md §1.3.
 *
 * The panel that states our coverage and, more importantly, its limits. This is the
 * clearest expression of the product's position: we hold a small amount of hand-checked
 * data and say so, rather than implying breadth we do not have.
 *
 * **Every number here is derived from the data.** The handoff's
 * "2 competitions · 4 countries · last checked 14 AUG 2026" is prototype copy; the real
 * date is whatever a human last recorded. Hardcoding it would be a fabricated
 * verification claim, which rule 1 forbids outright — and on this panel of all panels,
 * a wrong date would undermine the exact thing it exists to establish.
 */
export function RightsLedger() {
  // Group every verified listing by country.
  const byCountry = new Map<
    string,
    { name: string; entries: { competition: string; broadcaster: string }[] }
  >()

  for (const competition of COMPETITION_RIGHTS) {
    for (const listing of competition.listings) {
      const existing = byCountry.get(listing.country)
      const entry = { competition: competition.name, broadcaster: listing.broadcaster }
      if (existing) existing.entries.push(entry)
      else byCountry.set(listing.country, { name: listing.countryName, entries: [entry] })
    }
  }

  const countries = [...byCountry.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name))

  // The most recent hand-verification across the set. Never invented.
  const lastChecked = COMPETITION_RIGHTS.map((c) => c.verified)
    .filter(Boolean)
    .sort()
    .pop()

  const unverifiedCount = Math.max(0, KNOWN_COUNTRY_CODES.length - countries.length)

  if (countries.length === 0) return null

  return (
    <section className="border-t border-sl-line bg-sl-ground px-[18px] py-10 lg:px-20 lg:py-[46px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="overflow-hidden rounded-[8px] border border-sl-line bg-sl-panel">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sl-hair px-5 py-4">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
              Hand-verified broadcast rights
            </h2>
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
              {COMPETITION_RIGHTS.length}{" "}
              {COMPETITION_RIGHTS.length === 1 ? "competition" : "competitions"} ·{" "}
              {countries.length} {countries.length === 1 ? "country" : "countries"}
              {lastChecked ? ` · last checked ${verifiedDate(lastChecked)}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-sl-hair sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {countries.map(([code, country]) => (
              <div
                key={code}
                className="px-5 py-4 transition-colors duration-[.16s] hover:bg-sl-surface sm:border-r sm:border-sl-hair sm:last:border-r-0"
              >
                <h3 className="mb-2.5 text-[15px] font-medium text-sl-text">
                  {country.name}
                </h3>
                <p className="mb-3 text-[13px] leading-[1.5] text-sl-mid">
                  {country.entries
                    .map((e) => e.broadcaster)
                    .filter((b, i, arr) => arr.indexOf(b) === i)
                    .join(" · ")}
                </p>
                {lastChecked && (
                  // A mono date. No tick, no colour -- design opinion 3.
                  <p className="font-mono text-[10px] uppercase tracking-[.12em] text-sl-mute">
                    Verified {verifiedDate(lastChecked)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-sl-hair bg-sl-ground px-5 py-4">
            <p className="max-w-[720px] text-[13px] leading-[1.55] text-sl-mid">
              Everywhere else — Germany, Spain, Japan and {unverifiedCount} more — is not
              verified. We show nothing rather than guess.
            </p>
            <Link
              href="/faq"
              className="shrink-0 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
            >
              How verification works
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
