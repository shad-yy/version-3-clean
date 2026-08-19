"use client"

import { useEffect, useRef, useState } from "react"
import { REGION_ORDER, type RegionName } from "@/lib/geo/regions"
import type { CountryAvailabilityView } from "@/components/sightline/availability-types"
import { cn } from "@/lib/utils"

/**
 * Coverage ribbon — design/sightline/HANDOFF.md §5, the signature element.
 *
 * One tick per country, grouped by continent, plus a trailing muted group standing for
 * the countries we hold nothing for. Tick height encodes how many of the five offer kinds
 * exist; fill encodes the same thing in colour. Both together, because encoding state by
 * colour alone fails for colour-blind readers and in greyscale (design opinion 4).
 *
 * The whole point is that a reader sees the shape of our coverage — including its
 * gaps — before reading a single row.
 */

/** Handoff: 7px base, 3.4px per offer kind held. */
function tickHeight(kinds: number) {
  return 7 + kinds * 3.4
}

/** Handoff: blue at 4–5 kinds, blueMid at 3, blueLow at 1–2, outlined at 0. */
function tickFill(kinds: number) {
  if (kinds >= 4) return "var(--sl-blue)"
  if (kinds === 3) return "var(--sl-blue-mid)"
  if (kinds >= 1) return "var(--sl-blue-low)"
  return "transparent"
}

export function CoverageRibbon({
  countries,
  notCheckedCount,
  activeRegion,
  hoveredCode,
  onHoverCountry,
  onSelectCountry,
}: {
  countries: CountryAvailabilityView[]
  notCheckedCount: number
  /** Continent currently in view, driven by the list's IntersectionObserver. */
  activeRegion: RegionName | null
  hoveredCode: string | null
  onHoverCountry: (code: string | null) => void
  onSelectCountry: (code: string) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  // Playhead: scroll progress across the document, written on a rAF so a fast scroll
  // cannot queue a frame per event.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const groups = REGION_ORDER.map((region) => ({
    region,
    items: countries.filter((c) => c.region === region),
  })).filter((g) => g.items.length > 0)

  const hovered = hoveredCode ? countries.find((c) => c.code === hoveredCode) : null

  // The header label names whatever the reader is looking at: a hovered country wins,
  // then the continent in view, then the film itself.
  const label = hovered
    ? `${hovered.name} — ${hovered.kindsHeld} of 5 offer kinds`
    : activeRegion ?? "The film"

  return (
    <div
      /*
       * Hidden below 768px by owner decision. 139 ticks across a 390px viewport is
       * roughly 2px each with no gaps -- unreadable, untappable, and decoration
       * pretending to be a control. The list, filter and map carry the same
       * information on mobile.
       */
      className="sticky top-[62px] z-40 hidden border-b border-sl-line bg-[rgba(11,13,17,.94)] backdrop-blur-[9px] md:block"
    >
      <div className="mx-auto max-w-[1280px] px-[18px] py-3 lg:px-10">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="truncate font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mid">
            {label}
          </p>
          <p className="shrink-0 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
            {countries.length} checked · {notCheckedCount} not checked
          </p>
        </div>

        <div ref={trackRef} className="relative">
          {/* Ticks */}
          <div className="flex items-end gap-[9px] overflow-hidden" style={{ height: 24 }}>
            {groups.map((group) => (
              <div
                key={group.region}
                className="flex items-end gap-[2px] transition-opacity duration-[.16s]"
                style={{
                  // Dim continents the reader is not currently looking at.
                  opacity: !activeRegion || activeRegion === group.region ? 1 : 0.34,
                }}
              >
                {group.items.map((c) => {
                  const isHovered = c.code === hoveredCode
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onMouseEnter={() => onHoverCountry(c.code)}
                      onMouseLeave={() => onHoverCountry(null)}
                      onFocus={() => onHoverCountry(c.code)}
                      onBlur={() => onHoverCountry(null)}
                      onClick={() => onSelectCountry(c.code)}
                      aria-label={`${c.name} — ${c.kindsHeld} of 5 offer kinds`}
                      className="group relative w-[5px] shrink-0 rounded-[1px] focus:outline-none"
                      style={{
                        height: tickHeight(c.kindsHeld),
                        // An empty <button> still generates a line box from the inherited
                        // font, which floored every tick at ~16px. That flattened 0, 1 and
                        // 2 offer kinds into one identical height -- destroying the
                        // encoding for exactly the low-coverage countries the ribbon
                        // exists to make visible.
                        lineHeight: 0,
                        fontSize: 0,
                        background: tickFill(c.kindsHeld),
                        border: c.kindsHeld === 0 ? "1px solid var(--sl-outline)" : "none",
                        transform: isHovered ? "scaleY(1.7)" : "scaleY(1)",
                        transformOrigin: "bottom",
                        boxShadow: isHovered ? "0 0 0 1px var(--sl-amber)" : "none",
                        transition: "transform .16s ease, box-shadow .16s ease",
                      }}
                    />
                  )
                })}
              </div>
            ))}

            {/* The countries we hold nothing for. Muted, present, and countable —
                the gap is part of the picture rather than something to hide. */}
            {notCheckedCount > 0 && (
              <div
                className="flex items-end gap-[2px] opacity-40"
                aria-label={`${notCheckedCount} countries not checked`}
              >
                {Array.from({ length: Math.min(notCheckedCount, 60) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[5px] shrink-0 rounded-[1px]"
                    style={{ height: 7, border: "1px solid var(--sl-dim)", lineHeight: 0, fontSize: 0 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Scroll playhead */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-sl-amber"
            style={{ left: `${progress * 100}%`, transition: "left .08s linear" }}
          />
        </div>
      </div>
    </div>
  )
}
