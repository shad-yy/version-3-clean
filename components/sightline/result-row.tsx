import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PosterThumb } from "@/components/sightline/poster-thumb"
import { TeamBadge } from "@/components/sightline/team-badge"

/**
 * One search result — design/sightline/HANDOFF.md §3.
 *
 * **No type badge** (design opinion 1). What kind of thing a row is comes from two
 * quieter signals working together: the 2px left accent (amber for sport, blue for film
 * and TV, mute for a reference page) and the lead column (a kick-off time for a fixture,
 * a year for a title, nothing for a reference page).
 *
 * That is a deliberate rejection of the obvious alternative. A badge on every row adds a
 * column of noise that repeats what the row's own shape already says, and it makes a
 * mixed list read as two lists awkwardly interleaved rather than one answer.
 */

export type ResultKind = "sport" | "film-tv" | "reference"

export interface ResultRowData {
  href: string
  kind: ResultKind
  /** Kick-off time for a fixture, year for a title, empty for a reference page. */
  lead: string
  /** Uppercase mono sub-label under the lead, e.g. a competition or "FILM". */
  leadSub: string
  title: string
  meta: string
  /** Right column: the service or broadcaster, where we know one. */
  right?: string
  /** Mono provenance under the right column, e.g. a verification date. */
  rightNote?: string
  /**
   * TMDB poster path for a film or series result.
   *
   * Optional because sport results have no equivalent artwork — a fixture is not a thing
   * with a cover. Rows without it keep the same geometry rather than reflowing, so a
   * mixed list of sport and film does not look ragged.
   */
  posterPath?: string | null
  /**
   * Team crests for a fixture result. Two, because a fixture is a pairing — a single
   * crest would misrepresent which side the row is about.
   */
  homeLogo?: string | null
  awayLogo?: string | null
  homeTeam?: string
  awayTeam?: string
}

const ACCENT: Record<ResultKind, string> = {
  sport: "var(--sl-amber)",
  "film-tv": "var(--sl-blue)",
  reference: "var(--sl-mute)",
}

const LEAD_COLOUR: Record<ResultKind, string> = {
  sport: "text-sl-amber",
  "film-tv": "text-sl-blue",
  reference: "text-sl-mute",
}

export function ResultRow({ row }: { row: ResultRowData }) {
  return (
    <Link
      href={row.href}
      className="group flex items-center gap-4 border-b border-sl-hair px-4 py-4 transition-colors duration-[.16s] last:border-b-0 hover:bg-sl-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
      style={{ borderLeft: `2px solid ${ACCENT[row.kind]}` }}
    >
      {/* Lead column: carries the type, so no badge is needed. */}
      {row.posterPath !== undefined && <PosterThumb path={row.posterPath} />}
      {row.homeTeam && row.awayTeam && (
        <span className="flex shrink-0 items-center -space-x-1.5">
          <TeamBadge src={row.homeLogo} team={row.homeTeam} size="md" />
          <TeamBadge src={row.awayLogo} team={row.awayTeam} size="md" />
        </span>
      )}

      <div className="w-[80px] shrink-0 sm:w-[104px]">
        {row.lead && (
          <p className={cn("font-mono text-[12px] tracking-[.06em]", LEAD_COLOUR[row.kind])}>
            {row.lead}
          </p>
        )}
        {row.leadSub && (
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[.12em] text-sl-mute">
            {row.leadSub}
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-sl-text sm:text-[17px]">
          {row.title}
        </p>
        {row.meta && <p className="mt-0.5 truncate text-[13px] text-sl-mute">{row.meta}</p>}
      </div>

      {(row.right || row.rightNote) && (
        <div className="hidden w-[280px] shrink-0 text-right lg:block">
          {row.right && <p className="truncate text-[13px] text-sl-mid">{row.right}</p>}
          {row.rightNote && (
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
              {row.rightNote}
            </p>
          )}
        </div>
      )}

      <ChevronRight
        className="size-4 shrink-0 text-sl-dim transition-colors duration-[.16s] group-hover:text-sl-mid"
        aria-hidden="true"
      />
    </Link>
  )
}

/**
 * Results skeleton.
 *
 * Row geometry is identical to a real row, per the handoff — a skeleton whose shape
 * differs from the content it stands in for makes the page jump when it resolves.
 */
export function ResultsSkeleton({ countryText }: { countryText: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-sl-amber" aria-hidden="true" />
        <p className="font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
          Checking rights for {countryText}…
        </p>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-sl-line">
        {[0, 90, 180, 270, 360].map((delay) => (
          <div
            key={delay}
            className="flex items-center gap-4 border-b border-sl-hair px-4 py-4 last:border-b-0"
            style={{ borderLeft: "2px solid var(--sl-hair)" }}
          >
            <div className="w-[80px] shrink-0 sm:w-[104px]">
              <div
                className="h-3 w-12 animate-pulse rounded bg-sl-raise"
                style={{ animationDelay: `${delay}ms` }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="h-4 w-2/3 animate-pulse rounded bg-sl-raise"
                style={{ animationDelay: `${delay}ms` }}
              />
              <div
                className="mt-2 h-3 w-1/3 animate-pulse rounded bg-sl-raise"
                style={{ animationDelay: `${delay + 45}ms` }}
              />
            </div>
            <div className="hidden w-[280px] shrink-0 lg:block">
              <div
                className="ml-auto h-3 w-24 animate-pulse rounded bg-sl-raise"
                style={{ animationDelay: `${delay}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
