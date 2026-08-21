import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import {
  buildTitleSlug,
  getAvailableRegions,
  getTrendingTitles,
  isTmdbConfigured,
  type TitleDetails,
  getWatchProvidersForCountry,
  tmdbImage,
} from "@/lib/api/tmdb"

/**
 * Film & TV index.
 *
 * The target of the "Film & TV" header item. Before this existed the vertical was
 * reachable only from the middle of `/watch`, which meant that to a visitor it did not
 * exist at all.
 *
 * Country-aware in its copy because that is the product's whole axis, and the coverage
 * figure is read from the provider rather than hardcoded — the owner's instruction is
 * that coverage is whatever the APIs genuinely return, so it grows on its own.
 */

export const revalidate = 86400

export const metadata: Metadata = (() => {
  const url = `${ENV.BASE_URL}/watch/title`
  const title = "Film & TV — where to watch, country by country"
  const description =
    "Find which service carries a film or series in your country: free, ad-supported, subscription, rent or buy. Availability is listed per country, because rights are licensed per country."
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ title, description, url }),
  }
})()

/**
 * Browse card — design_handoff_sightline_ui/README.md §2b.
 *
 * Poster-forward: a 3/4 still filling the card's width, then a padded column carrying the
 * kind, the title, the services that actually hold it in the reader's country, and
 * nothing else.
 *
 * Replaces a card that put a 64px thumbnail beside a title inside a ~440px box and left
 * roughly 370px of it empty. That was not a design decision, it was artwork bolted onto a
 * layout built for text.
 *
 * **No "checked" line, unlike the spec.** §2b ends the card with a mono "Checked 14 Aug".
 * Film and television availability carries no verification date — TMDB does not supply
 * one, and this site never describes that vertical as verified, only as what the provider
 * currently lists. A date there would be the strongest claim on the card and the only
 * unfounded one.
 */
function TitleCard({
  title,
  services,
}: {
  title: TitleDetails
  /** Services holding it in the viewer's country. Empty is common and rendered as such. */
  services: string[]
}) {
  const poster = tmdbImage(title.posterPath, "w342")

  return (
    <Link
      href={`/watch/title/${buildTitleSlug(title.mediaType, title.tmdbId, title.name)}`}
      className="group flex flex-col overflow-hidden rounded-[7px] border border-sl-line bg-sl-surface transition-[transform,border-color] duration-[.16s] hover:-translate-y-0.5 hover:border-sl-outline active:scale-[.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
    >
      <span className="relative block aspect-[3/4] bg-sl-panel">
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
            No artwork
          </span>
        )}
      </span>

      <span className="flex flex-col gap-2 p-[14px]">
        {/* Blue is the film/TV accent. Type is carried by colour, never a badge. */}
        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-sl-blue">
          {title.mediaType === "movie" ? "Film" : "Series"}
          {title.year && (
            <>
              <span className="text-sl-dim"> · </span>
              <span className="text-sl-mute">{title.year}</span>
            </>
          )}
        </span>

        <span className="text-[16px] font-medium leading-[1.25] tracking-[-0.01em] text-sl-text">
          {title.name}
        </span>

        {services.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {services.slice(0, 3).map((name) => (
              <span
                key={name}
                className="rounded-[5px] border border-sl-line px-2 py-1 text-[11.5px] text-sl-mid"
              >
                {name}
              </span>
            ))}
            {services.length > 3 && (
              <span className="self-center font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
                +{services.length - 3}
              </span>
            )}
          </span>
        ) : (
          // Verbatim from §Copy. An absent offer is an answer, not a blank.
          <span className="font-mono text-[10px] uppercase tracking-[.1em] text-sl-dim">
            No offers recorded
          </span>
        )}
      </span>
    </Link>
  )
}

async function TitleGrid({ countryText }: { countryText: string }) {
  const country = getViewerCountry()
  const [titles, regions] = await Promise.all([getTrendingTitles(16), getAvailableRegions()])

  /*
   * Availability per title, in parallel.
   *
   * One watch-provider lookup each, which sounds expensive and is not: every response is
   * cached for six hours and shared, so a warm grid costs nothing and a cold one costs
   * sixteen requests once. Without this the cards can only name the title, and a card that
   * cannot say where to watch something is not doing this site's job.
   *
   * A failure yields no chips rather than failing the grid.
   */
  const withServices = await Promise.all(
    titles.map(async (t) => {
      if (!country) return { title: t, services: [] as string[] }
      try {
        const a = await getWatchProvidersForCountry(t.mediaType, t.tmdbId, country)
        const names = a
          ? [...a.free, ...a.ads, ...a.flatrate, ...a.rent, ...a.buy].map((p) => p.name)
          : []
        return { title: t, services: [...new Set(names)] }
      } catch {
        return { title: t, services: [] as string[] }
      }
    }),
  )

  if (!titles.length) {
    // An honest gap, in the same panel geometry as a populated result -- design opinion
    // 2: empty states are answers, not errors.
    return (
      <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
        <h2 className="mb-2 text-[17px] font-semibold text-sl-text">Nothing to show yet</h2>
        <p className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">
          We could not load titles just now. Nothing is wrong with your connection — we
          would rather show this than a list we cannot stand behind.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        {/*
          Not §2b's "Checked recently". Nothing on this grid has been checked by us --
          film and television availability is what the provider lists, and the site does
          not call that verified. The heading says what the list actually is.
        */}
        <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
          Trending now
        </h2>
        <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {regions.length} countries covered
        </p>
      </div>

      {/* 4 across at desktop, 14px gap, per §2b. */}
      <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
        {withServices.map(({ title, services }) => (
          <TitleCard
            key={`${title.mediaType}-${title.tmdbId}`}
            title={title}
            services={services}
          />
        ))}
      </div>

      <p className="mt-8 text-[13px] leading-[1.55] text-sl-mute">
        Availability differs by country because rights are licensed territory by territory.
        A service named here carries the title in {countryText} — {SITE_NAME} transmits no
        video and sells no subscription.
      </p>
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[86px] animate-pulse rounded-[7px] border border-sl-line bg-sl-surface"
        />
      ))}
    </div>
  )
}

export default function FilmAndTvIndexPage() {
  const country = getViewerCountry()
  const countryText = countryLabel(country)

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/watch/title#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Film & TV", item: `${ENV.BASE_URL}/watch/title` },
    ],
  }

  return (
    <main className="min-h-screen bg-sl-ground pt-[62px]">
      <SchemaMarkup schema={breadcrumb} />

      <div className="mx-auto max-w-[1280px] px-[18px] py-10 lg:px-10 lg:py-[46px]">
        <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-mute">
          Film &amp; television
        </p>
        <h1 className="mb-4 max-w-[820px] text-[35px] font-semibold leading-[1.06] tracking-[-0.034em] text-sl-text lg:text-[44px] lg:leading-[1.03] lg:tracking-[-0.035em]">
          Where can I watch it in {countryText}?
        </h1>
        <p className="mb-10 max-w-[620px] text-[15px] leading-[1.55] text-sl-mid lg:text-[17px]">
          Pick a film or series to see which services carry it where you are — free, with
          ads, on subscription, to rent or to buy.
        </p>

        {isTmdbConfigured() ? (
          <Suspense fallback={<GridSkeleton />}>
            <TitleGrid countryText={countryText} />
          </Suspense>
        ) : (
          <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
            <h2 className="mb-2 text-[17px] font-semibold text-sl-text">
              Availability data is not configured
            </h2>
            <p className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">
              This section needs a metadata provider key before it can answer anything.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
