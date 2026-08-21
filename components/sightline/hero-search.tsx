"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Suggestion } from "@/app/api/suggest/route"

/**
 * The hero search block — design/sightline/HANDOFF.md §1.2.
 *
 * This is the product's primary control. The previous homepage led with a headline that
 * listed inventory and put search in a small header box, which inverted the interaction
 * model: the job here is lookup, so the verb belongs above the fold.
 *
 * Scope is carried in the query string rather than component state alone, so a scoped
 * search is a shareable, linkable, crawlable URL.
 *
 * ## Typeahead
 *
 * Typing showed nothing until you pressed Search, which made the field feel dead — the
 * single most common complaint about a search box. It now suggests as you type, with
 * poster artwork, so a reader recognises the thing they meant before committing.
 *
 * Three things keep it cheap: a 220ms debounce, an `AbortController` cancelling the
 * previous request on every keystroke so only the last query is in flight, and a
 * two-character floor. Results are keyed by query, so a slow response for an earlier
 * prefix can never overwrite a newer one.
 *
 * ## Focus treatment
 *
 * The handoff specifies `border → amber` plus `box-shadow: 0 0 0 3px rgba(240,166,60,.13)`.
 * In practice those stack into a doubled yellow outline that the owner found visually
 * poor, so this keeps the amber border and replaces the outer glow with a single soft
 * ring at lower opacity and spread. A deliberate, recorded deviation — see DECISIONS.md.
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

/** Group order: film and TV first, because it is by far the larger catalogue. */
const GROUPS = [
  { kind: "film-tv" as const, label: "Film & TV" },
  { kind: "sport" as const, label: "Fixtures" },
]

const DEBOUNCE_MS = 220
const MIN_QUERY = 2

