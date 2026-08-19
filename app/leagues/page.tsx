import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { resolveRights } from "@/lib/data/resolve-rights"
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
 * Competitions index, rebuilt in Sightline.
 *
 * Each row states whether we hold a verified broadcaster for the reader's country, which
 * turns a plain directory into an answer to the site's question. Where we do not, the row
 * says so — the gap is visible at list level rather than only after a click.
 */

export const revalidate = 86400

const TITLE = "Competitions"
const DESCRIPTION =
  "League tables, fixtures and results for the competitions we cover, with the broadcaster for your country where we have verified one."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/leagues` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/leagues`,
  }),
}

async function LeagueList() {
  const viewerCountry = getViewerCountry()
  const countryText = countryLabel(viewerCountry)

  let leagues: Awaited<ReturnType<typeof unifiedSportsAPI.getLeagues>> = []
  try {
    leagues = await unifiedSportsAPI.getLeagues()
  } catch {
    leagues = []
  }

  if (leagues.length === 0) {
    return (
      <EmptyState title="No competitions to show">
        We could not load the competition list just now. Everything else on the site is
        unaffected.
      </EmptyState>
    )
  }

  const verifiedCount = leagues.filter((l) => {
    const r = resolveRights(l.name, viewerCountry)
    return r.countries.find((c) => c.code === viewerCountry)?.listings?.length
  }).length

  return (
    <Section
      title="All competitions"
      aside={
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
          {verifiedCount} of {leagues.length} verified in {countryText}
        </span>
      }
    >
      <RowList>
        {leagues.map((l) => {
          const rights = resolveRights(l.name, viewerCountry)
          const forViewer = rights.countries.find((c) => c.code === viewerCountry)
          const broadcaster = forViewer?.listings?.[0]?.broadcaster ?? null

          return (
            <Row
              key={l.id}
              href={`/leagues/${l.id}`}
              accent="sport"
              title={l.name}
              meta={[l.country, l.sport].filter(Boolean).join(" · ")}
              right={broadcaster ?? undefined}
              rightNote={broadcaster ? undefined : `Not verified in ${countryText}`}
            />
          )
        })}
      </RowList>

      <p className="mt-6 max-w-[620px] text-[13px] leading-[1.55] text-sl-mute">
        A competition without a broadcaster listed is one we have not verified in{" "}
        {countryText}. It is almost certainly shown somewhere — we simply have not checked,
        and we would rather say that than guess.
      </p>
    </Section>
  )
}

export default function LeaguesPage() {
  const countryText = countryLabel(getViewerCountry())

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/leagues#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Competitions", item: `${ENV.BASE_URL}/leagues` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="Competitions"
        title="Which competitions we cover"
        intro={`Tables, fixtures and results — and who shows each one in ${countryText} where we have verified a broadcaster.`}
      />
      <Suspense
        fallback={
          <Section title="All competitions">
            <RowSkeleton rows={6} />
          </Section>
        }
      >
        <LeagueList />
      </Suspense>
    </PageShell>
  )
}
