"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DockItem } from "@/lib/data/verification-log"

/**
 * "Just checked" discovery dock — design/sightline/HANDOFF.md §1.6.
 *
 * The signature interaction of the homepage, and the one that could not be built until
 * the verification log existed.
 *
 * **The content rule is the whole point** (design opinion 6): items are things
 * re-verified by hand in the last day, in the reader's own country. Never popularity,
 * never payment. The footnote saying so is part of the design and is not decoration —
 * it is the claim that distinguishes this from every other "trending now" strip.
 *
 * Behaviour notes that matter:
 *
 *  - The sticky wrapper is `pointer-events: none` and only the panel re-enables them, so
 *    the dock can never block scrolling or swallow a click meant for the page.
 *  - Dismissal persists for the session and the dock must not return.
 *  - It renders nothing when there is nothing to say. A dock announcing "0 things
 *    verified" is worse than an absent one.
 */

const DISMISS_KEY = "sl_dock_dismissed"
const SHOW_AFTER_PX = 200

export function DiscoveryDock({
  items,
  countryName,
}: {
  items: DockItem[]
  countryName: string
}) {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(true) // assume dismissed until we can check
  const railRef = useRef<HTMLDivElement>(null)

  // Session dismissal. Read after mount so the server render and the first client
  // render agree.
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  /*
   * Slide in past the fold.
   *
   * A plain listener with no rAF throttle: `window.scrollY` is a cheap property read and
   * React batches the resulting state updates, so throttling bought nothing but a second
   * piece of state to reason about. It also runs once on mount, which matters when the
   * browser restores a scroll position on back-navigation.
   */
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Escape closes the expanded rail, then dismisses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (open) setOpen(false)
      else dismiss()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  function dismiss() {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // Private mode or storage disabled. Dismissal still holds for this render.
    }
  }

  function scrollRail(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 290, behavior: "smooth" })
  }

  // Nothing verified recently in this country: say nothing at all.
  if (items.length === 0 || dismissed) return null

  return (
    <div
      // pointer-events none so the dock can never intercept a scroll or a click meant
      // for the page behind it. The panel re-enables them for itself.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-[18px] pb-4 lg:px-20"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-[1280px] overflow-hidden rounded-[10px] border border-sl-line bg-sl-panel shadow-dock",
          "transition-transform duration-[.44s] ease-[cubic-bezier(.2,.7,.3,1)]",
        )}
        style={{ transform: visible ? "translateY(0)" : "translateY(128%)" }}
      >
        {/* Collapsed bar */}
        <div className="flex h-[52px] items-center gap-3 px-4">
          <span aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-sl-amber" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[5px]"
          >
            <span className="shrink-0 text-[14px] font-medium text-sl-text">Just checked</span>
            <span className="truncate text-[13px] text-sl-mute">
              {items.length} {items.length === 1 ? "thing" : "things"} verified for{" "}
              {countryName} in the last 24 hours
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="hidden shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 sm:flex"
          >
            {open ? "Hide" : "See them"}
            <ChevronUp
              className={cn("size-3.5 transition-transform duration-[.22s]", open && "rotate-180")}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex size-[26px] shrink-0 items-center justify-center rounded-[5px] text-sl-dim transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Expanded rail */}
        {open && (
          <div className="animate-in fade-in slide-in-from-top-1 border-t border-sl-hair duration-[.26s]">
            <div className="flex items-center justify-between gap-3 px-4 pt-3">
              <p className="font-mono text-[10px] uppercase tracking-[.14em] text-sl-mute">
                New since you last visited · Sport, film and television
              </p>
              <div className="hidden shrink-0 gap-1 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollRail(-1)}
                  aria-label="Scroll left"
                  className="flex size-7 items-center justify-center rounded-[5px] border border-sl-line text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(1)}
                  aria-label="Scroll right"
                  className="flex size-7 items-center justify-center rounded-[5px] border border-sl-line text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              ref={railRef}
              className="flex gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group w-[266px] shrink-0 rounded-[7px] border border-sl-line bg-sl-surface p-3.5 transition-transform duration-[.16s] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                  style={{
                    borderLeft: `2px solid ${item.kind === "sport" ? "var(--sl-amber)" : "var(--sl-blue)"}`,
                    animation: `fadeRise .45s cubic-bezier(.2,.7,.3,1) ${i * 70}ms both`,
                  }}
                >
                  <p
                    className={cn(
                      "font-mono text-[10.5px] tracking-[.06em]",
                      item.kind === "sport" ? "text-sl-amber" : "text-sl-blue",
                    )}
                  >
                    {item.lead}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[.12em] text-sl-mute">
                    {item.sub}
                  </p>
                  <p className="mt-2 truncate text-[15px] font-medium text-sl-text">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-sl-mid">{item.where}</p>
                  <p className="mt-3 border-t border-sl-hair pt-2 font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
                    Checked {item.checkedAt.slice(0, 10)}
                  </p>
                </Link>
              ))}
            </div>

            {/* Part of the design, not a disclaimer. It is the claim. */}
            <p className="border-t border-sl-hair px-4 py-2.5 text-[12px] leading-[1.5] text-sl-mute">
              Only things we re-checked by hand in the last day, and only where we hold an
              offer in your country. Nothing here is sponsored or ranked by popularity.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
