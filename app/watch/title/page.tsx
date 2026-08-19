import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import {
  JUSTWATCH_ATTRIBUTION,
  buildTitleSlug,
  getAvailableRegions,
  getTrendingTitles,
  isTmdbConfigured,
  type TitleDetails,
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

function TitleCard({ title }: { title: TitleDetails }) {
  return (
    <Link
      href={`/watch/title/${buildTitleSlug(title.mediaType, title.tmdbId, title.name)}`}
      className="group flex flex-col rounded-[7px] border border-sl-line bg-sl-surface p-4 transition-colors duration-[.16s] hover:border-sl-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-amber/60"
    >
      {/* Blue is the film/TV accent. Amber would be wrong here -- it means live sport. */}
      <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-blue">
        {title.mediaType === "movie" ? "Film" : "Series"}
        {title.year ? ` · ${title.year}` : ""}
      </p>
      <h3 className="text-[15px] font-medium leading-tight text-sl-text transition-colors duration-[.16s] group-hover:text-sl-blue">
        {title.name}
      </h3>
    </Link>
  )
}

async function TitleGrid({ countryText }: { countryText: string }) {
  const [titles, regions] = await Promise.all([getTrendingTitles(18), getAvailableRegions()])

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
        <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
          Checked recently
        </h2>
        <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {regions.length} countries covered
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {titles.map((t) => (
          <TitleCard key={`${t.mediaType}-${t.tmdbId}`} title={t} />
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

        <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {JUSTWATCH_ATTRIBUTION}
        </p>
      </div>
    </main>
  )
}
