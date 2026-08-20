import Image from "next/image"
import Link from "next/link"
import {
  buildTitleSlug,
  getTrendingTitles,
  isTmdbConfigured,
  tmdbImage,
} from "@/lib/api/tmdb"
import { RailScroller } from "@/components/sightline/rail-scroller"

/**
 * Film and television rail on the homepage.
 *
 * **This rail is ordered by popularity, and says so.** Design opinion 6 reserves
 * *verification freshness* as the site's ordering principle and forbids ranking discovery
 * by popularity — the discovery dock obeys that and its footnote states it outright.
 *
 * The owner's call was to allow a popularity rail provided it is labelled as one, so the
 * two orderings sit side by side and are named: the dock says "Just checked", this says
 * "Trending on TMDB". The distinction has to survive skim-reading, which is why the source
 * is in the eyebrow rather than in small print underneath — a reader who never reads the
 * caption still sees where the ordering came from.
 *
 * Posters are 136x202 per the handoff's slot. Titles with no artwork get a designed empty
 * slot rather than a broken image; TMDB genuinely lacks posters for some titles.
 */

const POSTER_W = 136
const POSTER_H = 202

export async function TrendingTitles({ limit = 14 }: { limit?: number }) {
  if (!isTmdbConfigured()) return null

  const titles = await getTrendingTitles(limit)
  if (titles.length === 0) return null

  return (
    <section className="border-b border-sl-line px-[18px] py-10 lg:px-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            {/* The ordering is named here, not buried in a footnote. */}
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-sl-blue">
              Trending on TMDB · ordered by popularity
            </p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
              Film &amp; television people are looking for
            </h2>
          </div>
          <Link
            href="/watch/title"
            className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute transition-colors duration-[.16s] hover:text-sl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60 rounded-[4px]"
          >
            Browse all
          </Link>
        </div>

        <RailScroller step={POSTER_W + 14} label="Trending films and series">
          {titles.map((title, i) => {
            const poster = tmdbImage(title.posterPath, "w342")
            return (
              <Link
                key={`${title.mediaType}-${title.tmdbId}`}
                href={`/watch/title/${buildTitleSlug(title.mediaType, title.tmdbId, title.name)}`}
                className="group shrink-0 snap-start rounded-[7px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
                style={{
                  width: POSTER_W,
                  // fade-rise, staggered 70ms per the handoff's motion table. The keyframe
                  // resolves to its final state under prefers-reduced-motion.
                  animation: `fadeRise .5s cubic-bezier(.2,.7,.3,1) ${i * 70}ms both`,
                }}
              >
                <div
                  className="relative overflow-hidden rounded-[6px] border border-sl-line bg-sl-surface"
                  style={{ width: POSTER_W, height: POSTER_H }}
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      // Explicit dimensions, not `fill`: `fill` emits a sixteen-entry
                      // srcset reaching 3840w for a 136px slot. This emits 1x and 2x.
                      width={POSTER_W}
                      height={POSTER_H}
                      // Below the fold on every viewport; never a priority image.
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-[.22s] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-center">
                      <span className="font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
                        No artwork
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.3] text-sl-text">
                  {title.name}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-sl-mute">
                  {title.mediaType === "movie" ? "Film" : "Series"}
                  {title.year ? ` · ${title.year}` : ""}
                </p>
              </Link>
            )
          })}
        </RailScroller>

        <p className="mt-4 max-w-[620px] text-[12px] leading-[1.5] text-sl-mute">
          Popularity is TMDB&apos;s, not ours, and it is not a judgement about where you can
          watch these. Open one to see the services carrying it in your country.
        </p>
      </div>
    </section>
  )
}
