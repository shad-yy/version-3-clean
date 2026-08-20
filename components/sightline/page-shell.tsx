import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Shared Sightline page furniture.
 *
 * The handoff designs five screens in detail; the rest of the site has to look like it
 * belongs to the same product without inventing a new layout per route. These primitives
 * are the parts every one of those screens has in common — a mono eyebrow, a tight
 * headline, a row list, and an empty state that is an answer rather than an apology.
 *
 * Keeping them here rather than repeating the markup means a change to the pattern
 * reaches every page at once, which is the enforcement rule in DESIGN-SYSTEM.md §7.
 */

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-sl-ground pt-[62px]">{children}</main>
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  aside,
}: {
  eyebrow: string
  title: string
  intro?: string
  /** Optional right-hand slot — a count, a filter, a link. */
  aside?: React.ReactNode
}) {
  return (
    <div className="border-b border-sl-line px-[18px] py-10 lg:px-20 lg:py-[46px]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mute">
            {eyebrow}
          </p>
          <h1 className="max-w-[900px] text-[35px] font-semibold leading-[1.06] tracking-[-0.034em] text-sl-text lg:text-[44px] lg:leading-[1.03] lg:tracking-[-0.035em]">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 max-w-[620px] text-[15px] leading-[1.55] text-sl-mid lg:text-[17px]">
              {intro}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </div>
  )
}

export function Section({
  title,
  aside,
  children,
  className,
}: {
  title?: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("px-[18px] py-10 lg:px-20", className)}>
      <div className="mx-auto max-w-[1280px]">
        {(title || aside) && (
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            {title && (
              <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
                {title}
              </h2>
            )}
            {aside}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

/** A bordered list. Rows sit inside it and share its hairlines. */
export function RowList({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-sl-line">{children}</div>
  )
}

/**
 * One row.
 *
 * `accent` follows the colour law: amber for live and sport, blue for film and
 * television, and nothing at all otherwise. Never used decoratively.
 */
export function Row({
  href,
  lead,
  leadSub,
  thumb,
  title,
  meta,
  right,
  rightNote,
  accent = "none",
}: {
  href?: string
  lead?: React.ReactNode
  leadSub?: string
  /**
   * Artwork for the row — a `PosterThumb` for a film or series.
   *
   * Sits before the lead column rather than replacing it: the lead carries the year and
   * the type, which stay useful when a title has no artwork, and a row that silently
   * changes shape depending on whether a poster exists reads as broken.
   */
  thumb?: React.ReactNode
  title: string
  meta?: string
  right?: string
  rightNote?: string
  accent?: "sport" | "film-tv" | "none"
}) {
  const border =
    accent === "sport"
      ? "var(--sl-amber)"
      : accent === "film-tv"
        ? "var(--sl-blue)"
        : "transparent"

  const leadColour =
    accent === "sport" ? "text-sl-amber" : accent === "film-tv" ? "text-sl-blue" : "text-sl-mute"

  const inner = (
    <>
      {thumb}
      {(lead || leadSub) && (
        <div className="w-[76px] shrink-0 sm:w-[104px]">
          {lead && (
            <p className={cn("font-mono text-[12px] tracking-[.06em]", leadColour)}>{lead}</p>
          )}
          {leadSub && (
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[.12em] text-sl-mute">
              {leadSub}
            </p>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-sl-text">{title}</p>
        {meta && <p className="mt-0.5 truncate text-[13px] text-sl-mute">{meta}</p>}
      </div>

      {(right || rightNote) && (
        <div className="hidden w-[220px] shrink-0 text-right sm:block">
          {right && <p className="truncate text-[13px] text-sl-mid">{right}</p>}
          {rightNote && (
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
              {rightNote}
            </p>
          )}
        </div>
      )}

      {href && (
        <ChevronRight
          className="size-4 shrink-0 text-sl-dim transition-colors duration-[.16s] group-hover:text-sl-mid"
          aria-hidden="true"
        />
      )}
    </>
  )

  const classes = cn(
    "group flex items-center gap-4 border-b border-sl-hair px-4 py-4 last:border-b-0",
    "transition-colors duration-[.16s]",
    href && "hover:bg-sl-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60",
  )

  if (!href) {
    return (
      <div className={classes} style={{ borderLeft: `2px solid ${border}` }}>
        {inner}
      </div>
    )
  }

  return (
    <Link href={href} className={classes} style={{ borderLeft: `2px solid ${border}` }}>
      {inner}
    </Link>
  )
}

/**
 * The empty state.
 *
 * Same panel geometry as a populated result, per design opinion 2 — a gap is an answer,
 * not an error, and must not look like one. No illustration, no apology, no warning
 * colour: just what we do not have and why.
 */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
      <h2 className="mb-2 text-[17px] font-semibold text-sl-text">{title}</h2>
      <div className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">{children}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Skeleton row with the same geometry as a real one, so nothing jumps on resolve. */
export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <RowList>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-sl-hair px-4 py-4 last:border-b-0"
          style={{ borderLeft: "2px solid var(--sl-hair)" }}
        >
          <div className="w-[76px] shrink-0 sm:w-[104px]">
            <div
              className="h-3 w-12 animate-pulse rounded bg-sl-raise"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="h-4 w-2/3 animate-pulse rounded bg-sl-raise"
              style={{ animationDelay: `${i * 90}ms` }}
            />
            <div
              className="mt-2 h-3 w-1/3 animate-pulse rounded bg-sl-raise"
              style={{ animationDelay: `${i * 90 + 45}ms` }}
            />
          </div>
        </div>
      ))}
    </RowList>
  )
}
