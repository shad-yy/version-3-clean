import Link from "next/link"
import { ENV } from "@/lib/config/env"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { resolveRights } from "@/lib/data/resolve-rights"
import { LocalTime } from "@/components/ui/local-time"

/**
 * "Live now" block — design/sightline/HANDOFF.md §1.4.
 *
 * Three fixture rows with the broadcaster for the viewer's country on the right.
 *
 * The handoff pins one row to "Not verified in United Kingdom" and says to keep it. That
 * row is not decoration — it is the design demonstrating, above the fold, that we say so
 * when we do not know. Here it is not pinned to a specific row, because whether we hold a
 * listing depends on the competition and the reader's country; it appears wherever it is
 * genuinely true, which is more honest than staging it.
 */

interface Fixture {
  idEvent: string
  strHomeTeam: string
  strAwayTeam: string
  strLeague: string
  strDate: string
  strTime: string
  strStatus?: string
  intHomeScore?: string | null
  intAwayScore?: string | null
}

async function getFixtures(): Promise<Fixture[]> {
  try {
    const res = await fetch(`${ENV.BASE_URL}/api/fixtures/today`, {
      // The route behind this is itself cached via swrGet, so this request is cheap and
      // must not add a second, longer-lived cache layer that could serve staler data
      // than the source of truth.
      next: { revalidate: 90 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.upcoming ?? data.events ?? []).slice(0, 3)
  } catch {
    return []
  }
}

export async function LiveNow() {
  const fixtures = await getFixtures()
  if (fixtures.length === 0) return null

  const viewerCountry = getViewerCountry()
  const countryText = countryLabel(viewerCountry)

  return (
    <section className="border-t border-sl-line bg-sl-ground px-[18px] py-10 lg:px-20 lg:py-[46px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-2 animate-pulse rounded-full bg-sl-amber"
          />
          <h2 className="font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
            Live now
          </h2>
          <Link
            href="/scores"
            className="ml-auto font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
          >
            All live scores
          </Link>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-sl-line">
          {fixtures.map((f) => {
            const rights = resolveRights(f.strLeague, viewerCountry)
            const forViewer = rights.countries.find((c) => c.code === viewerCountry)
            const broadcaster = forViewer?.listings?.[0]?.broadcaster ?? null
            const hasScore =
              f.intHomeScore !== null && f.intHomeScore !== undefined && f.intHomeScore !== ""

            return (
              <Link
                key={f.idEvent}
                href={`/match/${f.idEvent}`}
                className="flex items-center gap-4 border-b border-sl-hair px-4 py-3.5 transition-colors duration-[.16s] last:border-b-0 hover:bg-sl-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
              >
                <span className="w-[54px] shrink-0 font-mono text-[11px] tracking-[.06em] text-sl-amber">
                  {f.strTime ? (
                    <LocalTime value={`${f.strDate}T${f.strTime.split("+")[0]}Z`} />
                  ) : (
                    "TBA"
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-sl-text">
                    {f.strHomeTeam} v {f.strAwayTeam}
                  </span>
                  <span className="block truncate text-[12px] text-sl-mute">
                    {f.strLeague}
                  </span>
                </span>

                {hasScore && (
                  <span className="shrink-0 font-mono text-[13px] text-sl-text">
                    {f.intHomeScore}–{f.intAwayScore}
                  </span>
                )}

                <span className="hidden w-[210px] shrink-0 text-right text-[13px] sm:block">
                  {broadcaster ? (
                    <span className="text-sl-mid">{broadcaster}</span>
                  ) : (
                    // The honest gap, stated inline rather than left blank.
                    <span className="text-sl-mute">Not verified in {countryText}</span>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
