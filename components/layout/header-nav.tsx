"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CountrySelect, type CountryOption } from "@/components/sightline/country-select"

/**
 * Header navigation and the mobile drawer.
 *
 * The four items are exactly those in design/sightline/HANDOFF.md §1. They are plain
 * anchors rendered on the server, so navigation works before hydration and without
 * JavaScript; only the drawer's open state is client-side.
 */

const NAV = [
  { name: "Live scores", href: "/scores" },
  { name: "Fixtures", href: "/events" },
  { name: "Film & TV", href: "/watch/title" },
  { name: "Guides", href: "/watch" },
] as const

export function HeaderNav({
  countries,
  country,
}: {
  countries: CountryOption[]
  country: string | null
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the drawer on navigation, and on Escape.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    // Prevent the page scrolling behind the drawer.
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "rounded-[5px] px-3 py-2 text-[13px] transition-colors duration-[.16s]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60",
              isActive(item.href)
                ? "text-sl-text"
                : "text-sl-mid hover:text-sl-text",
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="hidden lg:block">
        <CountrySelect countries={countries} current={country} />
      </div>

      {/* Mobile trigger. 44px minimum tap target, per the handoff. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-[5px] text-sl-mid transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[min(320px,86vw)] flex-col border-l border-sl-line bg-sl-panel"
          >
            <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-sl-line px-[18px]">
              <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-[5px] text-sl-mid transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-1 p-[18px]">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center rounded-[6px] px-3 text-[15px] transition-colors duration-[.16s]",
                    isActive(item.href)
                      ? "bg-sl-raise text-sl-text"
                      : "text-sl-mid hover:bg-sl-surface hover:text-sl-text",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-sl-line p-[18px]">
              <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
                Country
              </p>
              <CountrySelect countries={countries} current={country} className="w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
