#!/usr/bin/env tsx
/**
 * Static Data Hydration Script
 * 
 * Pre-fetches and caches static data (leagues, teams, players) on startup
 * to minimize API calls during runtime. This script should be run:
 * - On server startup (via npm script)
 * - Periodically via cron job (daily/weekly)
 * 
 * Strategy:
 * - Fetch all leagues once (30 day cache)
 * - Fetch popular league teams (30 day cache)
 * - Cache is stored in-memory and persists via Next.js fetch cache
 */

import { theSportsDB } from "../lib/api/the-sports-db"
import { unifiedSportsAPI } from "../lib/api/unified-sports-api"
import { POPULAR_LEAGUE_IDS } from "../lib/config"

async function hydrateStaticData() {
  console.log("[Hydration] Starting static data hydration...")
  const startTime = Date.now()

  try {
    // 1. Fetch all leagues (static data - cached for 30 days)
    console.log("[Hydration] Fetching all leagues...")
    const leagues = await unifiedSportsAPI.getLeagues()
    console.log(`[Hydration] Fetched ${leagues.length} leagues`)

    // 2. Fetch teams for popular leagues (static data - cached for 30 days)
    console.log("[Hydration] Fetching teams for popular leagues...")
    const popularLeagueIds = POPULAR_LEAGUE_IDS
    let totalTeams = 0

    for (const leagueId of popularLeagueIds) {
      try {
        const teams = await unifiedSportsAPI.getTeams(leagueId)
        totalTeams += teams.length
        console.log(`[Hydration] Fetched ${teams.length} teams for league ${leagueId}`)
      } catch (error) {
        console.warn(`[Hydration] Failed to fetch teams for league ${leagueId}:`, error)
      }
    }

    console.log(`[Hydration] Fetched ${totalTeams} total teams`)

    // 3. Fetch all sports (static data)
    console.log("[Hydration] Fetching all sports...")
    const sports = await theSportsDB.allSports()
    console.log(`[Hydration] Fetched ${sports.length} sports`)

    // 4. Fetch all countries (static data)
    console.log("[Hydration] Fetching all countries...")
    const countries = await theSportsDB.allCountries()
    console.log(`[Hydration] Fetched ${countries.length} countries`)

    const duration = Date.now() - startTime
    console.log(`[Hydration] Static data hydration complete in ${duration}ms`)
    console.log(`[Hydration] Summary: ${leagues.length} leagues, ${totalTeams} teams, ${sports.length} sports, ${countries.length} countries`)

  } catch (error) {
    console.error("[Hydration] Error during hydration:", error)
    process.exit(1)
  }
}

// Run hydration
if (require.main === module) {
  hydrateStaticData()
    .then(() => {
      console.log("[Hydration] Script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("[Hydration] Script failed:", error)
      process.exit(1)
    })
}

export { hydrateStaticData }

