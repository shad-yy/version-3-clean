"use client"

import { useEffect, useRef, useState } from "react"

/**
 * The hero stat row — design_handoff_sightline_ui/README.md §3a.
 *
 * Three columns: a 34px mono tabular value over a 10px uppercase label. Counts up once on
 * mount over 1.7s with a cubic ease-out, **not** on every scroll into view — a number that
 * re-animates every time it passes the fold is a toy.
 *
 * ## The third stat is not the one the design asked for
 *
 * The handoff specifies `4,128` / "Checks in the last 7 days". The verification log holds
 * **seven entries, all dated 2026-07-31**, so the real figure for that metric is zero.
 * The designer marked their sample data as representative and said to wire the real APIs;
 * wired honestly, that column would have read `0` beneath the site's strongest claim.
 *
 * The owner's call was to keep three columns and change the metric to one that is true.
 * The three figures describe coverage rather than activity. A counter of checks performed
 * would need daily upkeep to stay true, and the site no longer claims a checking cadence.
 *
 * `tabular-nums` throughout: without it the digits shift width as they count and the
 * whole row jitters.
 */

export interface HeroStat {
  value: number
  label: string
  /** Rendered as-is when the raw number needs a qualifier, e.g. "139+". */
  display?: string
}

const DURATION_MS = 1700

/** Cubic ease-out. Fast first, settling rather than stopping. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function HeroCounters({ stats }: { stats: HeroStat[] }) {
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0))
  const frame = useRef<number>(0)

  useEffect(() => {
    // Respect the user's setting: land on the final values without counting.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValues(stats.map((s) => s.value))
      return
    }

    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / DURATION_MS)
      const eased = easeOut(progress)
      setValues(stats.map((s) => Math.round(s.value * eased)))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)

    // Cancelled on unmount — a loose rAF loop outlives the page otherwise.
    return () => cancelAnimationFrame(frame.current)
  }, [stats])

  return (
    <div className="mt-[34px] flex flex-wrap gap-x-10 gap-y-6">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{
            animation: `wordIn .62s cubic-bezier(.2,.7,.3,1) ${520 + i * 52}ms both`,
          }}
        >
          <p className="font-mono text-[26px] leading-none tabular-nums text-sl-text lg:text-[34px]">
            {stat.display ?? values[i].toLocaleString()}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[.14em] text-sl-mute">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
