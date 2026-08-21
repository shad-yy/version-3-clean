import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { countryName } from "@/lib/geo/country"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { lastCheckedForCountry } from "@/lib/data/verification-log"
import {
  buildTitleSlug,
  getAvailableRegions,
  getTrendingTitles,
  getWatchProvidersForCountry,
  isTmdbConfigured,
} from "@/lib/api/tmdb"
import {
  PageShell,
  PageHeader,
  Section,
  RowList,
  Row,
  EmptyState,
  RowSkeleton,
} from "@/components/sightline/page-shell"
import { PosterThumb } from "@/components/sightline/poster-thumb"
import { RightsCheckLoader } from "@/components/sightline/rights-check-loader"
import { CompetitionBadge } from "@/components/sightline/competition-badge"

/**
 * "Where to watch in <country>" — the answer page for the query this site exists to own.
 *
 * The title page answers "where can I watch X" globally with a per-country breakdown.
 * This is the other axis: pick a country, see what we can actually answer there. It is
 * the natural landing page for "where to watch X in Germany" style searches, and it
 * scales to every country the provider covers without inventing anything.
 *
 * It is also the most honest page on the site by construction: a country with no verified
 * sports rights says so at the top rather than burying it, because the whole page is
 * scoped to what we know about that one place.
 */

export const revalidate = 21600

/** Pre-render the countries we have hand-verified. The rest render on demand. */
export async function generateStaticParams() {
  const verified = new Set(
    COMPETITION_RIGHTS.flatMap((c) => c.listings.map((l) => l.country.toLowerCase())),
  )
  return [...verified].map((country) => ({ country }))
}

async function resolveCountry(param: string) {
  const code = param.toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null
  if (!isTmdbConfigured()) return null

  // Only answer for countries the provider actually covers. Rendering a page for a
  // country we can say nothing about would be a thin page pretending to be an answer.
  const regions = await getAvailableRegions()
  if (!regions.includes(code)) return null

  return { code, name: countryName(code) }
}

export async function generateMetadata({
  params,
}: {
  params: { country: string }
}): Promise<Metadata> {
  const resolved = await resolveCountry(params.country)
  if (!resolved) return { title: "Country not found" }

  const title = `Where to watch in ${resolved.name}`
  const description = `Which services carry films, series and sport in ${resolved.name} — with the date each broadcast listing was last verified by hand.`
  const url = `${ENV.BASE_URL}/where-to-watch/${params.country.toLowerCase()}`

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ title, description, url }),
  }
}

async function SportSection({ code, name }: { code: string; name: string }) {
  const rows = COMPETITION_RIGHTS.flatMap((competition) =>
    competition.listings
      .filter((l) => l.country === code)
      .map((l) => ({ competition, listing: l })),
  )

  const checked = lastCheckedForCountry(code)

  if (rows.length === 0) {
    return (
      <Section title="Sport">
        <EmptyState title={`We have not verified any sports broadcasters in ${name}`}>
          Our broadcast rights are checked by hand, one country at a time, and {name} is
          not one we have reached yet. Matches are still being played and shown there — we
          simply cannot tell you on which channel, and would rather say so than guess.
        </EmptyState>
      </Section>
    )
  }

  return (
    <Section
      title="Sport"
      aside={
        checked ? (
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
            Last checked {checked}
          </span>
        ) : undefined
      }
    >
      <RowList>
        {rows.map(({ competition, listing }) => (
          <Row
            key={`${competition.id}-${listing.broadcaster}`}
            href={competition.href}
            accent="sport"
            thumb={<CompetitionBadge competition={competition.id} size="lg" />}
            title={competition.name}
            meta={listing.streamingOn ? `Streams on ${listing.streamingOn}` : undefined}
            right={listing.broadcaster}
            rightNote="Verified by hand"
          />
        ))}
      </RowList>
    </Section>
  )
}

async function FilmSection({ code, name }: { code: string; name: string }) {
  const trending = await getTrendingTitles(12)

  // Only list titles we can actually answer for in this country. A row that says
  // "nothing recorded" on a page scoped to one country is noise -- the country-level
  // gap is already stated by the section that has nothing in it.
  const withOffers = (
    await Promise.all(
      trending.map(async (t) => {
        const availability = await getWatchProvidersForCountry(t.mediaType, t.tmdbId, code)
        if (!availability) return null
        const services = [
          ...availability.free,
          ...availability.ads,
          ...availability.flatrate,
          ...availability.rent,
          ...availability.buy,
        ].map((p) => p.name)
        if (services.length === 0) return null
        return { title: t, services: [...new Set(services)] }
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null)

  if (withOffers.length === 0) {
    return (
      <Section title="Film and television">
        <EmptyState title={`Nothing currently listed in ${name}`}>
          Our source records no way to watch the titles we checked in {name} right now.
          That is a statement about our source rather than about the country.
        </EmptyState>
      </Section>
    )
  }

  return (
    <Section
      title="Film and television"
      aside={
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {withOffers.length} available now
        </span>
      }
    >
      <RowList>
        {withOffers.map(({ title, services }) => (
          <Row
            key={`${title.mediaType}-${title.tmdbId}`}
            href={`/watch/title/${buildTitleSlug(title.mediaType, title.tmdbId, title.name)}`}
            accent="film-tv"
            thumb={<PosterThumb path={title.posterPath} />}
            lead={title.year}
            leadSub={title.mediaType === "movie" ? "Film" : "Series"}
            title={title.name}
            meta={title.genres.slice(0, 2).join(" · ")}
            right={services.slice(0, 2).join(", ")}
            rightNote={services.length > 2 ? `+${services.length - 2} more` : undefined}
          />
        ))}
      </RowList>
    </Section>
  )
}

export default async function WhereToWatchCountryPage({
  params,
}: {
  params: { country: string }
}) {
  const resolved = await resolveCountry(params.country)
  if (!resolved) notFound()

  const { code, name } = resolved
  const url = `${ENV.BASE_URL}/where-to-watch/${params.country.toLowerCase()}`

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: `Where to watch in ${name}`, item: url },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow={`Where to watch · ${code}`}
        title={`Where to watch in ${name}`}
        intro={`Which services carry sport, film and television in ${name} — and, just as plainly, what we have not checked.`}
      />

      <Suspense
        fallback={
          <Section title="Sport">
            <RowSkeleton rows={3} />
          </Section>
        }
      >
        <SportSection code={code} name={name} />
      </Suspense>

      {/*
        The film section is the slow one: it fans out a watch-provider lookup per title.
        That wait gets the four-stage check rather than a flat skeleton, because the
        stages describe exactly what is taking the time.
      */}
      <Suspense
        fallback={
          <Section title="Film and television">
            <RightsCheckLoader rows={4} />
          </Section>
        }
      >
        <FilmSection code={code} name={name} />
      </Suspense>

      <Section>
        <p className="max-w-[620px] text-[13px] leading-[1.55] text-sl-mute">
          Looking for something specific?
          <Link
            href="/search"
            className="text-sl-mid underline decoration-sl-dim underline-offset-2 transition-colors duration-[.16s] hover:text-sl-text"
          >
            Search for a film, series, team or competition
          </Link>
          and we will answer for {name}.
        </p>
      </Section>
    </PageShell>
  )
}
