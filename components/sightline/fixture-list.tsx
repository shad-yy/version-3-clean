"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamBadge } from "@/components/sightline/team-badge"
import { EventBackdrop } from "@/components/sightline/event-backdrop"
import { LocalTime } from "@/components/ui/local-time"

/**
 * Fixture list — design_handoff_sightline_ui/README.md §2d.
 *
 * Rows **open in place** rather than navigating. That is the whole point of the screen:
 * the question is "who is showing this where I am", and the answer is two lines long.
 * Sending someone to a new page for two lines, then making them come back to check the
 * next fixture, is the interaction the old list had and the reason it read as a directory
 * rather than a tool.
 *
 * Single-open: opening a row closes the previous one. A list with six panels open is a
 * list nobody can scan, and the design's own function tests assert this behaviour.
 *
 * The title still links out, so the match page stays reachable and crawlable — the
 * accordion is an accelerator, not a replacement.
 */

export interface FixtureRowData {
  id: string
  homeTeam: string
  awayTeam: string
  homeLogo?: string | null
  awayLogo?: string | null
  league: string
  venue?: string
  date: string
  time?: string
  artwork?: string | null
  /** The broadcaster in the viewer's country, when we hold one. */
  broadcaster?: string | null
  /** Provenance for that listing. Never rendered as a badge — a mono date only. */
  verified?: string | null
  isLive?: boolean
}

export function FixtureList({
  fixtures,
  countryText,
}: {
  fixtures: FixtureRowData[]
  countryText: string
}) {
  // The first live fixture opens by default; otherwise nothing does. Opening the top row
  // of a scheduled list would just cost a click to close.
  const [openId, setOpenId] = useState<string | null>(
    () => fixtures.find((f) => f.isLive)?.id ?? null,
  )

  return (
    <div className="overflow-hidden rounded-[8px] border border-sl-line bg-sl-panel">
      {fixtures.map((f, i) => {
        const open = openId === f.id
        const kickoff = f.time ? `${f.date}T${String(f.time).slice(0, 8)}Z` : null

        return (
          <div key={f.id} className="border-b border-sl-hair last:border-b-0">
            <div
              className={cn(
                "relative flex items-center gap-3 overflow-hidden px-4 transition-colors duration-[.16s] hover:bg-sl-surface",
                f.isLive ? "min-h-[64px] py-3" : "min-h-[52px] py-2.5",
              )}
              style={{
                borderLeft: "2px solid var(--sl-amber)",
                animation: `listIn .42s cubic-bezier(.2,.7,.3,1) ${Math.min(i, 8) * 90}ms both`,
              }}
            >
              {/*
                Live rows only carry the still, and carry it far stronger than elsewhere on
                the site -- .3 against the 0.05 used for scheduled artwork. The handoff is
                explicit about this: it is what makes "live" read as live.
              */}
              {f.isLive && <EventBackdrop src={f.artwork} intensity="live" />}

              <span className="relative w-[76px] shrink-0">
                <span className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-sl-amber">
                  {f.isLive && (
                    <span aria-hidden="true" className="size-[5px] animate-pulse rounded-full bg-sl-amber" />
                  )}
                  {kickoff ? <LocalTime value={kickoff} /> : "TBA"}
                </span>
              </span>

              <span className="relative flex min-w-0 flex-1 items-center gap-1.5">
                <TeamBadge src={f.homeLogo} team={f.homeTeam} size="sm" />
                <Link
                  href={`/match/${f.id}`}
                  className="truncate text-[16px] font-medium text-sl-text transition-colors duration-[.16s] hover:text-sl-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 rounded-[3px]"
                >
                  {f.homeTeam}
                </Link>
                <span className="shrink-0 text-sl-mute">v</span>
                <TeamBadge src={f.awayLogo} team={f.awayTeam} size="sm" />
                <Link
                  href={`/match/${f.id}`}
                  className="truncate text-[16px] font-medium text-sl-text transition-colors duration-[.16s] hover:text-sl-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 rounded-[3px]"
                >
                  {f.awayTeam}
                </Link>
              </span>

              <span className="relative hidden w-[250px] shrink-0 text-right sm:block">
                <span className="block truncate text-[13.5px] text-sl-mid">
                  {f.broadcaster ?? `Not verified in ${countryText}`}
                </span>
                {f.verified && (
                  // A mono date. Never a tick, never coloured — design opinion 3.
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
                    Checked {f.verified}
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={() => setOpenId(open ? null : f.id)}
                aria-expanded={open}
                aria-label={open ? "Close details" : `Details for ${f.homeTeam} v ${f.awayTeam}`}
                className="relative flex size-8 shrink-0 items-center justify-center rounded-[5px] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50"
              >
                <ChevronDown
                  className={cn("size-4 transition-transform duration-[.22s]", open && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </div>

            {open && (
              <div
                className="bg-sl-surface px-4 pb-4 pt-1 sm:pl-[92px]"
                style={{ animation: "expand .22s cubic-bezier(.2,.7,.3,1) both" }}
              >
                <div className="flex flex-wrap gap-x-7 gap-y-4">
                  <div>
                    <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-mute">
                      Shown in {countryText}
                    </p>
                    {f.broadcaster ? (
                      <span className="inline-flex items-center rounded-[6px] border border-sl-line bg-sl-panel px-3 py-1.5 text-[14px] text-sl-text">
                        {f.broadcaster}
                      </span>
                    ) : (
                      <p className="text-[13.5px] text-sl-mute">
                        We have not verified a broadcaster in {countryText}.
                      </p>
                    )}
                  </div>

                  {kickoff && (
                    <div>
                      <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-mute">
                        Kick-off
                      </p>
                      <p className="font-mono text-[14px] tabular-nums text-sl-text">
                        <LocalTime value={kickoff} />
                      </p>
                    </div>
                  )}

                  {f.venue && (
                    <div>
                      <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-mute">
                        Venue
                      </p>
                      <p className="text-[14px] text-sl-text">{f.venue}</p>
                    </div>
                  )}

                  {f.verified && (
                    <div className="ml-auto text-right">
                      <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-mute">
                        Checked by hand
                      </p>
                      <p className="font-mono text-[13px] uppercase tracking-[.06em] text-sl-mid">
                        {f.verified}
                      </p>
                    </div>
                  )}
                </div>

                {/* Verbatim from §Copy. */}
                <p className="mt-4 text-[12.5px] text-sl-mute">
                  These are channel listings, not links to video. Sightline plays nothing.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
