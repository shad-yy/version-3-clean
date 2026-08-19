import type { Metadata } from "next"
import ScoresPageClient from "./ScoresPageClient"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { generateSportsEventListSchema } from "@/lib/schema"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { ENV } from "@/lib/config/env"

export const metadata: Metadata = {
  title: "Live Scores & Results – Football Matches | Sightline",
  description:
    "Real-time football scores, live match updates, and recent results from Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.",
  keywords: "live scores, football scores, Premier League scores, La Liga results, real-time football",
  alternates: { canonical: `${ENV.BASE_URL}/scores` },
}

// Revalidate alongside the live-score TTL in PATTERNS.md §2.
export const revalidate = 30

export default async function ScoresPage() {
  // Server-rendered structured data for today's fixtures. Failure here must never
  // break the page — the client component fetches its own data independently.
  let listSchema: ReturnType<typeof generateSportsEventListSchema> | null = null
  try {
    const fixtures = await unifiedSportsAPI.getTodayFixtures()
    const usable = (fixtures || []).slice(0, 30).filter(f => f?.homeTeam && f?.awayTeam)

    if (usable.length > 0) {
      listSchema = generateSportsEventListSchema(
        usable.map(f => ({
          name: `${f.homeTeam} vs ${f.awayTeam}`,
          homeTeam: f.homeTeam,
          awayTeam: f.awayTeam,
          // Combine date + time when both are present so startDate is a real kick-off.
          date: f.date ? (f.time ? `${f.date}T${f.time.split("+")[0]}` : f.date) : undefined,
          league: f.league || "Football",
          venue: f.venue || undefined,
          url: f.id ? `${ENV.BASE_URL}/match/${f.id}` : `${ENV.BASE_URL}/scores`,
        })),
        "Today's Football Fixtures",
        `${ENV.BASE_URL}/scores`,
      )
    }
  } catch {
    // Data temporarily unavailable — render the page without the schema block.
  }

  return (
    <>
      {listSchema && <SchemaMarkup schema={listSchema} />}
      <ScoresPageClient />
    </>
  )
}
