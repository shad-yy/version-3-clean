import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { getViewerCountry, countryLabel, countryName } from "@/lib/geo/country"
import { regionOf, notCheckedCount } from "@/lib/geo/regions"
import { AvailabilityExplorer } from "@/components/sightline/availability-explorer"
import { LANES, type CountryAvailabilityView } from "@/components/sightline/availability-types"
import {
  buildTitleSlug,
  getTitleDetails,
  getTrendingTitles,
  getWatchProviders,
  isTmdbConfigured,
  parseTitleSlug,
  type CountryAvailability,
  type TitleDetails,
  tmdbImage,
} from "@/lib/api/tmdb"

/**
 * Where to watch one film or series, country by country — design/sightline/HANDOFF.md §5.
 *
 * Three constraints from the data, each of which changed the design and is documented in
 * DECISIONS.md rather than worked around:
 *
 *  1. **No `checkedAt` per country.** The provider returns none, so this page carries no
 *     verification date. Verification language is reserved for hand-checked sports
 *     rights; calling a provider fetch "hand-verified" would be a fabrication.
 *  2. **No prices.** The provider returns none, so no price is shown.
 *  3. **No deep links.** The provider gives a landing page per country, not a play URL on
 *     the service. The copy says exactly that, rather than implying a link does something
 *     it does not.
 */

export const revalidate = 21600


/** Flatten provider data into the shape the explorer renders. */
function toView(entry: CountryAvailability): CountryAvailabilityView {
  const lanes = {
    free: entry.free.map((p) => p.name),
    ads: entry.ads.map((p) => p.name),
    flatrate: entry.flatrate.map((p) => p.name),
    rent: entry.rent.map((p) => p.name),
    buy: entry.buy.map((p) => p.name),
  }
  const kindsHeld = LANES.filter((l) => lanes[l.key].length > 0).length
  const serviceCount = new Set(Object.values(lanes).flat()).size

  return {
    code: entry.country,
    name: countryName(entry.country),
    region: regionOf(entry.country),
    lanes,
    kindsHeld,
    serviceCount,
    link: entry.tmdbLink,
  }
}

async function load(slug: string) {
  const parsed = parseTitleSlug(slug)
  if (!parsed) return null
  const details = await getTitleDetails(parsed.mediaType, parsed.tmdbId)
  if (!details) return null
  const availability = await getWatchProviders(parsed.mediaType, parsed.tmdbId)
  return { details, availability }
}

export async function generateStaticParams() {
  if (!isTmdbConfigured()) return []
  const trending = await getTrendingTitles(20)
  return trending.map((t) => ({ slug: buildTitleSlug(t.mediaType, t.tmdbId, t.name) }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await load(params.slug)
  if (!data) return { title: "Title not found" }

  const { details, availability } = data
  const kind = details.mediaType === "movie" ? "film" : "series"
  const yearPart = details.year ? ` (${details.year})` : ""
  const title = `Where to watch ${details.name}${yearPart}`
  const description = availability.length
    ? `Which service carries the ${kind} ${details.name}, country by country — free, ad-supported, subscription, rent or buy across ${availability.length} countries.`
    : `Availability information for the ${kind} ${details.name}.`
  const url = `${ENV.BASE_URL}/watch/title/${params.slug}`

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      title,
      description,
      url,
      images: details.posterPath
        ? [{ url: tmdbImage(details.posterPath, "w780")!, width: 780, height: 1170, alt: details.name }]
        : undefined,
    }),
  }
}

function buildSchema(details: TitleDetails, url: string) {
  /*
   * Movie / TVSeries only — deliberately no WatchAction.
   *
   * Google's Watch Action requires a `target` deep link that opens playback. The provider
   * supplies a landing page, not a play URL, so a WatchAction here would mark up a link
   * as doing something it does not do.
   */
  return {
    "@context": "https://schema.org",
    "@type": details.mediaType === "movie" ? "Movie" : "TVSeries",
    "@id": `${url}#title`,
    name: details.name,
    url,
    ...(details.overview ? { description: details.overview } : {}),
    ...(details.posterPath ? { image: tmdbImage(details.posterPath, "w780")! } : {}),
    ...(details.year ? { datePublished: details.year } : {}),
    ...(details.genres.length ? { genre: details.genres } : {}),
    ...(details.mediaType === "tv" && details.seasons ? { numberOfSeasons: details.seasons } : {}),
  }
}

