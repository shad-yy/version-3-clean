/**
 * Script to fetch all leagues and teams from TheSportsDB
 * Saves data to /data/sportsdb/*.json for local caching
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { theSportsDB } from '../lib/api/the-sports-db'

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123/'

interface LeagueData {
  idLeague: string
  strLeague: string
  strSport: string
  strCountry?: string
  strBadge?: string
  strLogo?: string
  intFormedYear?: string | number
}

interface TeamData {
  idTeam: string
  strTeam: string
  strLeague: string
  idLeague: string
  strCountry?: string
  strTeamBadge?: string
  strTeamLogo?: string
}

async function fetchAllData() {
  console.log('Starting TheSportsDB data fetch...\n')

  try {
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data', 'sportsdb')
    mkdirSync(dataDir, { recursive: true })

    // 1. Fetch all leagues
    console.log('Fetching all leagues...')
    const allLeagues = await theSportsDB.allLeagues()
    console.log(`   Found ${allLeagues.length} leagues`)

    // Save leagues
    const leaguesFile = join(dataDir, 'leagues.json')
    writeFileSync(leaguesFile, JSON.stringify(allLeagues, null, 2))
    console.log(`   Saved to ${leaguesFile}\n`)

    // 2. Group leagues by sport
    const leaguesBySport = new Map<string, LeagueData[]>()
    for (const league of allLeagues) {
      const sport = league.strSport || 'Unknown'
      if (!leaguesBySport.has(sport)) {
        leaguesBySport.set(sport, [])
      }
      leaguesBySport.get(sport)!.push(league)
    }

    // Save leagues by sport
    const leaguesBySportFile = join(dataDir, 'leagues-by-sport.json')
    const sportMap: Record<string, LeagueData[]> = {}
    for (const [sport, leagues] of leaguesBySport.entries()) {
      sportMap[sport] = leagues
    }
    writeFileSync(leaguesBySportFile, JSON.stringify(sportMap, null, 2))
    console.log(`   Saved leagues by sport to ${leaguesBySportFile}\n`)

    // 3. Fetch teams for major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
    const majorLeagues = [
      { name: 'English Premier League', id: '4328' },
      { name: 'Spanish La Liga', id: '4335' },
      { name: 'Italian Serie A', id: '4332' },
      { name: 'German Bundesliga', id: '4331' },
      { name: 'French Ligue 1', id: '4334' },
    ]

    const allTeams: TeamData[] = []
    const teamsByLeague: Record<string, TeamData[]> = {}

    console.log('Fetching teams for major leagues...')
    for (const league of majorLeagues) {
      try {
        console.log(`   Fetching teams for ${league.name}...`)
        const teams = await theSportsDB.searchAllTeams({ league: league.name })
        console.log(`   Found ${teams.length} teams for ${league.name}`)
        
        allTeams.push(...teams)
        teamsByLeague[league.id] = teams

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2500))
      } catch (error) {
        console.error(`   Error fetching teams for ${league.name}:`, error)
      }
    }

    // Save all teams
    const teamsFile = join(dataDir, 'teams.json')
    writeFileSync(teamsFile, JSON.stringify(allTeams, null, 2))
    console.log(`   Saved ${allTeams.length} teams to ${teamsFile}\n`)

    // Save teams by league
    const teamsByLeagueFile = join(dataDir, 'teams-by-league.json')
    writeFileSync(teamsByLeagueFile, JSON.stringify(teamsByLeague, null, 2))
    console.log(`   Saved teams by league to ${teamsByLeagueFile}\n`)

    // 4. Create a summary file with key league IDs
    const summary = {
      totalLeagues: allLeagues.length,
      totalTeams: allTeams.length,
      majorLeagues: majorLeagues.map(l => ({
        name: l.name,
        id: l.id,
        teamCount: teamsByLeague[l.id]?.length || 0,
      })),
      leaguesBySport: Object.fromEntries(
        Array.from(leaguesBySport.entries()).map(([sport, leagues]) => [
          sport,
          leagues.length,
        ])
      ),
      timestamp: new Date().toISOString(),
    }

    const summaryFile = join(dataDir, 'summary.json')
    writeFileSync(summaryFile, JSON.stringify(summary, null, 2))
    console.log(`   Saved summary to ${summaryFile}\n`)

    console.log('Data fetch completed successfully!')
    console.log(`\nSummary:`)
    console.log(`   - Leagues: ${allLeagues.length}`)
    console.log(`   - Teams: ${allTeams.length}`)
    console.log(`   - Sports: ${leaguesBySport.size}`)
    console.log(`\nAll data saved to: ${dataDir}/`)

  } catch (error) {
    console.error('Error fetching data:', error)
    process.exit(1)
  }
}

// Run the script
fetchAllData()

