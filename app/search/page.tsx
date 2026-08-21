import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { formatTime } from "@/lib/utils/datetime"
import { HeroSearch } from "@/components/sightline/hero-search"
import {
  ResultRow,
  type ResultRowData,
} from "@/components/sightline/result-row"
import { buildTitleSlug, getAvailableRegions, isTmdbConfigured, searchTitles } from "@/lib/api/tmdb"
import { RightsCheckLoader } from "@/components/sightline/rights-check-loader"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

/**
 * Search results — design/sightline/HANDOFF.md §3.
 *
 * One list mixing sport and film/TV rather than two tabbed lists, because the reader's
 * question ("where can I watch X") does not know which vertical the answer lives in.
 *
 * Rows carry their type through the lead column and a 2px accent, never a badge —
 * design opinion 1.
 */

export const metadata: Metadata = {
  title: `Search | ${SITE_NAME}`,
  description:
    "Search for a film, series, team or competition and see where it is shown in your country.",
  // Results pages are not useful in an index and would be near-duplicates of one another.
  robots: { index: false, follow: true },
  alternates: { canonical: `${ENV.BASE_URL}/search` },
}

type Scope = "Everything" | "Sport" | "Film & TV"

async function sportRows(query: string): Promise<ResultRowData[]> {
  try {
    const [teams, fixtures] = await Promise.all([
      unifiedSportsAPI.searchTeams(query).catch(() => []),
      unifiedSportsAPI.searchEvents(query).catch(() => []),
    ])

    const fixtureRows: ResultRowData[] = (fixtures ?? []).slice(0, 6).map((f: any) => ({
      href: `/match/${f.id}`,
      kind: "sport" as const,
      // Kick-off in the viewer's own terms; the machine value stays in the link target.
      lead: f.time ? formatTime(`${f.date}T${String(f.time).slice(0, 8)}Z`) : "",
      leadSub: "Fixture",
      title: `${f.homeTeam} v ${f.awayTeam}`,
      meta: [f.league, f.venue].filter(Boolean).join(" · "),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeLogo: f.homeLogo ?? null,
      awayLogo: f.awayLogo ?? null,
    }))

    const teamRows: ResultRowData[] = (teams ?? []).slice(0, 4).map((t: any) => ({
      href: `/teams/${t.id}`,
      kind: "sport" as const,
      lead: "",
      leadSub: "Team",
      title: t.name,
      meta: [t.league, t.country].filter(Boolean).join(" · "),
    }))

    return [...fixtureRows, ...teamRows]
  } catch {
    return []
  }
}

async function filmRows(query: string): Promise<ResultRowData[]> {
  if (!isTmdbConfigured()) return []
  const titles = await searchTitles(query, 10)
  return titles.map((t) => ({
    href: `/watch/title/${buildTitleSlug(t.mediaType, t.tmdbId, t.name)}`,
    kind: "film-tv" as const,
    lead: t.year,
    leadSub: t.mediaType === "movie" ? "Film" : "Series",
    title: t.name,
    meta: t.genres.slice(0, 3).join(" · "),
    posterPath: t.posterPath,
  }))
}

async function Results({ query, scope }: { query: string; scope: Scope }) {
  const country = getViewerCountry()
  const countryText = countryLabel(country)

  const [sport, film] = await Promise.all([
    scope === "Film & TV" ? Promise.resolve([]) : sportRows(query),
    scope === "Sport" ? Promise.resolve([]) : filmRows(query),
  ])

  const rows = [...film, ...sport]

  if (rows.length === 0) {
    // Same panel geometry as a populated result. An answer, not an error.
    return (
      <div className="rounded-[8px] border border-sl-line bg-sl-panel p-6">
        <h2 className="mb-2 text-[17px] font-semibold text-sl-text">
          Nothing found for &ldquo;{query}&rdquo;
        </h2>
        <p className="max-w-[620px] text-[14px] leading-[1.6] text-sl-mid">
          We hold no film, series, team or fixture matching that. Try a different spelling,
          or a broader term — and if you searched for something we should cover, that is
          useful to know.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-[13px] text-sl-mute">
        <span className="font-mono text-sl-mid">{rows.length}</span> result
        {rows.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo; in {countryText}
      </p>
      <div className="overflow-hidden rounded-[8px] border border-sl-line">
        {rows.map((row) => (
          <ResultRow key={`${row.kind}-${row.href}`} row={row} />
        ))}
      </div>
    </>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; scope?: string }
}) {
  const query = (searchParams.q || "").trim()
  const scope: Scope =
    searchParams.scope === "Sport" || searchParams.scope === "Film & TV"
      ? searchParams.scope
      : "Everything"

  const country = getViewerCountry()
  const countryText = countryLabel(country)
  // Real provider coverage, so the loader's "Checking N catalogues" is a fact rather than
  // a hardcoded number that quietly goes stale.
  const regionCount = (await getAvailableRegions()).length

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/search#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Search", item: `${ENV.BASE_URL}/search` },
    ],
  }

  return (
    <main className="min-h-screen bg-sl-ground pt-[62px]">
      <SchemaMarkup schema={breadcrumb} />

      <div className="mx-auto max-w-[1280px] px-[18px] py-10 lg:px-10">
        {/* Every page needs exactly one h1 naming its subject. This page had none, so
            crawlers and screen readers had nothing identifying what it is. Visually
            hidden because the search field itself already reads as the page's purpose,
            and a visible duplicate heading would be noise. */}
        <h1 className="sr-only">
          {query ? `Search results for ${query}` : "Search"}
        </h1>
        <div className="mb-8">
          <HeroSearch countryText={countryText} />
        </div>

        {/*
          The four-stage rights check rather than a flat skeleton. A search genuinely does
          resolve a region, match a title, check catalogues and confirm rights -- saying so
          turns the one unavoidable wait into the clearest explanation of the product a
          reader will get.
        */}
        {query ? (
          <Suspense
            key={`${query}-${scope}`}
            fallback={<RightsCheckLoader regionCount={regionCount} rows={5} />}
          >
            <Results query={query} scope={scope} />
          </Suspense>
        ) : (
          <p className="text-[14px] text-sl-mid">
            Search for a film, series, team or competition to see where it is shown in{" "}
            {countryText}.
          </p>
        )}
      </div>
    </main>
  )
}
