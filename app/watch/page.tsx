import type { Metadata } from "next"
import Link from "next/link"
import { ENV } from "@/lib/config/env"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { LEAGUES } from "@/lib/constants/leagues"
import { CompetitionBadge } from "@/components/sightline/competition-badge"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"
import { PosterThumb } from "@/components/sightline/poster-thumb"
import {
  buildTitleSlug,
  getTrendingTitles,
  isTmdbConfigured,
} from "@/lib/api/tmdb"

/**
 * The competition index.
 *
 * This route previously did not exist, yet four BreadcrumbList blocks named `/watch`
 * as a parent, `components/league/league-detail-view.tsx` linked to it, and
 * `scripts/generate-posts.js` rewrote blog links to it — all resolving to a 404.
 *
 * Copy here is deliberately country-neutral. Which broadcaster carries a competition
 * depends on where the visitor is, and that answer comes from
 * `lib/data/broadcast-rights.ts` — never from prose that assumes one market.
 */

export const metadata: Metadata = {
  title: "Where to Watch — Competition Guides | Sightline",
  description:
    "Fixtures, standings and broadcast listings for football, Formula 1 and UFC. Find which service carries each competition in your country.",
  alternates: { canonical: `${ENV.BASE_URL}/watch` },
}

interface Guide {
  href: string
  name: string
  blurb: string
}

/** Competitions with a literal route of their own, outside the LEAGUES map. */
const STANDALONE_GUIDES: Guide[] = [
  {
    href: "/watch/champions-league",
    name: "UEFA Champions League",
    blurb: "League phase and knockout fixtures, tables and results.",
  },
  {
    href: "/watch/europa-league",
    name: "UEFA Europa League",
    blurb: "Fixtures, league phase standings and results.",
  },
  {
    href: "/watch/formula-1",
    name: "Formula 1",
    blurb: "Race calendar, session times and circuit details.",
  },
  {
    href: "/ufc",
    name: "UFC",
    blurb: "Event schedule, full fight cards, fighter records and rankings.",
  },
  {
    href: "/watch/world-cup-2026",
    name: "FIFA World Cup 2026",
    blurb: "Tournament results and broadcast archive.",
  },
]

/** How many countries we have verified broadcast data for, per competition. */
function verifiedCountryCount(href: string): number {
  const record = COMPETITION_RIGHTS.find((c) => c.href === href)
  return record ? record.listings.length : 0
}

function GuideCard({ guide }: { guide: Guide }) {
  const countries = verifiedCountryCount(guide.href)

  return (
    <Link
      href={guide.href}
      className="group flex flex-col rounded-2xl border border-[var(--sl-line)] bg-[var(--sl-surface)] p-5 transition-colors hover:border-[var(--sl-amber)]/40"
    >
      <div className="mb-2 flex items-center gap-2.5">
        <CompetitionBadge competition={guide.href.replace("/watch/", "")} size="lg" />
        <h3 className="text-lg font-bold text-sl-text group-hover:text-[var(--sl-amber)] transition-colors">
          {guide.name}
        </h3>
      </div>
      <p className="mt-2 flex-1 text-sm text-sl-mute leading-relaxed">{guide.blurb}</p>
      {countries > 0 && (
        <p className="mt-4 text-xs text-sl-mute">
          Broadcast listings verified for {countries}
          {countries === 1 ? "country" : "countries"}
        </p>
      )}
    </Link>
  )
}

/** Revalidate daily so the trending list below does not go stale. */
export const revalidate = 86400

export default async function WatchIndexPage() {
  // Films and series, when TMDB is configured. The section is omitted entirely rather
  // than rendered empty when it is not — an empty shelf invites the reader to wonder
  // what is broken.
  const titles = isTmdbConfigured() ? await getTrendingTitles(12) : []

  // LEAGUES minus the entry that has its own literal route, to avoid listing it twice.
  const leagueGuides: Guide[] = Object.entries(LEAGUES)
    .filter(([slug]) => slug !== "champions-league")
    .map(([slug, league]) => ({
      href: `/watch/${slug}`,
      name: league.name,
      blurb: "Fixtures, live scores, league table and results.",
    }))

  const guides = [...leagueGuides, ...STANDALONE_GUIDES]

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/watch#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Where to Watch", item: `${ENV.BASE_URL}/watch` },
    ],
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Competition guides",
    url: `${ENV.BASE_URL}/watch`,
    numberOfItems: guides.length,
    itemListElement: guides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.name,
      url: `${ENV.BASE_URL}${g.href}`,
    })),
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-sl-text">
      <SchemaMarkup schema={breadcrumb} />
      <SchemaMarkup schema={itemList} />

      <section className="pt-28 md:pt-36 pb-12 px-4 border-b border-[var(--sl-raise)]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--sl-amber)]">
            Where to watch
          </p>
          <h1 className="mb-4 text-4xl md:text-5xl font-extrabold text-sl-text">
            Competition guides
          </h1>
          <p className="max-w-2xl text-sl-mute leading-relaxed">
            Fixtures, kick-off times, standings and results — plus which service carries
            each competition, country by country. Rights differ by territory, so a guide
            names the broadcaster for the countries we have verified rather than assuming
            one market.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.href} guide={guide} />
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-6xl text-xs text-sl-dim">
          Broadcast rights are shown at competition level and change between seasons.
          Individual fixtures can move — always confirm with the broadcaster before
          kick-off.
        </p>
      </section>

      {titles.length > 0 && (
        <section className="border-t border-[var(--sl-raise)] px-4 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-3 text-2xl md:text-3xl font-bold text-sl-text">Films and series</h2>
            <p className="mb-8 max-w-2xl text-sm text-sl-mute leading-relaxed">
              The same question, asked of film and television: which service carries this,
              where you are. Availability is listed per country, because a title on a
              subscription in one market is a rental in the next and absent from a third.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {titles.map((t) => (
                <Link
                  key={`${t.mediaType}-${t.tmdbId}`}
                  href={`/watch/title/${buildTitleSlug(t.mediaType, t.tmdbId, t.name)}`}
                  className="group flex gap-4 rounded-2xl border border-[var(--sl-line)] bg-[var(--sl-surface)] p-5 transition-colors hover:border-[var(--sl-amber)]/40"
                >
                  <PosterThumb path={t.posterPath} size="md" />
                  <div className="flex min-w-0 flex-col">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-sl-mute">
                    {t.mediaType === "movie" ? "Film" : "Series"}
                    {t.year ? ` · ${t.year}` : ""}
                  </p>
                  <h3 className="text-lg font-bold text-sl-text transition-colors group-hover:text-[var(--sl-amber)]">
                    {t.name}
                  </h3>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}
    </div>
  )
}
