"use client"

import { useEffect, useState } from "react"

/**
 * The live eyebrow above the hero headline — design_handoff_sightline_ui/README.md §3a.
 *
 * A pulsing amber dot, "Live now ·", the fixture, and a clock in amber tabular figures
 * that re-animates each time it ticks.
 *
 * ## It has to survive having nothing to say
 *
 * The design shows a match in progress. Most of the time there is no live fixture — the
 * homepage feed is empty on any day without football, which is most days. A hero whose
 * first line is a live score is a hero that looks broken five days a week.
 *
 * So the eyebrow falls back to the site's standing claim rather than disappearing: the
 * row keeps its height, the dot stops pulsing, and the copy states scope instead of a
 * scoreline. Nothing shifts when a match starts or ends.
 *
 * The clock is client-side because it ticks. Everything else in the hero is server
 * rendered — a headline that waits on hydration is a headline nobody sees.
 */

export function HeroEyebrow({
  fixture,
  minute,
  fallback,
}: {
  /** e.g. "Arsenal 2–1 Aston Villa". Null when nothing is in play. */
  fixture?: string | null
  /** Match clock as the provider reports it, e.g. "67'". */
  minute?: string | null
  /** Standing copy for when there is no live fixture. */
  fallback: string
}) {
  const isLive = Boolean(fixture)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isLive) return
    // Re-render on a cadence so the digit animation replays; the value itself comes from
    // the server on the next poll rather than being counted up locally, which would drift
    // away from the real match clock.
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [isLive])

  return (
    <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[.16em] lg:text-[11px] lg:tracking-[.18em]">
      <span
        aria-hidden="true"
        className={
          isLive
            ? "size-[7px] shrink-0 animate-pulse rounded-full bg-sl-amber"
            : "size-[7px] shrink-0 rounded-full bg-sl-dim"
        }
      />
      {isLive ? (
        <>
          <span className="text-sl-mute">Live now ·</span>
          <span className="text-sl-text">{fixture}</span>
          {minute && (
            <span
              key={tick}
              className="tabular-nums text-sl-amber"
              style={{ animation: "digitIn .5s cubic-bezier(.2,.7,.3,1) both" }}
            >
              {minute}
            </span>
          )}
        </>
      ) : (
        <span className="text-sl-mute">{fallback}</span>
      )}
    </p>
  )
}
