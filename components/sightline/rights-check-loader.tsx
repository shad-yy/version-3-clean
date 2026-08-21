"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * The four-stage rights check — design_handoff_sightline_ui/README.md §3b.
 *
 * **Purpose: make the wait explain the product instead of hiding it.** A generic spinner
 * says "please hold". This says what is actually being done — region, then title, then
 * catalogues, then hand-verified rights — which is the one moment a reader is guaranteed
 * to be looking at the screen with nothing else to read.
 *
 * ## The stages are real work, shown on a timer
 *
 * Each stage names something the request genuinely does. What this cannot know is *which*
 * stage is currently running: the work happens on the server inside one Suspense
 * boundary, and there is no progress channel back to the client. So the sequence advances
 * on a 1.4s interval as the spec prescribes.
 *
 * That is a representation, not a measurement, and it is bounded to stay honest: **the bar
 * never reaches 100% and the last stage never reports itself complete.** Completion is the
 * fallback being replaced by real content. A loader that hit 100% and sat there would be
 * claiming a result it does not have.
 *
 * ## It does not flash on fast requests — but the delay is CSS, not state
 *
 * The first version held the markup behind a `visible` flag set by a `setTimeout` in an
 * effect. That renders `null` on the server, and a Suspense fallback that renders null on
 * the server does not exist: streamed HTML carried no loading state at all, which is the
 * one place this component is supposed to appear.
 *
 * The same mistake has now been made three times in this codebase — the discovery dock,
 * `OptimizedImage`, and here. **A client component whose output is gated behind an effect
 * renders nothing during SSR.** If markup has to exist server-side, the gate must be CSS.
 *
 * So the fade-in is an `animation-delay`. The markup ships with the stream; it is
 * transparent for 160ms and eases in after. A response that beats the delay replaces the
 * fallback while it is still invisible, so nothing flashes.
 */

const STAGE_MS = 1400
const SHOW_AFTER_MS = 160

interface Stage {
  title: string
  sub: string
  pct: number
  legend: string
}

/** Copy is verbatim from §Copy — these strings are load-bearing trust copy. */
function stages(regionCount: number): Stage[] {
  return [
    {
      title: "Reading your region",
      sub: "Header, then IP — never a guess",
      pct: 12,
      legend: "Region",
    },
    {
      title: "Matching the title",
      sub: "TMDB · TheSportsDB",
      pct: 38,
      legend: "Match",
    },
    {
      title: `Checking ${regionCount} catalogues`,
      sub: "Film and television availability",
      pct: 71,
      legend: "Catalogues",
    },
    {
      title: "Confirming broadcast rights",
      sub: "Hand-verified competitions only",
      pct: 96,
      legend: "Rights",
    },
  ]
}

export function RightsCheckLoader({
  regionCount = 139,
  rows = 4,
  showSlots = true,
}: {
  /** Real count of provider regions, so the copy is not a hardcoded claim. */
  regionCount?: number
  rows?: number
  /** The availability slot skeleton belongs on title lookups, not fixture lists. */
  showSlots?: boolean
}) {
  const [phase, setPhase] = useState(0)
  const list = stages(regionCount)

  useEffect(() => {
    const id = setInterval(() => {
      // Stops on the final stage rather than wrapping or completing. The request finishing
      // is what ends this, not the timer.
      setPhase((p) => (p < list.length - 1 ? p + 1 : p))
    }, STAGE_MS)
    return () => clearInterval(id)
  }, [list.length])

  const stage = list[phase]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      // Delay in CSS, not state, so the markup still ships with the server stream.
      style={{ animation: `fadeRise .3s ease ${SHOW_AFTER_MS}ms both` }}
    >
      <span className="sr-only">{stage.title}</span>

      {/* ------------------------------------------------ header row */}
      <div className="mb-5 flex items-center gap-[14px]">
        <span className="relative block size-[22px] shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-2 border-sl-line" />
          {/* A 90° amber arc: three transparent edges on a rotating ring. */}
          <span
            className="sl-arc absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--sl-amber)" }}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-medium text-sl-text">{stage.title}</p>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[.10em] text-sl-mute">
            {stage.sub}
          </p>
        </div>

        <p className="shrink-0 font-mono text-[22px] tabular-nums text-sl-amber" aria-hidden="true">
          {stage.pct}%
        </p>
      </div>

      {/* ------------------------------------------------------- bar */}
      <div className="relative h-[3px] overflow-hidden rounded-[2px] bg-sl-raise">
        <div
          className="h-full rounded-[2px] bg-sl-amber"
          style={{
            width: `${stage.pct}%`,
            transition: "width .9s cubic-bezier(.4,0,.2,1)",
          }}
        />
        {/* Sweep, so a slow stage never looks stalled. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[26%]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)",
            animation: "sweep 1.6s cubic-bezier(.4,0,.2,1) infinite",
          }}
        />
      </div>

      {/* --------------------------------------------------- legend */}
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {list.map((s, i) => {
          const reached = i <= phase
          return (
            <div key={s.legend}>
              <div
                className={cn("h-[2px] rounded-[1px]", reached ? "bg-sl-amber" : "bg-sl-raise")}
                style={{ transition: "background-color .4s ease" }}
              />
              <p
                className={cn(
                  "mt-1.5 font-mono text-[9.5px] uppercase tracking-[.1em]",
                  reached ? "text-sl-mid" : "text-sl-dim",
                )}
                style={{ transition: "color .4s ease" }}
              >
                {s.legend}
              </p>
            </div>
          )
        })}
      </div>

      {/* -------------------------------------------------- skeleton */}
      <div className="mt-7 flex flex-col gap-5 lg:flex-row" aria-hidden="true">
        <div className="flex-1">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[74px] items-center gap-4 border-l-2 border-sl-hair px-4 py-4"
            >
              {/* Geometry matches the real result row so nothing reflows on swap. */}
              <div className="w-[88px] shrink-0">
                <div className="h-[13px] w-[48px] rounded-[3px] sl-shimmer" />
                <div className="mt-2 h-[9px] w-[34px] rounded-[3px] sl-shimmer" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-[17px] w-[52%] rounded-[3px] sl-shimmer" />
                <div className="mt-2 h-[12px] w-[30%] rounded-[3px] sl-shimmer" />
              </div>
              <div className="hidden w-[150px] shrink-0 items-end sm:flex sm:flex-col">
                <div className="h-[13px] w-[130px] rounded-[3px] sl-shimmer" />
                <div className="mt-2 h-[9px] w-[84px] rounded-[3px] sl-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {showSlots && (
          <div className="lg:w-[300px]">
            {[78, 62, 88, 54, 70, 60].map((w, i) => (
              <div key={i} className="flex h-[44px] items-center gap-3">
                <div className="h-[12px] flex-1 rounded-[3px] sl-shimmer" style={{ maxWidth: `${w}%` }} />
                <div className="flex shrink-0 gap-1.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    /*
                     * These breathe rather than shimmer. A sweep travelling across five
                     * squares reads as one loading bar; five separately pulsing squares
                     * read as five separate answers, which is what they are.
                     */
                    <span key={k} className="sl-breathe block size-5 rounded-[3px] bg-sl-raise" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
