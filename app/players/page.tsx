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
 * Players index, rebuilt in Sightline.
 *
 * Search-led rather than browse-led: the underlying source holds far too many players to
 * present as a list, and a directory the reader has to page through is worse than one
 * they can query. With no search term it shows a squad, which is a useful default and an
 * honest one.
 */

export const revalidate = 86400

const TITLE = "Players"
const DESCRIPTION =
  "Player profiles and season statistics for the squads in the competitions we cover."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/players` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/players`,
  }),
}

async function PlayerList({ search, team }: { search?: string; team?: string }) {
  let players: Awaited<ReturnType<typeof unifiedSportsAPI.searchPlayers>> = []
  try {
    players = search
      ? await unifiedSportsAPI.searchPlayers(search)
      : await unifiedSportsAPI.getPlayers(team ?? "133604")
  } catch {
    players = []
  }

  if (players.length === 0) {
    return (
      <EmptyState title={search ? `Nothing found for “${search}”` : "No players to show"}>
        {search
          ? "No player matches that. Names vary between sources — try a surname on its own."
          : "We could not load a squad just now. Everything else on the site is unaffected."}
      </EmptyState>
    )
  }

  return (
    <Section
      title={search ? `Results for “${search}”` : "Squad"}
      aside={
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {players.length} {players.length === 1 ? "player" : "players"}
        </span>
      }
    >
      <RowList>
        {players.map((p) => (
          <Row
            key={p.id}
            href={`/players/${p.id}`}
            accent="sport"
            /* UnifiedPlayer carries no squad number, so the lead column shows position
               -- the next most useful thing to sort a squad by in your head. Inventing a
               number would be exactly the kind of plausible filler rule 1 forbids. */
            lead={p.position?.slice(0, 12)}
            leadSub={p.age ? `Age ${p.age}` : undefined}
            title={p.name}
            meta={[p.team, p.nationality].filter(Boolean).join(" · ")}
          />
        ))}
      </RowList>
    </Section>
  )
}

export default function PlayersPage({
  searchParams,
}: {
  searchParams: { search?: string; team?: string }
}) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/players#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Players", item: `${ENV.BASE_URL}/players` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="Players"
        title="Who plays where"
        intro="Profiles and season statistics for the squads in the competitions we cover."
      />
      <Suspense
        key={`${searchParams.search ?? ""}-${searchParams.team ?? ""}`}
        fallback={
          <Section title="Squad">
            <RowSkeleton rows={6} />
          </Section>
        }
      >
        <PlayerList search={searchParams.search} team={searchParams.team} />
      </Suspense>
    </PageShell>
  )
}
