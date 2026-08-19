"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The hero search block — design/sightline/HANDOFF.md §1.2.
 *
 * This is the product's primary control. The previous homepage led with a headline that
 * listed inventory and put search in a small header box, which inverted the interaction
 * model: the job here is lookup, so the verb belongs above the fold.
 *
 * Scope is carried in the query string rather than component state alone, so a scoped
 * search is a shareable, linkable, crawlable URL.
 */

const SCOPES = ["Everything", "Sport", "Film & TV"] as const
export type Scope = (typeof SCOPES)[number]

/** Deliberately mixes verticals — the fastest way to show the site covers both. */
const EXAMPLES = [
  "Premier League",
  "Dune: Part Two",
  "UFC",
  "Silo",
  "Formula 1",
] as const

export function HeroSearch({ countryText }: { countryText: string }) {
  const router = useRouter()
  const [scope, setScope] = useState<Scope>("Everything")
  const [q, setQ] = useState("")
  const [focused, setFocused] = useState(false)

  function submit(query: string) {
    const term = query.trim()
    if (!term) return
    const params = new URLSearchParams({ q: term })
    if (scope !== "Everything") params.set("scope", scope)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-[820px]">
      {/* Scope chips */}
      <div
        role="group"
        aria-label="Search scope"
        className="mb-3 flex gap-2 max-sm:grid max-sm:grid-cols-3"
      >
        {SCOPES.map((s) => {
          const selected = s === scope
          return (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              aria-pressed={selected}
              className={cn(
                "rounded-[5px] px-[15px] py-2 text-[13px] transition-colors duration-[.16s]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60",
                // 44px tap target on mobile, per the handoff.
                "max-sm:min-h-[44px]",
                selected
                  ? "border border-sl-line bg-sl-raise text-sl-text"
                  : "border border-transparent text-sl-mute hover:border-sl-outline hover:text-sl-text",
              )}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Search field + button */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(q)
        }}
        className="flex gap-2"
      >
        <div
          className={cn(
            "relative flex-1 rounded-[7px] border bg-sl-surface transition-[border-color,box-shadow] duration-[.16s]",
            focused ? "border-sl-amber" : "border-sl-chip-border",
          )}
          style={focused ? { boxShadow: "0 0 0 3px rgba(240,166,60,.13)" } : undefined}
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[19px] -translate-y-1/2 text-sl-mute"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type="search"
            enterKeyHint="search"
            aria-label={`Search a film, series, team or competition in ${countryText}`}
            placeholder="Search a film, series, team or competition"
            className="h-[52px] w-full bg-transparent pl-[52px] pr-4 text-[15px] text-sl-text caret-sl-amber outline-none placeholder:text-sl-mute lg:h-[62px]"
          />
        </div>

        <button
          type="submit"
          className="h-[52px] shrink-0 rounded-[7px] bg-sl-amber px-6 text-[15px] font-semibold text-sl-ground transition-[background-color,transform] duration-[.16s] hover:bg-sl-amber-hover active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 lg:h-[62px]"
        >
          Search
        </button>
      </form>

      {/* Try row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mute">
          Try
        </span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQ(example)
              submit(example)
            }}
            className="rounded-[20px] border border-sl-line px-3 py-1.5 text-[13px] text-sl-mid transition-[color,border-color,transform] duration-[.16s] hover:-translate-y-px hover:border-sl-outline hover:text-sl-text active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 max-sm:min-h-[44px]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