/** The viewer's own country, answered first and in full. */
function YourCountry({
  view,
  countryText,
  known,
}: {
  view: CountryAvailabilityView | null
  countryText: string
  known: boolean
}) {
  return (
    <section className="rounded-[8px] border border-sl-line bg-sl-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sl-hair px-5 py-4">
        <div>
          <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[.14em] text-sl-mute">
            {known ? "Your country · by IP" : "Country not detected"}
          </p>
          <h2 className="text-[17px] font-semibold text-sl-text">{countryText}</h2>
        </div>
        <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          Change in the header
        </p>
      </div>

      <div className="px-5 py-4">
        {!view ? (
          // Same panel geometry as a populated answer. It is an answer, not an error.
          <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mid">
            {known
              ? `Nothing is recorded for ${countryText}. Our source lists no way to watch it there — which is not the same as the title being unavailable.`
              : "We could not detect your country, so pick one in the header and this block will answer for it."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {LANES.map((lane) => {
              const services = view.lanes[lane.key]
              return (
                <div key={lane.key} className="flex flex-wrap items-baseline gap-2">
                  <span className="w-[120px] shrink-0 font-mono text-[10.5px] uppercase tracking-[.1em] text-sl-mute">
                    {lane.label}
                  </span>
                  {services.length === 0 ? (
                    <span className="text-[13px] text-sl-dim">
                      No {lane.label.toLowerCase()} offer recorded
                    </span>
                  ) : (
                    services.map((s) => (
                      <span
                        key={s}
                        className="rounded-[5px] border border-sl-line bg-sl-surface px-2.5 py-1 text-[13px] text-sl-mid"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="border-t border-sl-hair px-5 py-3 text-[13px] leading-[1.55] text-sl-mute">
        {/* Adjusted from the handoff: the provider gives a landing page per country, not a
            deep link into each service, so the sentence promises only what it delivers. */}
        These are service listings, not links to video. {SITE_NAME} transmits no video and
        sells no subscription.
      </p>
    </section>
  )
}

export default async function TitlePage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug)
  if (!data) notFound()

  const { details, availability } = data
  const url = `${ENV.BASE_URL}/watch/title/${params.slug}`
  const kind = details.mediaType === "movie" ? "Film" : "Series"

  const viewerCode = getViewerCountry()
  const countryText = countryLabel(viewerCode)

  const views = availability.map(toView).sort((a, b) => a.name.localeCompare(b.name))
  const yourCountry = viewerCode ? views.find((v) => v.code === viewerCode) ?? null : null
  const notChecked = notCheckedCount(views.map((v) => v.code))

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Film & TV", item: `${ENV.BASE_URL}/watch/title` },
      { "@type": "ListItem", position: 3, name: details.name, item: url },
    ],
  }

  return (
    <main className="min-h-screen bg-sl-ground pt-[62px]">
      <SchemaMarkup schema={buildSchema(details, url)} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* Film header */}
      <div className="mx-auto max-w-[1280px] px-[18px] pb-8 pt-10 lg:px-10">
        <nav className="mb-6 text-[13px] text-sl-mute">
          <Link href="/watch/title" className="transition-colors duration-[.16s] hover:text-sl-text">
            Film &amp; TV
          </Link>
          <span className="mx-2 text-sl-dim">/</span>
          <span className="text-sl-mid">{details.name}</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row">
          {details.posterPath ? (
            <Image
              src={tmdbImage(details.posterPath, "w342")!}
              alt={details.name}
              width={136}
              height={202}
              className="w-[136px] shrink-0 rounded-[7px] border border-sl-line"
              priority
            />
          ) : (
            <div
              className="flex w-[136px] shrink-0 items-center justify-center rounded-[7px] border border-sl-outline"
              style={{ height: 202 }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[.12em] text-sl-outline-text">
                No poster
              </span>
            </div>
          )}

          <div className="min-w-0">
            {/* Blue is the film/TV accent. Amber is reserved for live sport. */}
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[.16em] text-sl-blue">
              {kind}
            </p>
            <h1 className="mb-3 text-[35px] font-semibold leading-[1.06] tracking-[-0.034em] text-sl-text lg:text-[44px] lg:leading-[1.03] lg:tracking-[-0.035em]">
              {details.name}
            </h1>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[.08em] text-sl-mute">
              {[details.year, details.genres.slice(0, 3).join(" · "), details.runtime ? `${details.runtime} min` : null]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
            {details.overview && (
              <p className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">
                {details.overview}
              </p>
            )}
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[.14em] text-sl-dim">
              Availability data by JustWatch via TMDB
            </p>
          </div>
        </div>
      </div>

      {/* Your country, answered before the world */}
      <div className="mx-auto max-w-[1280px] px-[18px] pb-10 lg:px-10">
        <YourCountry view={yourCountry} countryText={countryText} known={Boolean(viewerCode)} />
      </div>

      {availability.length > 0 ? (
        <>
          <div className="mx-auto max-w-[1280px] px-[18px] lg:px-10">
            <h2 className="mb-1 text-[20px] font-semibold tracking-[-0.022em] text-sl-text">
              Every other country
            </h2>
            <p className="mb-6 max-w-[620px] text-[13px] leading-[1.55] text-sl-mid">
              Rights are licensed territory by territory, so the answer changes at every
              border. Countries missing from this list are ones we hold nothing for.
            </p>
          </div>
          <AvailabilityExplorer countries={views} notCheckedCount={notChecked} />
        </>
      ) : (
        <div className="mx-auto max-w-[1280px] px-[18px] pb-16 lg:px-10">
          <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
            <h2 className="mb-2 text-[17px] font-semibold text-sl-text">
              No availability recorded
            </h2>
            <p className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">
              We hold no streaming, rental or purchase listings for this title in any
              country. That does not mean it cannot be watched — only that we have nothing
              verified to show, and we would rather say so than guess.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