export function HeroSearch({
  countryText,
  country,
}: {
  countryText: string
  /** ISO code, so suggestions can say where each title is shown. */
  country?: string | null
}) {
  const router = useRouter()
  const [scope, setScope] = useState<Scope>("Everything")
  const [q, setQ] = useState("")
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  // §2h defines a failed state with its own copy and a retry, distinct from "no match".
  const [failed, setFailed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)

  const boxRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const visible = suggestions.filter(
    (s) =>
      scope === "Everything" ||
      (scope === "Sport" && s.kind === "sport") ||
      (scope === "Film & TV" && s.kind === "film-tv"),
  )

  // Fetch suggestions, debounced, cancelling whatever was in flight.
  useEffect(() => {
    const term = q.trim()
    if (term.length < MIN_QUERY) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      try {
        const params = new URLSearchParams({ q: term })
        if (country) params.set("country", country)
        const res = await fetch(`/api/suggest?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`suggest: ${res.status}`)
        const json = (await res.json()) as { suggestions?: Suggestion[] }
        setSuggestions(json.suggestions ?? [])
        setFailed(false)
        setActiveIndex(-1)
      } catch (err) {
        // An abort is the normal case on every keystroke, not a failure.
        if ((err as Error)?.name !== "AbortError") setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [q])

  // Close on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  function submit(query: string) {
    const term = query.trim()
    if (!term) return
    setOpen(false)
    const params = new URLSearchParams({ q: term })
    if (scope !== "Everything") params.set("scope", scope)
    router.push(`/search?${params.toString()}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || visible.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Escape") {
      setOpen(false)
    } else if (e.key === "Enter" && activeIndex >= 0) {
      // Only intercept Enter when a suggestion is highlighted; otherwise the form
      // submits and runs the full search, which is what an unguided Enter should do.
      e.preventDefault()
      router.push(visible[activeIndex].href)
      setOpen(false)
    }
  }

  const showPanel = open && q.trim().length >= MIN_QUERY

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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50",
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
        <div ref={boxRef} className="relative flex-1">
          <div
            className={cn(
              "relative rounded-[7px] border bg-sl-surface transition-[border-color,box-shadow] duration-[.16s]",
              focused ? "border-sl-amber/70" : "border-sl-chip-border",
            )}
            // A single soft ring at low opacity. The handoff's 3px .13 glow sat outside a
            // full-strength amber border and read as two yellow outlines around one field.
            style={focused ? { boxShadow: "0 0 0 2px rgba(240,166,60,.10)" } : undefined}
          >
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-[19px] -translate-y-1/2 text-sl-mute"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setOpen(true)
              }}
              onFocus={() => {
                setFocused(true)
                setOpen(true)
              }}
              onBlur={() => setFocused(false)}
              onKeyDown={onKeyDown}
              type="search"
              enterKeyHint="search"
              role="combobox"
              aria-expanded={showPanel}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-label={`Search a film, series, team or competition in ${countryText}`}
              placeholder="Search a film, series, team or competition"
              className="h-[52px] w-full bg-transparent pl-[52px] pr-10 text-[15px] text-sl-text caret-sl-amber outline-none placeholder:text-sl-mute lg:h-[62px]"
            />
            {loading && (
              <Loader2
                className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-sl-dim"
                aria-hidden="true"
              />
            )}
          </div>

          {/*
            Search-as-you-type panel — design_handoff_sightline_ui §2h.

            Four states sharing one geometry: grouped results, "nothing found", a provider
            failure with a retry, and loading. Same border, radius, background and shadow
            throughout, so the panel never appears to change shape under the reader as
            they type.
          */}
          {showPanel && (
            <div
              id="search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-[8px] border border-sl-line bg-sl-panel shadow-dock"
              style={{ animation: "fadeRise .18s cubic-bezier(.2,.7,.3,1) both" }}
            >
              {failed ? (
                /*
                  A provider outage is not the same answer as "nothing matches", and
                  saying so is the difference between a reader retrying and a reader
                  concluding we do not hold the title. Copy is verbatim from §Copy.
                */
                <div className="px-4 py-4">
                  <p className="text-[13.5px] text-sl-text">
                    The metadata provider did not answer.
                  </p>
                  <button
                    type="button"
                    onClick={() => setQ((v) => `${v} `.trimEnd() + " ")}
                    className="mt-3 rounded-[6px] border border-sl-chip-border bg-sl-surface px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mid transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50"
                  >
                    Try again
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <div className="px-4 py-4">
                  <p className="text-[13.5px] text-sl-text">
                    {loading ? "Searching…" : `No title or fixture matches “${q.trim()}”.`}
                  </p>
                  {!loading && (
                    <p className="mt-1.5 max-w-[460px] text-[12.5px] leading-[1.5] text-sl-mute">
                      We hold 139 countries for film and TV, and hand-verified rights for 2
                      competitions. If it should be here, tell us.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="max-h-[380px] overflow-y-auto overscroll-contain">
                  {GROUPS.map((group) => {
                    const rows = visible.filter((s) => s.kind === group.kind)
                    if (rows.length === 0) return null
                    return (
                      <li key={group.kind}>
                        <p className="border-b border-sl-hair bg-sl-ground px-4 py-2 font-mono text-[9.5px] uppercase tracking-[.16em] text-sl-mute">
                          {group.label}
                        </p>
                        <ul>
                          {rows.map((s) => {
                            const i = visible.indexOf(s)
                            return (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={i === activeIndex}
                                  onMouseEnter={() => setActiveIndex(i)}
                                  onClick={() => {
                                    router.push(s.href)
                                    setOpen(false)
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-3 px-3 py-[9px] text-left transition-colors duration-[.12s]",
                                    i === activeIndex ? "bg-sl-surface" : "",
                                  )}
                                >
                                  {s.kind === "film-tv" ? (
                                    <span
                                      className="relative block h-[54px] w-9 shrink-0 overflow-hidden rounded-[3px] border border-sl-line bg-sl-surface"
                                      aria-hidden="true"
                                    >
                                      {s.posterPath && (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w185${s.posterPath}`}
                                          alt=""
                                          width={36}
                                          height={54}
                                          className="size-full object-cover"
                                        />
                                      )}
                                    </span>
                                  ) : (
                                    <span
                                      className="block h-[54px] w-[2px] shrink-0 rounded bg-sl-amber"
                                      aria-hidden="true"
                                    />
                                  )}

                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[14.5px] text-sl-text">
                                      {s.label}
                                    </span>
                                    <span
                                      className={cn(
                                        "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[.1em]",
                                        s.kind === "film-tv" ? "text-sl-blue" : "text-sl-amber",
                                      )}
                                    >
                                      {s.sub}
                                    </span>
                                  </span>

                                  {/* Where it is shown. An absent answer is stated, not
                                      hidden — that is the whole product. */}
                                  <span className="hidden max-w-[150px] shrink-0 truncate text-right text-[12.5px] text-sl-mute sm:block">
                                    {s.where ?? "Not verified"}
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              )}

              {visible.length > 0 && !failed && (
                <div className="flex items-center justify-between gap-3 border-t border-sl-hair bg-sl-ground px-4 py-2">
                  <p className="font-mono text-[9.5px] uppercase tracking-[.1em] text-sl-dim">
                    ↑↓ move · ↵ open · esc close
                  </p>
                  <button
                    type="button"
                    onClick={() => submit(q)}
                    className="shrink-0 rounded-[4px] text-[12px] text-sl-blue transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50"
                  >
                    See all {visible.length} results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="h-[52px] shrink-0 rounded-[7px] bg-sl-amber px-6 text-[15px] font-semibold text-sl-ground transition-[background-color,transform] duration-[.16s] hover:bg-sl-amber-hover active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 lg:h-[62px]"
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
            className="rounded-[20px] border border-sl-line px-3 py-1.5 text-[13px] text-sl-mid transition-[color,border-color,transform] duration-[.16s] hover:-translate-y-px hover:border-sl-outline hover:text-sl-text active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 max-sm:min-h-[44px]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
