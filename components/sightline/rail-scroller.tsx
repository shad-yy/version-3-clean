"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Horizontal scroller with arrow controls.
 *
 * Takes its cards as `children` so they stay **server components** — the posters, links
 * and text ship as HTML, and the only JavaScript here is the scrolling behaviour. Putting
 * the card markup inside this file instead would drag the whole rail into the client
 * bundle for the sake of two buttons.
 *
 * Arrows are hidden when there is nothing to scroll to, and hidden entirely on touch,
 * where dragging is the natural gesture and a floating arrow is just clutter.
 */
export function RailScroller({
  children,
  step = 300,
  label,
}: {
  children: React.ReactNode
  /** Pixels per arrow press. Should be roughly one card plus its gap. */
  step?: number
  /** Accessible name for the scrollable region. */
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    // 2px tolerance: sub-pixel layout means scrollLeft rarely lands exactly on the bound.
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    sync()
    el.addEventListener("scroll", sync, { passive: true })
    // Card count and viewport width both change what is reachable.
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", sync)
      observer.disconnect()
    }
  }, [sync])

  const scrollBy = (direction: -1 | 1) =>
    ref.current?.scrollBy({ left: direction * step, behavior: "smooth" })

  const arrow =
    "hidden size-8 shrink-0 items-center justify-center rounded-[6px] border border-sl-line bg-sl-panel text-sl-mute transition-colors duration-[.16s] hover:text-sl-text disabled:opacity-30 disabled:hover:text-sl-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 md:flex"

  return (
    <div className="relative">
      <div className="mb-2 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Scroll left"
          className={arrow}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Scroll right"
          className={arrow}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "flex gap-3.5 overflow-x-auto pb-1",
          // Snap makes arrow presses land on a card edge rather than mid-poster.
          "snap-x snap-mandatory scroll-px-[18px]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[6px]",
        )}
      >
        {children}
      </div>
    </div>
  )
}
