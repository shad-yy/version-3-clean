import type { Metadata } from "next"
import Link from "next/link"
import { ENV } from "@/lib/config/env"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { LEAGUES } from "@/lib/constants/leagues"
import { COMPETITION_RIGHTS } from "@/lib/data/broadcast-rights"

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
  title: "Where to Watch — Competition Guides | Smart Live TV",
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
      className="group flex flex-col rounded-2xl border border-[#2a2a3a] bg-[#12121a] p-5 transition-colors hover:border-[#00e676]/40"
    >
      <h3 className="text-lg font-bold text-white group-hover:text-[#00e676] transition-colors">
        {guide.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-gray-400 leading-relaxed">{guide.blurb}</p>
      {countries > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Broadcast listings verified for {countries}{" "}
          {countries === 1 ? "country" : "countries"}
        </p>
      )}
    </Link>
  )
}

export default function WatchIndexPage() {
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
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={breadcrumb} />
      <SchemaMarkup schema={itemList} />

      <section className="pt-28 md:pt-36 pb-12 px-4 border-b border-[#1a1a2a]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00e676]">
            Where to watch
          </p>
          <h1 className="mb-4 text-4xl md:text-5xl font-extrabold text-white">
            Competition guides
          </h1>
          <p className="max-w-2xl text-gray-400 leading-relaxed">
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

        <p className="mx-auto mt-8 max-w-6xl text-xs text-gray-600">
          Broadcast rights are shown at competition level and change between seasons.
          Individual fixtures can move — always confirm with the broadcaster before
          kick-off.
        </p>
      </section>
    </div>
  )
}
