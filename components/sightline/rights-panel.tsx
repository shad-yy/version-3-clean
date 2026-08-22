"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Info, Link2, CalendarPlus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * "Where it is shown" — design/sightline/HANDOFF.md §4.
 *
 * The important decision here is that the **unverified state uses the same panel geometry
 * as the verified one** (design opinion 2). A country we have not checked is not an error
 * and must not look like one: "we have not verified a broadcaster in Germany" is a true,
 * useful answer, and shrinking it into a warning strip would imply we failed rather than
 * that we have not got there yet.
 *
 * Switching country re-keys the panel so it crossfades, which makes the change legible
 * without a page navigation.
 */

export interface RightsListing {
  broadcaster: string
  streamingOn?: string
}

export interface RightsCountry {
  code: string
  name: string
  /** Null when we hold no verified listing for this country. */
  listings: RightsListing[] | null
}

export function RightsPanel({
  countries,
  initialCountry,
  verifiedDate,
  competitionName,
  verifiedSummary,
}: {
  countries: RightsCountry[]
  initialCountry: string
  /** YYYY-MM-DD, from the rights data. Never invented. */
  verifiedDate: string | null
  competitionName: string
  /** e.g. "2 competitions across 4 countries" — derived, never hardcoded. */
  verifiedSummary: string
}) {
  const [selected, setSelected] = useState(initialCountry)
  const [copied, setCopied] = useState(false)

  const current = countries.find((c) => c.code === selected) ?? countries[0]
  const verified = Boolean(current?.listings?.length)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      // Clipboard can be blocked by permissions. Say nothing rather than claim success.
    }
  }

  if (!current) return null

  return (
    <section>
      {/* Secondary actions */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-sl-chip-border bg-sl-surface px-4 text-[13px] text-sl-mid transition-colors duration-[.16s] hover:border-sl-outline hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 sm:min-h-0 sm:py-2.5"
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full transition-colors duration-[.16s]",
              copied ? "bg-sl-amber" : "bg-sl-dim",
            )}
          />
          {copied ? "Link copied" : "Copy link"}
          <Link2 className="size-3.5" aria-hidden="true" />
        </button>

        <Link
          href="/events"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-sl-chip-border bg-sl-surface px-4 text-[13px] text-sl-mid transition-colors duration-[.16s] hover:border-sl-outline hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 sm:min-h-0 sm:py-2.5"
        >
          <CalendarPlus className="size-3.5" aria-hidden="true" />
          All fixtures
        </Link>
      </div>

      <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
        Where it is shown
      </h2>

      {/* Country pills */}
      <div role="group" aria-label="Country" className="mb-5 flex flex-wrap gap-2">
        {countries.map((c) => {
          const isSelected = c.code === selected
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelected(c.code)}
              aria-pressed={isSelected}
              className={cn(
                "min-h-[44px] rounded-[20px] border px-4 text-[13px] transition-colors duration-[.16s] sm:min-h-0 sm:py-1.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60",
                isSelected
                  ? "border-sl-line bg-sl-raise text-sl-text"
                  : "border-sl-line text-sl-mute hover:border-sl-outline hover:text-sl-text",
              )}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {/* Re-keyed so a country change crossfades rather than mutating in place. */}
      <div
        key={current.code}
        // fade-rise at .34s on country change, per the motion table. The panel is the
        // answer; it should arrive rather than snap.
        className="rounded-[8px] border border-sl-line bg-sl-panel"
        style={{ animation: "fadeRise .34s cubic-bezier(.2,.7,.3,1) both" }}
      >
        {verified ? (
          <>
            <div className="flex flex-col gap-3 px-5 py-5">
              {current.listings!.map((l) => (
                <div key={l.broadcaster} className="flex items-center gap-3">
                  {/* Logo slot. Real artwork comes from the provider; until then the
                      slot is honest about being a placeholder rather than faking a mark. */}
                  <span
                    aria-hidden="true"
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-[5px] border border-sl-line bg-sl-surface font-mono text-[10px] text-sl-mute"
                  >
                    {l.broadcaster.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-sl-text">
                      {l.broadcaster}
                    </p>
                    {l.streamingOn && (
                      <p className="truncate text-[13px] text-sl-mute">{l.streamingOn}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-sl-hair px-5 py-3.5">
              {/* Verified is a mono date and nothing else -- no tick, no colour.
                  Design opinion 3. */}
              <p className="text-[13px] leading-[1.55] text-sl-mute">
                These are channel listings, not links to video. Sightline plays nothing.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-5">
              <div className="mb-3 flex items-start gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-sl-mute" aria-hidden="true" />
                <p className="text-[15px] font-medium text-sl-text">
                  We have not verified a broadcaster in {current.name}.
                </p>
              </div>
              <div className="flex flex-col gap-3 pl-[26px]">
                <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mid">
                  Our broadcast rights are checked by hand, one country at a time. So far
                  that is {verifiedSummary} — and {current.name} is not one of them yet.
                  Rather than guess or scrape, we are showing you nothing.
                </p>
                <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mid">
                  The match is still on. We just cannot tell you the channel here.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-sl-hair px-5 py-4">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center rounded-[6px] bg-sl-amber px-4 text-[13px] font-semibold text-sl-ground transition-colors duration-[.16s] hover:bg-sl-amber-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 sm:min-h-0 sm:py-2.5"
              >
                Tell us who carries it in {current.name}
              </Link>
              <Link
                href="/faq"
                className="inline-flex min-h-[44px] items-center rounded-[6px] border border-sl-chip-border px-4 text-[13px] text-sl-mid transition-colors duration-[.16s] hover:border-sl-outline hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 sm:min-h-0 sm:py-2.5"
              >
                What &ldquo;verified&rdquo; means
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
