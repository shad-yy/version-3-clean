"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { REGION_ORDER, type RegionName } from "@/lib/geo/regions"
import { CoverageRibbon } from "@/components/sightline/coverage-ribbon"
import {
  LANES,
  type CountryAvailabilityView,
} from "@/components/sightline/availability-types"
import { cn } from "@/lib/utils"

/**
 * The 139-country availability explorer — design/sightline/HANDOFF.md §5.
 *
 * Owns the state the ribbon and the list both need, because their interaction is
 * bidirectional: hovering a row highlights its tick, clicking a tick opens the row.
 * Splitting them would mean lifting all of this into a parent anyway.
 *
 * **Rows expand, they never navigate** (design opinion 5). A reader comparing countries
 * would otherwise lose their scroll position on every look.
 */

/** One of the five matrix slots. Solid when held, outlined when not — shape, not just colour. */
function MatrixSlot({ held, letter, label }: { held: boolean; letter: string; label: string }) {
  return (
    <span
      title={label}
      aria-label={`${label}: ${held ? "available" : "not available"}`}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-[3px] font-mono text-[10px] leading-none",
        held
          ? "bg-sl-blue text-sl-ground"
          : "border border-sl-outline text-sl-outline-text",
      )}
    >
      {held ? letter : "—"}
    </span>
  )
}

