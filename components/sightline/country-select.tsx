"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
 */

export interface CountryOption {
  code: string
  name: string
}

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
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const currentName = countries.find((c) => c.code === current)?.name ?? "your country"

  // Close on outside click and on Escape. The handoff requires Escape to dismiss
  // overlays and every control to be keyboard reachable.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

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

  const isInline = variant === "inline"

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
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
        <span>{currentName}</span>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-[.16s]",
            isInline ? "size-6" : "size-3.5",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select country"
          className={cn(
            "absolute z-50 mt-2 max-h-[320px] w-[260px] overflow-y-auto",
            "rounded-[8px] border border-sl-line bg-sl-panel py-1",
            "shadow-dock",
            isInline ? "left-0" : "right-0",
          )}
        >
          {countries.map((c) => {
            const selected = c.code === current
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => choose(c.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left",
                  "text-[13px] transition-colors duration-[.16s]",
                  // 44px minimum tap target on touch, per the handoff.
                  "min-h-[44px] sm:min-h-0",
                  selected ? "bg-sl-raise text-sl-text" : "text-sl-mid hover:bg-sl-surface hover:text-sl-text",
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
          })}
        </div>
      )}
    </div>
  )
}
