import Link from "next/link"
import Image from "next/image"
import { ENV } from "@/lib/config/env"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { countryName } from "@/lib/geo/country"
import { BROADCAST_PROVENANCE_SHORT } from "@/lib/data/provenance"
import { getTrendingTitles, isTmdbConfigured, tmdbImage } from "@/lib/api/tmdb"
import { TeamBadge } from "@/components/sightline/team-badge"
import { LocalTime } from "@/components/ui/local-time"

/**
 * The homepage two-column band — design_handoff_sightline_ui/README.md §3a.4.
 *
 * Left (`flex: 1.35`) is the live feed inside a card with a rotating border beam. Right
 * (`flex: 1`) stacks the broadcast listings panel over an editorial promo card.
 *
 * ## The beam appears exactly once
 *
 * Per the handoff: *"The border beam is used exactly once, on the one card whose data is
 * actually changing. Used twice it means nothing."* It marks the live feed and nothing
 * else on the site. If a second one is ever added, both should be removed.
 *
 * ## The live card has to work empty
 *
 * There are no fixtures on most days. The design shows four rows; wired honestly this is
 * frequently zero, and a card that only looks right on a Saturday is the wrong card. The
 * empty body keeps the same geometry and states what is true — design opinion 2, empty
 * states are answers rather than errors — and the beam keeps turning, because the feed is
 * still the one thing on the page that changes on its own.
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
  strHomeTeamBadge?: string | null
  strAwayTeamBadge?: string | null
  artwork?: string | null
}

async function getFixtures(): Promise<Fixture[]> {
  try {
    const res = await fetch(`${ENV.BASE_URL}/api/fixtures/today`, {
      // The route behind this is itself cached, so this must not add a second, longer
      // layer that could serve staler data than the source of truth.
      next: { revalidate: 90 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const rows = Array.isArray(data) ? data : (data.data ?? data.fixtures ?? [])
    return Array.isArray(rows) ? rows.slice(0, 4) : []
  } catch {
    return []
  }
}

export async function HomeBand() {
  const [fixtures, trending] = await Promise.all([
    getFixtures(),
    isTmdbConfigured() ? getTrendingTitles(6) : Promise.resolve([]),
  ])

  const countries = [
    ...new Set(COMPETITION_RIGHTS.flatMap((c) => c.listings.map((l) => l.country))),
  ].slice(0, 4)

  const promo = trending.find((t) => t.backdropPath) ?? trending[0] ?? null
  const promoArt = promo ? tmdbImage(promo.backdropPath ?? promo.posterPath, "w780") : null

  return (
    <section className="px-[18px] pb-10 pt-[34px] lg:px-[60px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5 lg:flex-row">
        {/* ---------------------------------------------------- live card */}
        <div className="relative overflow-hidden rounded-[9px] bg-sl-line p-px lg:flex-[1.35]">
          {/*
            The beam. A conic gradient rotating behind the card, revealed only at the 1px
            padding edge. `inset:-70%` keeps the gradient's centre off-card so the swept
            arc reads as travelling along the border rather than spinning in place.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: "-70%",
              background:
                "conic-gradient(from 0deg, transparent 0 78%, rgba(240,166,60,.9) 88%, transparent 96%)",
              animation: "beamSpin 5.5s linear infinite",
            }}
          />

          <div className="relative rounded-[8px] bg-sl-panel">
            <div className="flex items-center gap-2 border-b border-sl-hair px-[18px] py-[13px]">
              <span aria-hidden="true" className="size-[6px] animate-pulse rounded-full bg-sl-amber" />
              <h2 className="font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
                Live now
              </h2>
              <span className="ml-auto font-mono text-[10px] text-sl-dim">
                Updating every 30s
              </span>
            </div>

            {fixtures.length === 0 ? (
              // Same panel geometry as a populated feed. An answer, not an error.
              <div className="px-[18px] py-8">
                <p className="text-[15px] text-sl-text">Nothing is being played right now.</p>
                <p className="mt-2 max-w-[420px] text-[13px] leading-[1.55] text-sl-mid">
                  When a match is on, it appears here with the service carrying it in your
                  country. Fixtures for the days ahead are on the fixtures page.
                </p>
              </div>
            ) : (
              <div>
                {fixtures.map((f, i) => {
                  const live = Boolean(f.strStatus && !/not started|scheduled|ft|match finished/i.test(f.strStatus))
                  return (
                    <div
                      key={f.idEvent}
                      className="relative flex min-h-[62px] items-center gap-3 overflow-hidden border-b border-sl-hair px-[18px] py-3 last:border-b-0"
                      style={{
                        borderLeft: "2px solid var(--sl-amber)",
                        animation: `listIn .42s cubic-bezier(.2,.7,.3,1) ${i * 90}ms both`,
                      }}
                    >
                      {/*
                        Live rows carry the still at .28 behind a 66% mask — the handoff
                        raises it from the 0.05 used elsewhere, deliberately and for live
                        rows only, so "live" reads as live.
                      */}
                      {live && f.artwork && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 right-0 w-[44%] overflow-hidden"
                          style={{
                            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 66%)",
                            maskImage: "linear-gradient(90deg, transparent, #000 66%)",
                          }}
                        >
                          <Image
                            src={f.artwork}
                            alt=""
                            fill
                            sizes="40vw"
                            className="sl-ken-burns object-cover"
                            style={{ opacity: 0.28 }}
                          />
                        </span>
                      )}

                      <span className="relative w-[58px] shrink-0">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-sl-amber">
                          {live && (
                            <span aria-hidden="true" className="size-[5px] animate-pulse rounded-full bg-sl-amber" />
                          )}
                          {f.strTime ? (
                            <LocalTime value={`${f.strDate}T${f.strTime.split("+")[0]}Z`} />
                          ) : (
                            "TBA"
                          )}
                        </span>
                      </span>

                      <span className="relative min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[15.5px] font-medium text-sl-text">
                          <TeamBadge src={f.strHomeTeamBadge} team={f.strHomeTeam} size="sm" />
                          <span className="truncate">{f.strHomeTeam}</span>
                          <span className="shrink-0 text-sl-mute">v</span>
                          <TeamBadge src={f.strAwayTeamBadge} team={f.strAwayTeam} size="sm" />
                          <span className="truncate">{f.strAwayTeam}</span>
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
                          {f.strLeague}
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-sl-hair px-[18px] py-[11px]">
              {/* Verbatim, per §Copy. */}
              <p className="font-mono text-[10px] text-sl-dim">
                Channel listings only — Sightline plays nothing
              </p>
              <Link
                href="/scores"
                className="shrink-0 text-[12px] text-sl-blue transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 rounded-[4px]"
              >
                All live scores
              </Link>
            </div>
          </div>
        </div>

        {/* --------------------------------------------- rights + promo */}
        <div className="flex flex-col gap-[14px] lg:flex-1">
          <div className="rounded-[9px] border border-sl-line bg-sl-panel">
            <div className="border-b border-sl-hair px-4 py-[13px]">
              <h2 className="font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mid">
                Broadcast listings
              </h2>
            </div>

            <div className="grid grid-cols-2">
              {countries.map((code) => {
                const casters = [
                  ...new Set(
                    COMPETITION_RIGHTS.flatMap((c) =>
                      c.listings.filter((l) => l.country === code).map((l) => l.broadcaster),
                    ),
                  ),
                ]
                return (
                  <Link
                    key={code}
                    href={`/where-to-watch/${code.toLowerCase()}`}
                    className="border-b border-r border-sl-hair px-4 py-3 transition-colors duration-[.16s] last:border-r-0 hover:bg-sl-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0"
                  >
                    <p className="text-[14px] font-medium text-sl-text">{countryName(code)}</p>
                    <p className="mt-0.5 truncate text-[12.5px] text-sl-mute">
                      {casters.join(" · ")}
                    </p>
                  </Link>
                )
              })}
            </div>

            {/* One static line. Nothing here needs maintaining to stay true. */}
            <p className="border-t border-sl-hair px-4 py-3 text-[12.5px] leading-[1.5] text-sl-mute">
              {BROADCAST_PROVENANCE_SHORT}
            </p>
          </div>

          {promo && (
            <Link
              href="/blog/why-different-channel-every-country"
              className="group relative flex min-h-[164px] flex-1 flex-col overflow-hidden rounded-[9px] border border-sl-line bg-sl-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50"
            >
              {promoArt && (
                <Image
                  src={promoArt}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  aria-hidden="true"
                  className="sl-ken-burns object-cover"
                  style={{ opacity: 0.34 }}
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, var(--sl-panel) 12%, rgba(15,18,22,.5) 70%, transparent)",
                }}
              />
              {/*
                The card owns the column and this owns flex-1 with content pushed to the
                end. Putting height:100% here instead unanchors the title from the scrim
                and lands it on bright artwork.
              */}
              <span className="relative flex flex-1 flex-col justify-end gap-1.5 p-4">
                <span className="font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-blue">
                  Explainer
                </span>
                <span className="text-[16px] font-medium leading-[1.25] tracking-[-0.014em] text-sl-text">
                  Why the same match is on a different channel in every country
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