function CountryRow({
  country,
  open,
  onToggle,
  onHover,
  hovered,
  rowRef,
}: {
  country: CountryAvailabilityView
  open: boolean
  onToggle: () => void
  onHover: (code: string | null) => void
  hovered: boolean
  rowRef?: (el: HTMLDivElement | null) => void
}) {
  const nothingRecorded = country.kindsHeld === 0

  return (
    <div ref={rowRef} className="border-b border-sl-hair last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => onHover(country.code)}
        onMouseLeave={() => onHover(null)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-[.16s]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60",
          hovered || open ? "bg-sl-surface" : "hover:bg-sl-surface",
        )}
      >
        <span className="w-[150px] shrink-0 truncate text-[14px] font-medium text-sl-text">
          {country.name}
        </span>

        <span className="flex shrink-0 gap-1">
          {LANES.map((lane) => (
            <MatrixSlot
              key={lane.key}
              held={country.lanes[lane.key].length > 0}
              letter={lane.letter}
              label={lane.label}
            />
          ))}
        </span>

        <span className="ml-auto shrink-0 font-mono text-[10.5px] uppercase tracking-[.08em] text-sl-mute">
          {nothingRecorded
            ? "No offers recorded"
            : `${country.serviceCount} ${country.serviceCount === 1 ? "service" : "services"}`}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-sl-dim transition-transform duration-[.22s]",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-[.22s] px-5 pb-4">
          {nothingRecorded ? (
            // The honest gap, in full sentences. Design opinion 7 — these stay.
            <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mid">
              Nothing is recorded for {country.name}. That means our source lists no way to
              watch it there — not that the title is unavailable. Where we have not checked
              a country at all, it does not appear in this list.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {LANES.map((lane) => {
                const services = country.lanes[lane.key]
                return (
                  <div key={lane.key} className="flex flex-wrap items-baseline gap-2">
                    <span className="w-[110px] shrink-0 font-mono text-[10.5px] uppercase tracking-[.1em] text-sl-mute">
                      {lane.label}
                    </span>
                    {services.length === 0 ? (
                      <span className="text-[13px] text-sl-dim">
                        No {lane.label.toLowerCase()} offer recorded
                      </span>
                    ) : (
                      services.map((s) => (
                        <span
                          key={s}
                          className="rounded-[5px] border border-sl-line bg-sl-surface px-2.5 py-1 text-[13px] text-sl-mid"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AvailabilityExplorer({
  countries,
  notCheckedCount,
}: {
  countries: CountryAvailabilityView[]
  notCheckedCount: number
}) {
  const [filter, setFilter] = useState("")
  const [openCountry, setOpenCountry] = useState<string | null>(null)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [activeRegion, setActiveRegion] = useState<RegionName | null>(null)
  // Europe open by default, per the handoff.
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>({ Europe: true })

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const regionRefs = useRef<Record<string, HTMLElement | null>>({})

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return countries
    return countries.filter((c) => c.name.toLowerCase().includes(q))
  }, [countries, filter])

  const groups = useMemo(
    () =>
      REGION_ORDER.map((region) => ({
        region,
        items: filtered.filter((c) => c.region === region),
      })).filter((g) => g.items.length > 0),
    [filtered],
  )

  // A filter that matches should reveal its matches, not leave them behind a closed
  // group — otherwise the input looks broken.
  useEffect(() => {
    if (!filter.trim()) return
    setOpenRegions((prev) => {
      const next = { ...prev }
      for (const g of groups) next[g.region] = true
      return next
    })
  }, [filter, groups])

  // Which continent the reader is looking at, for the ribbon's dimming and label.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) {
          setActiveRegion((visible.target as HTMLElement).dataset.region as RegionName)
        }
      },
      { rootMargin: "-120px 0px -60% 0px" },
    )
    Object.values(regionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [groups.length])

  /** Clicking a ribbon tick opens its continent and row, then brings it into view. */
  const selectCountry = useCallback(
    (code: string) => {
      const country = countries.find((c) => c.code === code)
      if (!country) return
      setOpenRegions((prev) => ({ ...prev, [country.region]: true }))
      setOpenCountry(code)
      // Wait for the group to render before scrolling to a row inside it.
      requestAnimationFrame(() => {
        const el = rowRefs.current[code]
        if (!el) return
        const y = el.getBoundingClientRect().top + window.scrollY - 148
        window.scrollTo({ top: y, behavior: "smooth" })
      })
    },
    [countries],
  )

  return (
    <>
      <CoverageRibbon
        countries={countries}
        notCheckedCount={notCheckedCount}
        activeRegion={activeRegion}
        hoveredCode={hoveredCode}
        onHoverCountry={setHoveredCode}
        onSelectCountry={selectCountry}
      />

      <div className="mx-auto max-w-[1280px] px-[18px] py-10 lg:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-[250px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sl-mute"
              aria-hidden="true"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              type="search"
              aria-label="Filter countries by name"
              placeholder="Filter countries"
              className="h-[42px] w-full rounded-[6px] border border-sl-chip-border bg-sl-surface pl-9 pr-3 text-[13px] text-sl-text outline-none transition-colors duration-[.16s] placeholder:text-sl-mute focus:border-sl-amber"
            />
          </div>

          {/* Legend. Explains the letters and, critically, what an outline means. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {LANES.map((lane) => (
              <span key={lane.key} className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-[3px] bg-sl-blue font-mono text-[10px] leading-none text-sl-ground">
                  {lane.letter}
                </span>
                <span className="text-[12px] text-sl-mute">{lane.label}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-[3px] border border-sl-outline font-mono text-[10px] leading-none text-sl-outline-text">
                —
              </span>
              <span className="text-[12px] text-sl-mute">outlined: none held</span>
            </span>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
            <p className="text-[14px] text-sl-mid">
              No country matches &ldquo;{filter}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[8px] border border-sl-line">
            {groups.map((group) => {
              const isOpen = openRegions[group.region] ?? false
              const subs = group.items.filter((c) => c.lanes.flatrate.length > 0).length
              const frees = group.items.filter(
                (c) => c.lanes.free.length > 0 || c.lanes.ads.length > 0,
              ).length
              const nothing = group.items.filter((c) => c.kindsHeld === 0).length

              return (
                <section
                  key={group.region}
                  data-region={group.region}
                  ref={(el) => {
                    regionRefs.current[group.region] = el
                  }}
                  className="border-b border-sl-line last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRegions((prev) => ({ ...prev, [group.region]: !isOpen }))
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 bg-sl-panel px-5 py-3.5 text-left transition-colors duration-[.16s] hover:bg-sl-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                  >
                    <span className="text-[15px] font-semibold text-sl-text">
                      {group.region}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-sl-mute">
                      {group.items.length}
                    </span>
                    <span className="ml-auto hidden font-mono text-[10.5px] uppercase tracking-[.08em] text-sl-mute sm:block">
                      {subs} subscription · {frees} free or ad-supported · {nothing} nothing
                      recorded
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-sl-dim transition-transform duration-[.22s]",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="bg-sl-ground">
                      {group.items.map((c) => (
                        <CountryRow
                          key={c.code}
                          country={c}
                          open={openCountry === c.code}
                          hovered={hoveredCode === c.code}
                          onHover={setHoveredCode}
                          onToggle={() =>
                            setOpenCountry((prev) => (prev === c.code ? null : c.code))
                          }
                          rowRef={(el) => {
                            rowRefs.current[c.code] = el
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
