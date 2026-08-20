"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { ChevronDown, Check, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Portal } from "@/components/ui/portal"

/**
 * The country control.
 *
 * Appears twice in the design with the same behaviour and different clothes: as a plain
 * control in the site header, and inline inside the hero headline where the country is
 * amber-underlined with a chevron ("Where can I watch this in *United Kingdom*?").
 *
 * Changing country re-renders the page on the server, because availability, rights and
 * copy are all keyed to it. `router.refresh()` re-runs the server components with the new
 * cookie rather than forcing a full navigation, so scroll position survives.
 *
 * ## Three things this had to fix
 *
 * 1. **139 options and no way to search.** The list is every region the provider covers.
 *    Finding Japan meant scrolling past a hundred countries, on a phone, inside a panel
 *    with its own scrollbar. There is now a filter, focused on open.
 * 2. **It opened off the bottom of the screen.** The panel was absolutely positioned with
 *    a fixed 320px height and no awareness of the viewport: opened from the mobile drawer
 *    it ran to y=693 in a 550px window, putting the last countries permanently out of
 *    reach. It now flips above the trigger when there is more room there, and on small
 *    screens becomes a bottom sheet instead — which is both reachable and the native
 *    pattern for a long list on touch.
 * 3. **No keyboard navigation.** Arrow keys, Home/End and Enter now work, and the active
 *    option is scrolled into view as it moves.
 */

export interface CountryOption {
  code: string
  name: string
}

/** Below this width the panel becomes a bottom sheet rather than a floating dropdown. */
const SHEET_BREAKPOINT = 640

export function CountrySelect({
  countries,
  current,
  variant = "header",
  className,
}: {
  countries: CountryOption[]
  /** Null when we genuinely do not know — renders as "your country", never a guess. */
  current: string | null
  variant?: "header" | "inline"
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [dropUp, setDropUp] = useState(false)
  const [isSheet, setIsSheet] = useState(false)
  const [pending, startTransition] = useTransition()

  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const currentName = countries.find((c) => c.code === current)?.name ?? "your country"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    // Match the code too, so "JP" and "Japan" both work.
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().startsWith(q),
    )
  }, [countries, query])

  // Decide sheet-vs-dropdown and, for a dropdown, which direction has room.
  useEffect(() => {
    if (!open) return

    const place = () => {
      const sheet = window.innerWidth < SHEET_BREAKPOINT
      setIsSheet(sheet)
      if (sheet) return
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const below = window.innerHeight - rect.bottom
      // Flip up only when below genuinely cannot hold the panel and above can do better.
      setDropUp(below < 340 && rect.top > below)
    }

    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, { passive: true })
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place)
    }
  }, [open])

  // Reset the filter each time it opens.
  useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(Math.max(0, countries.findIndex((c) => c.code === current)))
  }, [open, countries, current])

  /*
   * Focus the search box as it mounts.
   *
   * A callback ref rather than an effect: the panel is rendered through a portal that
   * returns null until it has mounted, so an effect on `open` fires before the input
   * exists and focuses nothing.
   *
   * Skipped on the bottom sheet deliberately. Focusing there raises the on-screen keyboard
   * over the list the reader is trying to look at -- most people opening it want to scroll
   * to their country, and the ones who want to type can tap the field.
   */
  const focusSearch = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (node && !isSheet) node.focus()
  }

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Keep the highlighted option visible as the keyboard moves through the list.
  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  function choose(code: string) {
    setOpen(false)
    startTransition(async () => {
      await fetch("/api/country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: code }),
      })
      // Re-runs server components with the new cookie. Availability, rights and copy are
      // all server-rendered per country, so this is what actually updates the answer.
      router.refresh()
    })
  }

  function onSearchKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Home") {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setActiveIndex(filtered.length - 1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const pick = filtered[activeIndex]
      if (pick) choose(pick.code)
    }
  }

  const isInline = variant === "inline"

  const panel = (
    <>
      {/* Search. The whole reason the control was unusable at 139 options. */}
      <div className="sticky top-0 z-10 border-b border-sl-hair bg-sl-panel p-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-sl-dim"
            aria-hidden="true"
          />
          <input
            ref={focusSearch}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onSearchKey}
            placeholder="Search countries"
            aria-label="Search countries"
            aria-controls="country-listbox"
            className="h-9 w-full rounded-[6px] border border-sl-chip-border bg-sl-surface pl-8 pr-3 text-[13px] text-sl-text placeholder:text-sl-dim focus:border-sl-amber focus:outline-none focus:ring-[3px] focus:ring-sl-amber/[.13]"
          />
        </div>
      </div>

      <div
        ref={listRef}
        id="country-listbox"
        role="listbox"
        aria-label="Select country"
        className={cn("overflow-y-auto overscroll-contain", isSheet ? "max-h-[52vh]" : "max-h-[264px]")}
      >
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-sl-mute">
            No country matches “{query}”.
          </p>
        ) : (
          filtered.map((c, i) => {
            const selected = c.code === current
            const active = i === activeIndex
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                data-index={i}
                aria-selected={selected}
                onClick={() => choose(c.code)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left",
                  "text-[13px] transition-colors duration-[.16s]",
                  // 44px minimum tap target on touch, per the handoff.
                  "min-h-[44px] sm:min-h-0",
                  selected
                    ? "bg-sl-raise text-sl-text"
                    : active
                      ? "bg-sl-surface text-sl-text"
                      : "text-sl-mid",
                )}
              >
                <span className="truncate">{c.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[10.5px] tracking-[.06em] text-sl-mute">
                    {c.code}
                  </span>
                  {selected && <Check className="size-3.5 text-sl-amber" aria-hidden="true" />}
                </span>
              </button>
            )
          })
        )}
      </div>
    </>
  )

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Change country. Currently ${currentName}`}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors duration-[.16s]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[5px]",
          pending && "opacity-60",
          isInline
            ? // Inline in the hero headline: amber 3px underline, inherits headline size.
              "text-sl-text border-b-[3px] border-sl-amber pb-0.5 hover:text-sl-amber-hover"
            : "h-9 px-3 rounded-[5px] border border-sl-chip-border bg-sl-surface text-[13px] text-sl-mid hover:text-sl-text hover:border-sl-outline",
        )}
      >
        <span className={cn(!isInline && "max-w-[140px] truncate")}>{currentName}</span>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-[.16s]",
            isInline ? "size-6" : "size-3.5",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && isSheet && (
        // Bottom sheet on small screens: anchored to the viewport, so it cannot open
        // off-screen however far down the page the trigger happens to sit.
        //
        // Portalled for the same reason as the drawer -- the header's backdrop-filter
        // would otherwise make "fixed" mean "fixed inside the header".
        <Portal>
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[12px] border-t border-sl-line bg-sl-panel shadow-dock"
            style={{ animation: "sheetUp .26s cubic-bezier(.2,.7,.3,1) both" }}
          >
            <div className="flex items-center justify-between border-b border-sl-hair px-3 py-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
                Country
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-[5px] text-sl-mid transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {panel}
            {/* Clear of the home indicator on iOS. */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
        </Portal>
      )}

      {open && !isSheet && (
        <div
          className={cn(
            "absolute z-50 w-[280px] overflow-hidden",
            "rounded-[8px] border border-sl-line bg-sl-panel shadow-dock",
            isInline ? "left-0" : "right-0",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
          )}
          style={{ animation: "fadeRise .22s cubic-bezier(.2,.7,.3,1) both" }}
        >
          {panel}
        </div>
      )}
    </div>
  )
}
