import Image from "next/image"
import { getTrendingTitles, isTmdbConfigured, tmdbImage } from "@/lib/api/tmdb"

/**
 * Hero backdrop — design_handoff_sightline_ui/README.md §3a.
 *
 * A single Ken Burns still occupying the right 54% of the hero, under two scrims and a
 * drifting grid pattern. Replaces an earlier poster wall: a wall of eighteen posters read
 * as a product grid behind the headline, where one slowly moving still reads as a
 * backdrop and lets the type stay the subject.
 *
 * Geometry is from the spec, not invented:
 *
 *  - Still at `inset: 0 0 0 46%`
 *  - Scrim 1 runs left-to-right, solid `ground` to 34%, easing out to .62 at the far edge
 *  - Scrim 2 runs bottom-to-top so the still never collides with the search block
 *  - Grid is 40×40px `hair` lines at .5 opacity, radially masked and drifting
 *
 * All three layers are `pointer-events: none`. The still is decorative: it illustrates
 * that the site covers film and television, and carries no information the copy does not.
 *
 * Renders nothing when TMDB is unconfigured or has no artwork — the hero is designed to
 * stand on its type alone, so an absent backdrop costs nothing.
 */
export async function HeroBackdrop() {
  if (!isTmdbConfigured()) return null

  const titles = await getTrendingTitles(8)
  // Backdrops are wider than posters and sit better behind a headline, but TMDB lacks
  // them more often, so a poster is the fallback rather than nothing.
  const source = titles.find((t) => t.backdropPath) ?? titles.find((t) => t.posterPath)
  const src = source
    ? tmdbImage(source.backdropPath ?? source.posterPath, "w780")
    : null
  if (!src) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* The still. Right 54% of the hero. */}
      <div className="absolute inset-y-0 right-0 left-[46%] overflow-hidden">
        <Image
          src={src}
          alt=""
          fill
          sizes="60vw"
          // Above the fold and the only decorative image in the hero, so it is fetched
          // immediately rather than waiting on an intersection it will never miss.
          priority
          className="sl-ken-burns object-cover"
        />
      </div>

      {/* Scrim 1 — horizontal. Keeps the headline column solid. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--sl-ground) 0%, var(--sl-ground) 34%, rgba(11,13,17,.86) 54%, rgba(11,13,17,.5) 78%, rgba(11,13,17,.62) 100%)",
        }}
      />

      {/* Scrim 2 — vertical. Lands the still into the page rather than cutting it off. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, var(--sl-ground) 0%, transparent 40%)" }}
      />

      {/* Drifting grid. Texture only — it is what stops the left column reading as flat. */}
      <div
        className="sl-drift absolute"
        style={{
          inset: "-80px",
          opacity: 0.5,
          backgroundImage:
            "linear-gradient(to right, var(--sl-hair) 1px, transparent 1px), linear-gradient(to bottom, var(--sl-hair) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 12% 30%, #000 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 12% 30%, #000 0%, transparent 62%)",
        }}
      />
    </div>
  )
}
