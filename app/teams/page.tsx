import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
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
 * Teams index, rebuilt in Sightline.
 *
 * A directory rather than an answer page — no broadcaster column, because rights attach
 * to a competition rather than a club, and putting one here would imply a per-team
 * listing we do not hold.
 *
 * Reads `?search=` and `?league=` from the URL so a filtered view is linkable and
 * crawlable rather than trapped in component state.
 */

export const revalidate = 86400

const TITLE = "Teams"
const DESCRIPTION =
  "Club profiles, squads and fixture histories for the teams in the competitions we cover."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/teams` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/teams`,
  }),
}

async function TeamList({ search, league }: { search?: string; league?: string }) {
  let teams: Awaited<ReturnType<typeof unifiedSportsAPI.searchTeams>> = []
  try {
    teams = search
      ? await unifiedSportsAPI.searchTeams(search)
      : await unifiedSportsAPI.getTeams(league ?? "4328")
  } catch {
    teams = []
  }

  if (teams.length === 0) {
    return (
      <EmptyState title={search ? `Nothing found for “${search}”` : "No teams to show"}>
        {search
          ? "No club matches that. Try a different spelling, or a shorter term — club names vary a lot between sources."
          : "We could not load the squad list just now. Everything else on the site is unaffected."}
      </EmptyState>
    )
  }

  return (
    <Section
      title={search ? `Results for “${search}”` : "Clubs"}
      aside={
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {teams.length} {teams.length === 1 ? "club" : "clubs"}
        </span>
      }
    >
      <RowList>
        {teams.map((t) => (
          <Row
            key={t.id}
            href={`/teams/${t.id}`}
            accent="sport"
            title={t.name}
            meta={[t.league, t.country, t.stadium].filter(Boolean).join(" · ")}
          />
        ))}
      </RowList>
    </Section>
  )
}

export default function TeamsPage({
  searchParams,
}: {
  searchParams: { search?: string; league?: string }
}) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/teams#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Teams", item: `${ENV.BASE_URL}/teams` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="Teams"
        title="Clubs and squads"
        intro="Profiles, squads and fixture histories for the clubs in the competitions we cover."
      />
      <Suspense
        key={`${searchParams.search ?? ""}-${searchParams.league ?? ""}`}
        fallback={
          <Section title="Clubs">
            <RowSkeleton rows={6} />
          </Section>
        }
      >
        <TeamList search={searchParams.search} league={searchParams.league} />
      </Suspense>
    </PageShell>
  )
}
