import type { Metadata } from "next"
import { Suspense } from "react"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { ENV } from "@/lib/config/env"
import { SITE_NAME } from "@/lib/config/site-url"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { getViewerCountry, countryLabel } from "@/lib/geo/country"
import { resolveRights } from "@/lib/data/resolve-rights"
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
 * "What is on now" — deliberately not a live-scores page.
 *
 * The old page was a client component that fetched on mount, held tab state, and
 * rendered a card grid — so the scores were invisible to a crawler and the page had
 * nothing to say until JavaScript ran.
 *
 * This renders on the server. More importantly, **the score is not the point**. Scores
 * are a commodity owned by ESPN, the BBC and FlashScore, and competing with them there is
 * a fight we lose. What nobody answers well is "it is on — where do I watch it", so the
 * broadcaster is the headline of every row and the score is a detail within it.
 *
 * Naming matters here too: the page is "what is on now", not "live scores", so it does
 * not promise a product we are not trying to be.
 */

export const revalidate = 90

const TITLE = "What is on now"
const DESCRIPTION =
  "What is being shown right now and where to watch it. Today's matches with the broadcaster carrying each one in your country, where we have verified it."

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${ENV.BASE_URL}/scores` },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENV.BASE_URL}/scores`,
  }),
}

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  date: string
  time: string
  league: string
  isLive?: boolean
}

async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${ENV.BASE_URL}/api/scores/today`, { next: { revalidate: 90 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.matches ?? []
  } catch {
    return []
  }
}

/**
 * Turns an API status code into something a reader understands.
 *
 * The upstream reports in-play states as period codes -- "1H", "2H", "HT", "ET" -- and
 * the previous check only trusted its own `isLive` flag, which is not set for them. A
 * match in its first half was being shown as though it had not started.
 */
const IN_PLAY = new Set(["1H", "2H", "HT", "ET", "P", "BT", "LIVE"])
const FINISHED = new Set(["FT", "AET", "PEN", "MATCH FINISHED", "AWD", "WO"])

function statusLabel(m: Match): { lead: string; live: boolean } {
  const s = (m.status || "").toUpperCase().trim()
  if (m.isLive || IN_PLAY.has(s)) {
    return { lead: s === "HT" ? "HT" : s === "NS" ? "LIVE" : s, live: true }
  }
  if (FINISHED.has(s)) return { lead: "FT", live: false }
  return { lead: "", live: false }
}

async function ScoresList() {
  const matches = await getMatches()
  const viewerCountry = getViewerCountry()
  const countryText = countryLabel(viewerCountry)

  if (matches.length === 0) {
    return (
      <EmptyState title="No matches to show right now">
        Nothing is scheduled or in play at the moment. This is a real answer rather than a
        failure — when fixtures are on, they appear here with the broadcaster for{" "}
        {countryText} where we have verified one.
      </EmptyState>
    )
  }

  const live = matches.filter((m) => statusLabel(m).live)
  const rest = matches.filter((m) => !statusLabel(m).live)

  const render = (list: Match[]) => (
    <RowList>
      {list.map((m) => {
        const rights = resolveRights(m.league, viewerCountry)
        const forViewer = rights.countries.find((c) => c.code === viewerCountry)
        const broadcaster = forViewer?.listings?.[0]?.broadcaster ?? null
        const { lead, live: isLive } = statusLabel(m)
        const hasScore = m.homeScore !== null && m.awayScore !== null

        return (
          <Row
            key={m.id}
            href={`/match/${m.id}`}
            accent="sport"
            /* Lead is the match's state or its kick-off: "LIVE", "FT", or a time in the
               reader's own zone. The league already appears in the meta line, so
               repeating it truncated here was noise rather than information. */
            lead={
              lead ||
              (m.time ? (
                // The API returns UTC. Slicing the string would print UTC as though it
                // were the reader's local time -- the same defect fixed on the match
                // page. LocalTime renders UTC server-side then switches after mount.
                <LocalTime value={`${m.date}T${m.time.split("+")[0]}Z`} />
              ) : (
                "TBA"
              ))
            }
            leadSub={isLive ? "In play" : hasScore ? "Finished" : "Kick-off"}
            title={
              hasScore
                ? `${m.homeTeam} ${m.homeScore}–${m.awayScore} ${m.awayTeam}`
                : `${m.homeTeam} v ${m.awayTeam}`
            }
            meta={m.league}
            right={broadcaster ?? undefined}
            rightNote={broadcaster ? undefined : `Not verified in ${countryText}`}
          />
        )
      })}
    </RowList>
  )

  return (
    <>
      {live.length > 0 && (
        <Section
          title="Live now"
          aside={
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-sl-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-sl-mute">
                {live.length} in play
              </span>
            </span>
          }
          className="pb-0"
        >
          {render(live)}
        </Section>
      )}

      <Section title={live.length > 0 ? "Also today" : "Today"}>
        {rest.length > 0 ? (
          render(rest)
        ) : (
          <EmptyState title="Nothing else today">
            Every match we hold for today is already in play or finished.
          </EmptyState>
        )}
      </Section>
    </>
  )
}

export default function ScoresPage() {
  const countryText = countryLabel(getViewerCountry())

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${ENV.BASE_URL}/scores#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${ENV.BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Live scores", item: `${ENV.BASE_URL}/scores` },
    ],
  }

  return (
    <PageShell>
      <SchemaMarkup schema={breadcrumb} />
      <PageHeader
        eyebrow="On now"
        title="What is on right now"
        intro={`Matches under way and starting soon, and who is showing them in ${countryText} where we have verified a broadcaster.`}
      />
      <Suspense
        fallback={
          <Section title="Today">
            <RowSkeleton />
          </Section>
        }
      >
        <ScoresList />
      </Suspense>
    </PageShell>
  )
}
