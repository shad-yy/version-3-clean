import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Event artwork used as a backdrop.
 *
 * TheSportsDB returns `strThumb`, `strPoster` and `strBanner` **on the fixture itself**,
 * so this is artwork the app was already fetching and discarding. Not every fixture has
 * it — the big ones usually do, lower divisions usually do not.
 *
 * ## It is a backdrop, not a picture
 *
 * The artwork is broadcast promo material: busy, high-contrast, and often carrying a
 * rights holder's own branding. Shown at full strength it fights the text on top of it
 * and starts to look like the site is advertising the match. Held at low opacity under a
 * gradient it does what it is here for — giving a row or a card a sense of place without
 * asking to be read.
 *
 * The gradient is not decoration either: it guarantees the text contrast the design
 * audited for, whatever the underlying image happens to be. Without it, a pale promo shot
 * silently drops body copy below 4.5:1.
 */

export function EventBackdrop({
  src,
  /** How strongly the artwork reads. `row` is near-subliminal; `hero` is a feature. */
  intensity = "row",
  className,
  priority = false,
}: {
  src?: string | null
  intensity?: "row" | "hero" | "live"
  className?: string
  priority?: boolean
}) {
  if (!src) return null

  /*
   * Three strengths, and the gap between them is deliberate.
   *
   * `row` is 0.05 — texture only, because a busy broadcast still at any higher value
   * fights the fixture text sitting on it.
   *
   * `live` is 0.3, six times stronger, and applies to live rows only. The handoff is
   * explicit that this is a deliberate lift from the row value: it is what makes a live
   * fixture read as live at a glance, rather than needing the reader to find the dot.
   */
  const opacity = intensity === "hero" ? 0.15 : intensity === "live" ? 0.3 : 0.05

  return (
    <span
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        // Genuinely full-bleed, so the browser does need the size hints here — unlike the
        // fixed-slot thumbnails, where `fill` was the wrong tool.
        sizes={intensity === "hero" ? "100vw" : "(max-width: 768px) 100vw, 720px"}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        className="object-cover"
        style={{ opacity }}
      />
      {/* Contrast floor for whatever sits on top. */}
      <span
        className={cn(
          "absolute inset-0",
          intensity === "hero"
            ? "bg-gradient-to-b from-sl-ground/80 via-sl-ground/95 to-sl-ground"
            // A flat scrim across the whole row, not a left-to-right fade. The fade left
            // the right-hand third at 70% ground, which is where the broadcaster column
            // and the chevron sit -- the two places the row most needs to stay readable.
            : intensity === "live"
              // Masked from 62% rather than a flat scrim: the still stays visible on the
              // right where there is no text, and disappears under the team names.
              ? "bg-gradient-to-l from-transparent via-sl-ground/70 to-sl-ground"
              : "bg-sl-ground/85",
        )}
      />
    </span>
  )
}
