import Image from "next/image"
import { tmdbImage } from "@/lib/api/tmdb"

/**
 * Small poster, for use anywhere a film or series is named in a list.
 *
 * ## Why the sizes are what they are
 *
 * TMDB serves fixed rendition widths. `w185` is the smallest that still looks sharp in a
 * 46px-wide slot on a 3x phone screen (46 x 3 = 138), and it is roughly a fifth the weight
 * of the `w342` used for the homepage rail. Asking for `w342` everywhere would triple the
 * bytes on list pages for no visible gain, which is the difference between "as many images
 * as possible" and "as many images as the page can afford".
 *
 * ## Caching
 *
 * Three layers, and they are all already paid for:
 *
 *  1. **The poster path** arrives inside a TMDB API response, cached by `tmdbFetch` — six
 *     hours for availability, seven days for reference data.
 *  2. **The optimised image** is cached by Next for 30 days (`minimumCacheTTL`), keyed by
 *     source URL and width.
 *  3. **The source file** is immutable at TMDB: a poster path never changes content, so a
 *     long cache carries no staleness risk. When artwork is replaced the path changes.
 *
 * So a poster costs one upstream fetch ever, not one per render.
 *
 * Everything below the fold is lazy. `alt` is empty by design: these sit beside the title
 * as text, so a screen reader announcing the name twice would be noise, not help.
 *
 * Explicit `width`/`height` rather than `fill`: with `fill`, Next builds a srcset from
 * every configured device and image size — sixteen candidates up to 3840w for a slot 46px
 * wide. The browser still chooses correctly, but the markup carries fifteen URLs it will
 * never use, on every row of every list. Fixed dimensions emit 1x and 2x only.
 */

export type ThumbSize = "sm" | "md"

const DIMENSIONS: Record<ThumbSize, { w: number; h: number }> = {
  /** List rows. */
  sm: { w: 46, h: 69 },
  /** Cards and denser grids. */
  md: { w: 64, h: 96 },
}

export function PosterThumb({
  path,
  size = "sm",
  priority = false,
}: {
  /** TMDB-relative poster path, or null when the title has no artwork. */
  path: string | null
  size?: ThumbSize
  /** Only for artwork genuinely above the fold. Almost never true in a list. */
  priority?: boolean
}) {
  const { w, h } = DIMENSIONS[size]
  const src = tmdbImage(path, "w185")

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[4px] border border-sl-line bg-sl-surface"
      style={{ width: w, height: h }}
      aria-hidden="true"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={w}
          height={h}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          className="size-full object-cover"
        />
      ) : (
        // A designed blank, not a broken image. TMDB genuinely lacks artwork for plenty
        // of unreleased and minor titles, and the slot still has to hold its shape or the
        // list jitters as rows load.
        <div className="flex h-full items-center justify-center">
          <span className="font-mono text-[8px] uppercase tracking-[.08em] text-sl-dim">
            —
          </span>
        </div>
      )}
    </div>
  )
}
