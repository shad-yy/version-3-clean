import Image from "next/image"
import { LEAGUES } from "@/lib/constants/leagues"

/**
 * Competition crest.
 *
 * Sport had no imagery anywhere while film and television had posters, which made half
 * the site look like a spreadsheet and the other half like a product. A crest is also the
 * fastest possible identifier — people recognise a league badge long before they finish
 * reading its name, which is the whole argument for using it.
 *
 * ## Local files, not the provider's CDN
 *
 * `LEAGUES` carries both a `badgeUrl` on TheSportsDB's CDN and a `localBadge` in
 * `public/`. This uses the local one, and the difference is not small:
 *
 *  - **No third-party request.** A crest on every competition row would otherwise mean
 *    a DNS lookup, TLS handshake and round trip to another origin before the page settles.
 *  - **No rate-limit exposure.** Images do not count against the API budget, but they do
 *    come from the same provider, and there is no reason to depend on it for a file that
 *    changes once a decade.
 *  - **Served from our own cache headers**, immutable, alongside the rest of the build.
 *
 * The remote URL stays in the data as the source of record and as the thing to re-download
 * from when a competition rebrands.
 *
 * Falls back to a lettermark rather than a broken image or a generic placeholder: a
 * competition we hold no crest for still needs to occupy the same space, or every list it
 * appears in reflows around it.
 */

const SIZES = {
  sm: 20,
  md: 28,
  lg: 44,
} as const

export type BadgeSize = keyof typeof SIZES

/**
 * Crest files in `public/leagues/` that no `LEAGUES` entry points at.
 *
 * `LEAGUES` holds six football competitions, but the badge folder also carries Formula 1,
 * UFC, the World Cup and the Europa League — all of which have routes and appear in the
 * competition index. Resolving through `LEAGUES` alone left those four showing lettermarks
 * next to six real crests, which looks like a loading failure rather than a design.
 *
 * Keyed by slug, which is what the route segment already is.
 */
const EXTRA_BADGES: Record<string, string> = {
  "formula-1": "/leagues/formula-1.png",
  ufc: "/leagues/ufc.png",
  "world-cup": "/leagues/world-cup.png",
  "world-cup-2026": "/leagues/world-cup.png",
  "europa-league": "/leagues/europa-league.png",
}

/** Resolve a crest from a competition id, slug or display name. */
function findLeague(key: string) {
  const needle = key.toLowerCase().trim()
  const direct = LEAGUES[needle]
  if (direct) return direct
  return (
    Object.values(LEAGUES).find(
      (l) =>
        l.slug === needle ||
        l.id === needle ||
        l.name.toLowerCase() === needle ||
        needle.includes(l.name.toLowerCase()),
    ) ?? null
  )
}

export function CompetitionBadge({
  competition,
  size = "md",
  priority = false,
}: {
  /** Competition id, slug or display name — whichever the caller has to hand. */
  competition: string
  size?: BadgeSize
  priority?: boolean
}) {
  const px = SIZES[size]
  const league = findLeague(competition)
  // Callers pass whatever they have: an id, a slug, or a path. Competitions with their
  // own top-level route (UFC) arrive as "/ufc" rather than a bare slug, so the leading
  // and trailing slashes come off before the lookup.
  const slug = competition.toLowerCase().trim().replace(/^\/+|\/+$/g, "")
  const badge = league?.localBadge ?? EXTRA_BADGES[slug] ?? null

  if (!badge) {
    // Lettermark placeholder. Same footprint, so lists keep their rhythm.
    const initial = (league?.name ?? competition).trim().charAt(0).toUpperCase() || "?"
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-[5px] border border-sl-line bg-sl-surface font-mono text-sl-mute"
        style={{ width: px, height: px, fontSize: Math.round(px * 0.42) }}
        aria-hidden="true"
      >
        {initial}
      </span>
    )
  }

  return (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <Image
        src={badge}
        alt=""
        width={px}
        height={px}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        // `contain`, not `cover`: crests are not square and cropping one is worse than
        // letterboxing it.
        className="size-full object-contain"
      />
    </span>
  )
}
