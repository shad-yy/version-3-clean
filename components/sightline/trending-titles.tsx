import Image from "next/image"
import Link from "next/link"
import {
  buildTitleSlug,
  getTrendingTitles,
  isTmdbConfigured,
  tmdbImage,
} from "@/lib/api/tmdb"

/**
 * Poster rail — design_handoff_sightline_ui/README.md §3a.5.
 *
 * Six across, 2:3 posters, each with a caption block sitting over a gradient inside the
 * card rather than as text beneath it. Replaces a row of small posters with names below:
 * the card now carries the artwork edge to edge and the words sit on it, which is what
 * makes a grid of films look like films rather than a table with pictures.
 *
 * ## The heading is not the one the design asked for
 *
 * §3a.5 heads this "Checked in the last 24 hours". That claim cannot be made about film
 * and television: TMDB's watch-provider data carries **no verification date**, and the
 * site states plainly elsewhere that it never describes this vertical as verified — only
 * as what the provider currently lists. Borrowing the sport vertical's language here would
 * be exactly the kind of unearned certainty the whole product exists to avoid.
 *
 * So the design is implemented and the label tells the truth: this rail is ordered by
 * TMDB popularity, and says so on its face (design opinion 5).
 *
 * The caption block is `pointer-events: none` so the whole card stays one hit target.
 */

const MIN_TITLES = 6

export async function TrendingTitles({ limit = 12 }: { limit?: number }) {
  if (!isTmdbConfigured()) return null

  const titles = (await getTrendingTitles(limit)).filter((t) => t.posterPath)
  // A six-across grid with four cards in it reads as a failed load. Below the floor,
  // render nothing.
  if (titles.length < MIN_TITLES) return null

  return (
    <section className="px-[18px] pb-[46px] lg:px-[60px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            {/* The ordering names itself. Not a footnote — a reader who never reads the
                caption still sees where the order came from. */}
            <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-sl-blue">
              Trending on TMDB · ordered by popularity
            </p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
              Film &amp; television people are looking for
            </h2>
          </div>
          <Link
            href="/watch/title"
            className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/50 rounded-[4px]"
          >
            Browse all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {titles.map((title, i) => {
            const poster = tmdbImage(title.posterPath, "w342")
            return (
              <Link
                key={`${title.mediaType}-${title.tmdbId}`}
                href={`/watch/title/${buildTitleSlug(title.mediaType, title.tmdbId, title.name)}`}
                className="group relative block overflow-hidden rounded-[7px] transition-[transform,box-shadow] duration-[.22s] ease-[cubic-bezier(.2,.7,.3,1)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,.5),0_0_0_1px_var(--sl-outline)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                style={{
                  animation: `fadeRise .5s cubic-bezier(.2,.7,.3,1) ${i * 45}ms both`,
                }}
              >
                <span className="relative block aspect-[2/3] bg-sl-surface">
                  {poster && (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </span>

                {/*
                  Caption over the poster, not beneath it. pointer-events none so the card
                  is a single target rather than the caption stealing the hover.
                */}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-[11px] pb-[11px] pt-9"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(11,13,17,.97) 26%, transparent)",
                  }}
                >
                  <span className="font-mono text-[9.5px] uppercase tracking-[.1em] text-sl-blue">
                    {title.mediaType === "movie" ? "Film" : "Series"}
                    {title.year ? ` · ${title.year}` : ""}
                  </span>
                  <span className="line-clamp-2 text-[13.5px] font-medium leading-[1.25] text-sl-text">
                    {title.name}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>

        <p className="mt-5 max-w-[620px] text-[12px] leading-[1.5] text-sl-mute">
          Popularity is TMDB&apos;s, not ours, and it is not a judgement about where you can
          watch these. Open one to see the services carrying it in your country.
        </p>
      </div>
    </section>
  )
}
