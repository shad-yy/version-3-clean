// Script to refresh and update all team/league IDs from TheSportsDB
// This ensures we always use the latest IDs from the API

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { theSportsDB } from "@/lib/api/the-sports-db"

interface LeagueData {
  idLeague: string
  strLeague: string
  strSport: string
  strCountry: string
  strBadge?: string
  strLogo?: string
}

interface TeamData {
  idTeam: string
  strTeam: string
  strLeague: string
  strCountry: string
  strTeamBadge?: string
  strTeamLogo?: string
}

async function refreshSportsDbIds() {
  console.log("Starting SportsDB ID refresh...\n")

  try {
    const dataDir = join(process.cwd(), "data", "sportsdb")
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }

    // 1. Fetch all leagues
    console.log("Fetching all leagues...")
    const allLeagues = await theSportsDB.allLeagues()
    console.log(`   Found ${allLeagues.length} leagues`)

    // Save leagues
    const leaguesFile = join(dataDir, "leagues.json")
    writeFileSync(leaguesFile, JSON.stringify(allLeagues, null, 2))
    console.log(`   Saved to ${leaguesFile}\n`)

    // Group by sport
    const leaguesBySport: Record<string, LeagueData[]> = {}
    for (const league of allLeagues) {
      const sport = league.strSport || "Unknown"
      if (!leaguesBySport[sport]) {
        leaguesBySport[sport] = []
      }
      leaguesBySport[sport].push(league)
    }

    const leaguesBySportFile = join(dataDir, "leagues-by-sport.json")
    writeFileSync(leaguesBySportFile, JSON.stringify(leaguesBySport, null, 2))
    console.log(`   Saved leagues by sport to ${leaguesBySportFile}\n`)

    // 2. Fetch teams for all major leagues
    console.log("Fetching teams for major leagues...")
    const majorLeagues = [
      { name: "English Premier League", id: "4328" },
      { name: "Spanish La Liga", id: "4335" },
      { name: "Italian Serie A", id: "4332" },
      { name: "German Bundesliga", id: "4331" },
      { name: "French Ligue 1", id: "4334" },
    ]

    const allTeams: TeamData[] = []
    const teamsByLeague: Record<string, TeamData[]> = {}

    for (const league of majorLeagues) {
      try {
        const leagueInfo = await theSportsDB.lookupLeague(league.id)
        if (leagueInfo?.strLeague) {
          const teams = await theSportsDB.searchAllTeams({ league: leagueInfo.strLeague })
          console.log(`   Found ${teams.length} teams for ${league.name}`)
          
          teamsByLeague[league.id] = teams
          allTeams.push(...teams)
        }
      } catch (err) {
        console.warn(`   Failed to fetch teams for ${league.name}:`, err)
      }
    }

    // Save teams
    const teamsFile = join(dataDir, "teams.json")
    writeFileSync(teamsFile, JSON.stringify(allTeams, null, 2))
    console.log(`   Saved ${allTeams.length} teams to ${teamsFile}\n`)

    const teamsByLeagueFile = join(dataDir, "teams-by-league.json")
    writeFileSync(teamsByLeagueFile, JSON.stringify(teamsByLeague, null, 2))
    console.log(`   Saved teams by league to ${teamsByLeagueFile}\n`)

    // 3. Create summary
    const summary = {
      lastUpdated: new Date().toISOString(),
      leagues: {
        total: allLeagues.length,
        bySport: Object.keys(leaguesBySport).length,
        majorLeagueIds: majorLeagues.map((l) => l.id),
      },
      teams: {
        total: allTeams.length,
        byLeague: Object.keys(teamsByLeague).length,
      },
    }

    const summaryFile = join(dataDir, "summary.json")
    writeFileSync(summaryFile, JSON.stringify(summary, null, 2))
    console.log(`   Saved summary to ${summaryFile}\n`)

    console.log("SportsDB ID refresh completed successfully!")
    console.log(`\nSummary:`)
    console.log(`   - Leagues: ${allLeagues.length}`)
    console.log(`   - Sports: ${Object.keys(leaguesBySport).length}`)
    console.log(`   - Teams: ${allTeams.length}`)
    console.log(`   - Major Leagues: ${majorLeagues.length}`)
  } catch (error) {
    console.error("Error refreshing SportsDB IDs:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  refreshSportsDbIds()
}

export { refreshSportsDbIds }

