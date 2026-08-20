import Image from "next/image"

/**
 * Team crest, for fixture and result rows.
 *
 * TheSportsDB returns `strHomeTeamBadge` and `strAwayTeamBadge` **on the fixture itself**,
 * so a crest costs no extra request — the artwork was already in a response the app was
 * discarding. Fixtures are the most text-dense surface on the site and were rendering as
 * "Arsenal v Coventry City" in plain text while both crests sat unread in the same payload.
 *
 * ## Why these are remote where competition crests are local
 *
 * `CompetitionBadge` serves ten files from `public/` because there are ten competitions
 * and they change once a decade. Teams are a different problem: a football league alone has
 * hundreds, promotion and relegation churn them every season, and badges get redesigned.
 * Vendoring that is a maintenance burden with no end, so these come from the provider CDN —
 * already whitelisted in `next.config.mjs`, and cached by Next for 30 days
 * (`minimumCacheTTL`) once optimised.
 *
 * Falls back to a lettermark of the club's initial rather than a broken image or a blank
 * gap: a fixture list where some rows have a crest and others have nothing reads as a
 * failed load, where a consistent placeholder reads as a design.
 */

const SIZES = {
  sm: 18,
  md: 24,
  lg: 32,
} as const

export type TeamBadgeSize = keyof typeof SIZES

export function TeamBadge({
  src,
  team,
  size = "md",
}: {
  /** `strHomeTeamBadge` / `strAwayTeamBadge`, which are frequently absent. */
  src?: string | null
  /** Club name — used for the fallback lettermark only. */
  team: string
  size?: TeamBadgeSize
}) {
  const px = SIZES[size]

  if (!src) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-[4px] border border-sl-line bg-sl-surface font-mono text-sl-mute"
        style={{ width: px, height: px, fontSize: Math.round(px * 0.44) }}
        aria-hidden="true"
      >
        {team.trim().charAt(0).toUpperCase() || "?"}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      loading="lazy"
      // `contain`: crests are rarely square, and cropping one mangles it.
      className="shrink-0 object-contain"
      style={{ width: px, height: px }}
      aria-hidden="true"
    />
  )
}
