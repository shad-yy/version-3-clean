"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { FeatureCollection, Geometry } from "geojson"
import { NUMERIC_TO_ALPHA2 } from "@/lib/geo/topology-map"
import type { CountryAvailabilityView } from "@/components/sightline/availability-types"

/**
 * World coverage map — design/sightline/HANDOFF.md §5.
 *
 * Natural Earth geometry via world-atlas, projected with d3-geo's geoNaturalEarth1,
 * exactly as the handoff specifies. **Country shapes are never hand-drawn**, and the
 * topology is served from our own origin rather than a CDN because the CSP blocks
 * external hosts.
 *
 * Fill follows the same encoding as the coverage ribbon, so the two read as one system:
 * blue at 4–5 offer kinds, blueMid at 3, blueLow at 1–2, and a bare outline where we hold
 * nothing. A country absent from our data is drawn but left unfilled — present on the map
 * and visibly uncovered, rather than quietly omitted.
 */

const WIDTH = 900
const HEIGHT = 462

function fillFor(kinds: number | undefined) {
  if (kinds === undefined) return "transparent"
  if (kinds >= 4) return "var(--sl-blue)"
  if (kinds === 3) return "var(--sl-blue-mid)"
  if (kinds >= 1) return "var(--sl-blue-low)"
  return "transparent"
}

export function WorldMap({
  countries,
  hoveredCode,
  onHoverCountry,
  onSelectCountry,
}: {
  countries: CountryAvailabilityView[]
  hoveredCode: string | null
  onHoverCountry: (code: string | null) => void
  onSelectCountry: (code: string) => void
}) {
  const [topology, setTopology] = useState<FeatureCollection<Geometry> | null>(null)
  const [failed, setFailed] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    fetch("/geo/countries-110m.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`topology ${r.status}`)
        return r.json()
      })
      .then((topo) => {
        const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>
        setTopology(fc)
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        console.error("[WorldMap] topology failed to load —", err)
        setFailed(true)
      })
    return () => controller.abort()
  }, [])

  const byCode = useMemo(() => {
    const m = new Map<string, CountryAvailabilityView>()
    countries.forEach((c) => m.set(c.code, c))
    return m
  }, [countries])

  const pathFor = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: "Sphere" })
    return geoPath(projection)
  }, [])

  if (failed) {
    // An honest, quiet failure. The list below carries the same information, so the map
    // is an aid rather than the only route to it.
    return (
      <div
        className="flex items-center justify-center rounded-[8px] border border-sl-line bg-sl-panel"
        style={{ height: HEIGHT }}
      >
        <p className="px-6 text-center text-[13px] text-sl-mute">
          The map could not load. Every country is still listed below.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-sl-line bg-sl-panel">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`World coverage map. ${countries.length} countries have availability recorded.`}
      >
        {!topology ? (
          <rect width={WIDTH} height={HEIGHT} fill="var(--sl-panel)" />
        ) : (
          topology.features.map((f, i) => {
            const numeric = String((f as { id?: string | number }).id ?? "")
            const alpha2 = NUMERIC_TO_ALPHA2[numeric]
            const entry = alpha2 ? byCode.get(alpha2) : undefined
            const d = pathFor(f)
            if (!d) return null

            const isHovered = alpha2 !== undefined && alpha2 === hoveredCode
            const interactive = Boolean(entry)

            return (
              <path
                key={`${numeric}-${i}`}
                d={d}
                fill={fillFor(entry?.kindsHeld)}
                stroke={isHovered ? "var(--sl-amber)" : "var(--sl-outline)"}
                strokeWidth={isHovered ? 1.4 : 0.5}
                style={{
                  cursor: interactive ? "pointer" : "default",
                  transition: "fill .16s ease, stroke .16s ease, stroke-width .16s ease",
                }}
                onMouseEnter={() => alpha2 && onHoverCountry(alpha2)}
                onMouseLeave={() => onHoverCountry(null)}
                onClick={() => interactive && alpha2 && onSelectCountry(alpha2)}
              >
                {/* Native tooltip: no bespoke overlay to trap focus or fight the sticky
                    ribbon, and it works before hydration completes. */}
                <title>
                  {entry
                    ? `${entry.name} — ${entry.kindsHeld} of 5 offer kinds, ${entry.serviceCount} services`
                    : alpha2
                      ? `${f.properties && (f.properties as { name?: string }).name} — nothing recorded`
                      : ""}
                </title>
              </path>
            )
          })
        )}
      </svg>
    </div>
  )
}
