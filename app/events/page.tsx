import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { FixtureList } from "@/components/sightline/fixture-list"
import { lastCheckedForCountry } from "@/lib/data/verification-log"
import { resolveRights } from "@/lib/data/resolve-rights"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { LocalTime } from "@/components/ui/local-time"
import {
  PageShell,
  PageHeader,
  Section,
  RowList,
  Row,
  EmptyState,
  RowSkeleton,
} from "@/components/sightline/page-shell"

/**
 * Fixture calendar, rebuilt in Sightline.
 *
 * Grouped by date rather than presented as one long list, because the question a reader
 * brings here is "what is on, and when" — a flat list forces them to do the grouping in
 * their head.
 *
 * Kick-offs render in the reader's own timezone. A fixture list printed in one fixed zone
 * is wrong for almost everyone reading it.
 */

export const revalidate = 300

const TITLE = "Fixtures"
const DESCRIPTION =
  "Upcoming fixtures with kick-off times in your own timezone, and the broadcaster showing each match in your country where we have verified one."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/events` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/events`,
  }),
}

async function FixturesByDate() {
  const viewerCountry = getViewerCountry()
  const countryText = countryLabel(viewerCountry)

  let fixtures: Awaited<ReturnType<typeof unifiedSportsAPI.getUpcomingFixtures>> = []
  try {
    fixtures = await unifiedSportsAPI.getUpcomingFixtures({ limit: 40 })
  } catch {
    fixtures = []
  }

  if (fixtures.length === 0) {
    return (
      <EmptyState title="No fixtures scheduled">
        We hold nothing upcoming right now. This is a real answer rather than a failure —
        when fixtures are announced they appear here, with the broadcaster for{" "}
        {countryText} where we have verified one.
      </EmptyState>
    )
  }

  // Group by calendar date so the reader does not have to.
  const byDate = new Map<string, typeof fixtures>()
  for (const f of fixtures) {
    const key = f.date || "Date to be confirmed"
    const list = byDate.get(key) ?? []
    list.push(f)
    byDate.set(key, list)
  }

  return (
    <>
      {[...byDate.entries()].map(([date, list]) => (
        <Section
          key={date}
          title={
            date === "Date to be confirmed"
              ? date
              : new Intl.DateTimeFormat("en", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                }).format(new Date(`${date}T00:00:00Z`))
          }
          aside={
            <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
              {list.length} {list.length === 1 ? "fixture" : "fixtures"}
            </span>
          }
          className="pb-0 last:pb-10"
        >
          {/*
            §2d: rows open in place instead of navigating. The answer to "who is showing
            this where I am" is two lines long, and sending someone to another page for
            two lines is what made the old list read as a directory.
          */}
          <FixtureList
            countryText={countryText}
            fixtures={list.map((f) => {
              const rights = resolveRights(f.league, viewerCountry)
              const forViewer = rights.countries.find((c) => c.code === viewerCountry)
              return {
                id: String(f.id),
                homeTeam: f.homeTeam,
                awayTeam: f.awayTeam,
                homeLogo: f.homeLogo,
                awayLogo: f.awayLogo,
                league: f.league,
                venue: f.venue,
                date: f.date,
                time: f.time ? String(f.time) : undefined,
                artwork: f.artwork,
                broadcaster: forViewer?.listings?.[0]?.broadcaster ?? null,
                verified: viewerCountry ? lastCheckedForCountry(viewerCountry) : null,
                isLive: f.isLive,
              }
            })}
          />
        </Section>
      ))}
    </>
  )
}

export default function EventsPage() {
  const countryText = countryLabel(getViewerCountry())

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/events#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Fixtures", item: `${ENV.BASE_URL}/events` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="Fixtures"
        title="What is coming up"
        intro={`Kick-off times in your own timezone, and who is showing each match in ${countryText} where we have verified a broadcaster.`}
      />
      <Suspense
        fallback={
          <Section title="Upcoming">
            <RowSkeleton rows={6} />
          </Section>
        }
      >
        <FixturesByDate />
      </Suspense>
    </PageShell>
  )
}
