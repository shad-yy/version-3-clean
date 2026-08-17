import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import {
  JUSTWATCH_ATTRIBUTION,
  buildTitleSlug,
  getTitleDetails,
  getTrendingTitles,
  getWatchProviders,
  isTmdbConfigured,
  parseTitleSlug,
  type CountryAvailability,
  type TitleDetails,
  type WatchProvider,
} from "@/lib/api/tmdb"

/**
 * Where to watch one film or series, country by country.
 *
 * This is the page the repositioning exists for. Sports answers "which channel carries
 * this fixture"; this answers the same question for film and television, and the answer
 * is different in every market — which is exactly what no single source does well.
 *
 * Two constraints inherited from the data source, neither optional:
 *
 *  1. **JustWatch attribution is mandatory** wherever this data appears.
 *  2. **TMDB provides no deep links.** It says a provider carries a title in a country;
 *     it does not give a play URL. So provider names are rendered as information, never
 *     as buttons that imply playback. See the schema note below for the consequence.
 */

export const revalidate = 21600 // 6 hours, matching the availability cache

const TMDB_IMAGE = "https://image.tmdb.org/t/p"

/** Region-neutral English country names from ISO codes. Falls back to the raw code. */
function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code
  } catch {
    return code
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

/**
 * Pre-render the trending titles only.
 *
 * TMDB holds millions of records; generating all of them would be absurd and most would
 * never be requested. Everything else renders on demand and is then cached.
 */
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
  const title = `Where to Watch ${details.name}${yearPart}`
  const description = availability.length
    ? `Streaming, rental and purchase options for the ${kind} ${details.name} across ${availability.length} countries, with the services carrying it in each.`
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
        ? [{ url: `${TMDB_IMAGE}/w780${details.posterPath}`, width: 780, height: 1170, alt: details.name }]
        : undefined,
    }),
  }
}

function ProviderRow({ label, providers }: { label: string; providers: WatchProvider[] }) {
  if (!providers.length) return null
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="text-gray-500 shrink-0 w-[74px]">{label}</span>
      <span className="text-gray-300">{providers.map((p) => p.name).join(", ")}</span>
    </div>
  )
}

function CountryCard({ entry }: { entry: CountryAvailability }) {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
      <h3 className="font-bold text-white text-sm mb-3">
        {countryName(entry.country)}{" "}
        <span className="text-gray-600 font-normal">{entry.country}</span>
      </h3>
      <div className="space-y-1.5">
        {/* Free routes first — the reader should see a no-cost option before a paid one. */}
        <ProviderRow label="Free" providers={entry.free} />
        <ProviderRow label="Free, ads" providers={entry.ads} />
        <ProviderRow label="Subscription" providers={entry.flatrate} />
        <ProviderRow label="Rent" providers={entry.rent} />
        <ProviderRow label="Buy" providers={entry.buy} />
      </div>
    </div>
  )
}

function buildSchema(details: TitleDetails, url: string) {
  /*
   * Movie / TVSeries only — deliberately NO WatchAction.
   *
   * Google's Watch Action markup requires a `target` deep link that opens playback.
   * TMDB does not provide one: it reports that a provider carries a title in a country,
   * not where to play it. Emitting a WatchAction pointed at a landing page would claim
   * a capability this page does not have, and would be marking up a link that does not
   * do what the schema says it does.
   *
   * When a licensed source of per-provider deep links exists, add WatchAction with
   * ActionAccessSpecification and eligibleRegion — the availability data is already
   * shaped for it.
   */
  return {
    "@context": "https://schema.org",
    "@type": details.mediaType === "movie" ? "Movie" : "TVSeries",
    "@id": `${url}#title`,
    name: details.name,
    url,
    ...(details.overview ? { description: details.overview } : {}),
    ...(details.posterPath ? { image: `${TMDB_IMAGE}/w780${details.posterPath}` } : {}),
    ...(details.year ? { datePublished: details.year } : {}),
    ...(details.genres.length ? { genre: details.genres } : {}),
    ...(details.mediaType === "tv" && details.seasons
      ? { numberOfSeasons: details.seasons }
      : {}),
  }
}

export default async function TitlePage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug)
  if (!data) notFound()

  const { details, availability } = data
  const url = `${ENV.BASE_URL}/watch/title/${params.slug}`
  const kind = details.mediaType === "movie" ? "Film" : "Series"

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Watch", item: `${ENV.BASE_URL}/watch` },
      { "@type": "ListItem", position: 3, name: details.name, item: url },
    ],
  }

  return (
    <main className="min-h-screen bg-background pt-28 md:pt-36 pb-16 md:pb-20">
      <SchemaMarkup schema={buildSchema(details, url)} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <div className="container mx-auto max-w-5xl px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/watch" className="hover:text-gray-300 transition-colors">
            Watch
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{details.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          {details.posterPath && (
            <Image
              src={`${TMDB_IMAGE}/w342${details.posterPath}`}
              alt={details.name}
              width={342}
              height={513}
              className="rounded-xl w-40 sm:w-52 h-auto shrink-0"
              priority
            />
          )}

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-[#00e676] mb-2">
              {kind}
              {details.year ? ` · ${details.year}` : ""}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Where to watch {details.name}
            </h1>
            {details.genres.length > 0 && (
              <p className="text-gray-500 text-sm mb-4">{details.genres.join(", ")}</p>
            )}
            {details.overview && (
              <p className="text-gray-300 leading-relaxed">{details.overview}</p>
            )}
          </div>
        </div>

        {availability.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Available in {availability.length}{" "}
                {availability.length === 1 ? "country" : "countries"}
              </h2>
              <p className="text-gray-400 text-sm max-w-3xl">
                Services differ by country because rights are licensed territory by
                territory. A service listed here carries the title in that country — this
                page does not link to playback, and {SITE_NAME} does not provide it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((entry) => (
                <CountryCard key={entry.country} entry={entry} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6">
            <h2 className="font-bold text-white mb-2">No availability data</h2>
            <p className="text-gray-400 text-sm">
              We have no streaming, rental or purchase listings for this title. That does
              not mean it is unavailable — only that we have nothing verified to show, and
              we would rather say so than guess.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-10">{JUSTWATCH_ATTRIBUTION}.</p>
      </div>
    </main>
  )
}
