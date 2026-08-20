import Image from "next/image"
import { getTrendingTitles, isTmdbConfigured, tmdbImage } from "@/lib/api/tmdb"

/**
 * Poster wall behind the hero.
 *
 * ## Why this exists
 *
 * Every image on the homepage sat **3,301 pixels down the page** — the first screen and a
 * half was hero and ledger, both pure text. The artwork was all real and all working, and
 * a visitor landing on the site saw none of it, which reads as "this site has no images".
 *
 * The fix is not more images. It is images *where people look*.
 *
 * ## The restraint
 *
 * This is a **backdrop, not a gallery**. The hero's job is the question and the search
 * field; if the wall competes with either, it has failed. So:
 *
 *  - Posters are heavily dimmed and sit behind a scrim that is near-opaque on the left,
 *    where the headline and search box live, and thins toward the right.
 *  - The grid is clipped and offset so no poster reads as a clickable item — it is
 *    texture, not content, and nothing here is interactive.
 *  - It renders nothing at all when TMDB is unconfigured or returns too few titles. A
 *    half-populated wall looks broken in a way an absent one does not.
 *
 * The posters are the same `getTrendingTitles` call the rail below already makes, so this
 * costs no extra request — the response is cached and shared.
 */

const MIN_POSTERS = 8
const POSTER_W = 150
const POSTER_H = 225

export async function HeroBackdrop() {
  if (!isTmdbConfigured()) return null

  const titles = await getTrendingTitles(18)
  const posters = titles
    .map((t) => tmdbImage(t.posterPath, "w342"))
    .filter((p): p is string => Boolean(p))

  if (posters.length < MIN_POSTERS) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/*
        Two offset rows, rotated slightly and pushed off the right edge. The rotation stops
        it reading as a product grid, which is what makes it recede into texture.
      */}
      <div
        className="absolute -right-24 top-1/2 flex -translate-y-1/2 gap-3 opacity-[.13]"
        style={{ transform: "translateY(-50%) rotate(-8deg)", width: "148%" }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {posters.slice(0, 9).map((src, i) => (
              <span
                key={`${src}-${i}`}
                className="relative block shrink-0 overflow-hidden rounded-[6px]"
                style={{ width: POSTER_W, height: POSTER_H }}
              >
                <Image
                  src={src}
                  alt=""
                  width={POSTER_W}
                  height={POSTER_H}
                  /*
                   * Eager, not lazy. The wall is rotated and pushed past the right edge,
                   * so the browser computes these as out of view and never requests them
                   * — every poster rendered with an empty src. They are above the fold by
                   * definition, so there is nothing for lazy loading to save.
                   */
                  loading="eager"
                  className="size-full object-cover"
                />
              </span>
            ))}
          </div>
          <div className="flex gap-3 pl-16">
            {posters.slice(9, 18).map((src, i) => (
              <span
                key={`${src}-${i}`}
                className="relative block shrink-0 overflow-hidden rounded-[6px]"
                style={{ width: POSTER_W, height: POSTER_H }}
              >
                <Image
                  src={src}
                  alt=""
                  width={POSTER_W}
                  height={POSTER_H}
                  loading="eager"
                  className="size-full object-cover"
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/*
        Contrast floor. Near-solid on the left where the headline and search sit, thinning
        rightward so the wall is visible without ever being read as content.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-sl-ground via-sl-ground/94 to-sl-ground/62" />
      <div className="absolute inset-0 bg-gradient-to-t from-sl-ground via-transparent to-sl-ground/70" />
    </div>
  )
}
