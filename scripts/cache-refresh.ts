import * as fs from "fs"
import * as path from "path"

import {
  theSportsDB,
  clearTheSportsDbCache,
  getTheSportsDbCacheSnapshot,
  RateLimitError,
} from "../lib/api/the-sports-db"

const LEAGUE_IDS = ["4328", "4335", "4331", "4332"]
const OUTPUT_PATH = path.join(process.cwd(), "cache", "sportsdb_cache.json")

function determineCurrentSeason(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  // For leagues that span two calendar years, assume season starts in summer
  const seasonStartMonth = 7 // July
  const startYear = now.getUTCMonth() + 1 >= seasonStartMonth ? year : year - 1
  return `${startYear}-${startYear + 1}`
}

async function hydrateLeagueData(leagueId: string, season: string, today: string) {
  // League metadata
  const league = await theSportsDB.lookupLeague(leagueId)

  // Standings
  await theSportsDB.lookupTable(leagueId, season)

  // Upcoming & recent league events
  await Promise.all([
    theSportsDB.eventsNextLeague(leagueId),
    theSportsDB.eventsPastLeague(leagueId),
  ])

  // Season calendar for additional context
  await theSportsDB.eventsSeason({ leagueId, season })

  // Team + roster data
  if (league?.strLeague) {
    const teams = await theSportsDB.searchAllTeams({ league: league.strLeague })
    await Promise.all(
      teams.slice(0, 32).map(async (team) => {
        if (!team.idTeam) return
        await theSportsDB.lookupTeam(team.idTeam)
        await theSportsDB.lookupAllPlayers(team.idTeam)
        await theSportsDB.eventsNext(team.idTeam)
        await theSportsDB.eventsLast(team.idTeam)
      }),
    )
  }

  // Day-level snapshot (Soccer + Motorsport per requirements)
  await Promise.all([
    theSportsDB.eventsDay({ date: today, sport: "Soccer", league: leagueId }),
    theSportsDB.eventsDay({ date: today, sport: "Motorsport" }),
  ])
}

async function refreshCache() {
  const today = new Date().toISOString().split("T")[0]
  const season = determineCurrentSeason()

  clearTheSportsDbCache()

  for (const leagueId of LEAGUE_IDS) {
    try {
      await hydrateLeagueData(leagueId, season, today)
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`[cache-refresh] Rate limited while hydrating league ${leagueId}. Retrying after short delay.`)
        await new Promise((resolve) => setTimeout(resolve, 3500))
        await hydrateLeagueData(leagueId, season, today)
      } else {
        console.error(`[cache-refresh] Failed to hydrate league ${leagueId}:`, error)
      }
    }
  }

  const snapshot = getTheSportsDbCacheSnapshot()
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        season,
        leagues: LEAGUE_IDS,
        cache: snapshot,
      },
      null,
      2,
    ),
    "utf8",
  )

  console.log(`[cache-refresh] Cache refreshed for season ${season}. Output written to ${OUTPUT_PATH}`)
}

refreshCache().catch((error) => {
  console.error("[cache-refresh] Unexpected error:", error)
  process.exitCode = 1
})

