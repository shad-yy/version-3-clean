import { theSportsDB, RateLimitError, allSports as getAllSports } from "./the-sports-db"
import { swrGet } from "@/lib/cache"

/**
 * Current season in TheSportsDB format (`YYYY-YYYY`).
 *
 * European football seasons run August–May, so anything up to and including July
 * still belongs to the season that started the previous calendar year.
 *
 * Never hardcode a season string — it silently goes stale the moment the new
 * campaign kicks off. Always call this.
 */
export function getCurrentSeason(year?: number, now: Date = new Date()): string {
  if (year) return `${year}-${year + 1}`

  // getMonth() is 0-indexed: 7 === August.
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${startYear}-${startYear + 1}`
}

// Safely append /tiny to a TheSportsDB image URL without double-appending
/**
 * Append TheSportsDB's size suffix to a **badge or crest** URL.
 *
 * The API serves `/tiny`, `/small`, `/medium`, `/large` and `/preview` variants of badge
 * artwork. `/tiny` is right for the 18-32px crests this app renders in lists.
 *
 * **Do not use this for event artwork.** `strThumb`, `strPoster` and `strBanner` are
 * full-size promotional images used as backdrops; asking for a tiny variant of one gives a
 * blurred backdrop at best.
 */
function safeBadgeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
  return `${url}/tiny`
}
import type {
  SportsDbLeague as SportsDbLeagueType,
  SportsDbTeam as SportsDbTeamType,
  SportsDbPlayer as SportsDbPlayerType,
  SportsDbEvent as SportsDbEventType,
  SportsDbTable as SportsDbTableType,
} from "../types/sportsdb"

// Unified interfaces that match the existing app structure
export interface UnifiedLeague {
  id: string
  name: string
  country: string
  logo: string
  sport: string
  type: string
  description?: string
  formedYear?: string
  website?: string
}

export interface UnifiedTeam {
  id: string
  name: string
  logo: string
  /** Wide promotional artwork, if the provider has any. */
  fanart?: string
  country: string
  league?: string
  founded?: number
  sport: string
  stadium?: string
  stadiumThumb?: string
}

export interface UnifiedPlayer {
  id: string
  name: string
  team?: string
  position?: string
  nationality?: string
  age?: number
  photo?: string
  height?: string
  weight?: string
}

export interface UnifiedFixture {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  date: string
  time: string
  venue?: string
  league: string
  homeLogo?: string | null
  awayLogo?: string | null
  /**
   * Event artwork, used as a backdrop rather than a picture.
   *
   * Returned on the fixture itself, so it costs nothing extra. Frequently absent outside
   * the major competitions, which is why every consumer treats it as optional.
   */
  artwork?: string | null
  isLive: boolean
}

export interface UnifiedStanding {
  position: number
  team: string
  teamId: string
  teamLogo: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form?: string
  description?: string
}

// Transform TheSportsDB data to unified format
class UnifiedSportsAPI {
  // Cache league ID -> league name mapping to avoid lookupLeague calls
  private static LEAGUE_NAME_MAP: Record<string, string> = {
    '4328': 'English Premier League',
    '4335': 'Spanish La Liga',
    '4331': 'German Bundesliga',
    '4332': 'Italian Serie A',
    '4334': 'French Ligue 1',
  }

  // Transform leagues
  private transformLeague(league: SportsDbLeagueType): UnifiedLeague {
    return {
      id: league.idLeague,
      name: league.strLeague,
      country: league.strCountry || "Unknown",
      // Use API images only - no placeholder fallback
      logo: league.strBadge || league.strLogo || "",
      sport: league.strSport || "Soccer",
      type: "League",
      description: league.strDescriptionEN || undefined,
      formedYear: league.intFormedYear ? league.intFormedYear.toString() : undefined,
      // website: league.strWebsite - Not available on SportsDbLeague
    }
  }

  // Transform teams
  private transformTeam(team: SportsDbTeamType): UnifiedTeam {
    return {
      id: team.idTeam,
      name: team.strTeam,
      /*
       * Current field names first, legacy second.
       *
       * The endpoint renamed `strTeamBadge` to `strBadge`, so this resolved to "" for
       * every team on the site -- silently, because an empty string is a valid value and
       * the header simply rendered its placeholder. Both are read so the mapping keeps
       * working whichever generation a cached response came from.
       */
      logo:
        team.strBadge ||
        team.strLogo ||
        team.strTeamBadge ||
        team.strTeamLogo ||
        "",
      /** Wide artwork, for use as a page backdrop rather than a picture. */
      fanart: team.strFanart1 || team.strFanart2 || team.strBanner || undefined,
      country: team.strCountry || "Unknown",
      league: team.strLeague,
      founded: team.intFormedYear ? Number.parseInt(team.intFormedYear.toString()) : undefined,
      sport: team.strSport || "Soccer",
      stadium: team.strStadium || undefined,
      stadiumThumb: team.strStadiumThumb || undefined,
    }
  }

  // Transform players
  private transformPlayer(player: SportsDbPlayerType): UnifiedPlayer {
    const calculateAge = (dateBorn?: string): number | undefined => {
      if (!dateBorn) return undefined
      const birthDate = new Date(dateBorn)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

    return {
      id: player.idPlayer,
      name: player.strPlayer,
      team: player.strTeam,
      position: player.strPosition,
      nationality: player.strNationality,
      age: calculateAge(player.dateBorn),
      photo: player.strPlayerThumb || player.strCutout || player.strThumb || undefined,
      height: player.strHeight,
      weight: player.strWeight,
    }
  }

  // Transform events/fixtures
  private async transformFixture(
    event: SportsDbEventType,
    homeTeamData?: SportsDbTeamType,
    awayTeamData?: SportsDbTeamType,
  ): Promise<UnifiedFixture> {
    // Parse scores
    const homeScore = event.intHomeScore ? Number.parseInt(event.intHomeScore.toString()) : null
    const awayScore = event.intAwayScore ? Number.parseInt(event.intAwayScore.toString()) : null

    // Parse date and time
    const eventDate = event.dateEvent || event.strDate || ""
    const eventTime = event.strTime || event.strTimeLocal || ""

    // Get team logos from team data if available via API, or natively from event
    const homeLogo = safeBadgeUrl(event.strHomeTeamBadge) ?? safeBadgeUrl(homeTeamData?.strTeamBadge) ?? safeBadgeUrl(homeTeamData?.strTeamLogo)
    const awayLogo = safeBadgeUrl(event.strAwayTeamBadge) ?? safeBadgeUrl(awayTeamData?.strTeamBadge) ?? safeBadgeUrl(awayTeamData?.strTeamLogo)

    const status = event.strStatus || event.strResult || "Scheduled"
    return {
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore,
      awayScore,
      status,
      date: eventDate,
      time: eventTime,
      venue: event.strVenue,
      league: event.strLeague,
      // NOT safeBadgeUrl: that appends TheSportsDB's "/tiny" size suffix, which is right
      // for a 24px crest and wrong for a full-bleed backdrop. Event artwork is used at its
      // published size.
      artwork: event.strThumb || event.strPoster || null,
      homeLogo,
      awayLogo,
      isLive: status === "Live" || status === "HT" || status === "1H" || status === "2H",
    }
  }

  // Transform fixtures without team data (for bulk operations)
  private transformFixtureSync(event: SportsDbEventType): UnifiedFixture {
    const homeScore = event.intHomeScore ? Number.parseInt(event.intHomeScore.toString()) : null
    const awayScore = event.intAwayScore ? Number.parseInt(event.intAwayScore.toString()) : null

    const eventDate = event.dateEvent || event.strDate || ""
    const eventTime = event.strTime || event.strTimeLocal || ""

    const status = event.strStatus || event.strResult || "Scheduled"
    return {
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore,
      awayScore,
      status,
      date: eventDate,
      time: eventTime,
      venue: event.strVenue,
      league: event.strLeague,
      // Same artwork the async mapper carries. This is the path /events actually uses --
      // the two mappers had drifted, so the field existed on the type and was populated on
      // only one of them.
      artwork: event.strThumb || event.strPoster || null,
      homeLogo: safeBadgeUrl(event.strHomeTeamBadge),
      awayLogo: safeBadgeUrl(event.strAwayTeamBadge),
      isLive: status === "Live" || status === "HT" || status === "1H" || status === "2H",
    }
  }

  // Transform standings - TheSportsDB returns fields with int/str prefixes
  private transformStandings(table: SportsDbTableType[]): UnifiedStanding[] {
    return table.map((entry, index) => {
      // Handle both old format (rank, name) and new format (intRank, strTeam)
      const rank = entry.intRank
        ? typeof entry.intRank === 'string'
          ? parseInt(entry.intRank, 10)
          : entry.intRank
        : entry.rank || index + 1
      const teamName = entry.strTeam || entry.name || 'Unknown Team'
      const played = entry.intPlayed
        ? typeof entry.intPlayed === 'string'
          ? parseInt(entry.intPlayed, 10)
          : entry.intPlayed
        : entry.played || 0
      const won = entry.intWin
        ? typeof entry.intWin === 'string'
          ? parseInt(entry.intWin, 10)
          : entry.intWin
        : entry.win || 0
      const drawn = entry.intDraw
        ? typeof entry.intDraw === 'string'
          ? parseInt(entry.intDraw, 10)
          : entry.intDraw
        : entry.draw || 0
      const lost = entry.intLoss
        ? typeof entry.intLoss === 'string'
          ? parseInt(entry.intLoss, 10)
          : entry.intLoss
        : entry.loss || 0
      const goalsFor = entry.intGoalsFor
        ? typeof entry.intGoalsFor === 'string'
          ? parseInt(entry.intGoalsFor, 10)
          : entry.intGoalsFor
        : entry.goalsFor || 0
      const goalsAgainst = entry.intGoalsAgainst
        ? typeof entry.intGoalsAgainst === 'string'
          ? parseInt(entry.intGoalsAgainst, 10)
          : entry.intGoalsAgainst
        : entry.goalsAgainst || 0
      const goalDifference = entry.intGoalDifference
        ? typeof entry.intGoalDifference === 'string'
          ? parseInt(entry.intGoalDifference, 10)
          : entry.intGoalDifference
        : entry.goalDifference || 0
      const points = entry.intPoints
        ? typeof entry.intPoints === 'string'
          ? parseInt(entry.intPoints, 10)
          : entry.intPoints
        : entry.points || 0

      return {
        position: rank,
        team: teamName,
        teamId: entry.idTeam,
        teamLogo: safeBadgeUrl(entry.strTeamBadge) ?? safeBadgeUrl(entry.strBadge) ?? '',
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form: entry.strForm || undefined,
        description: entry.strDescription || undefined,
      }
    })
  }

  // Helper to get season string in TheSportsDB format (YYYY-YYYY)
  // For most leagues, season runs from August to May, so in December 2024, we're in 2024-2025 season
  getSeasonString(year?: number): string {
    return getCurrentSeason(year)
  }

  // Public API methods
  async getSports(): Promise<string[]> {
    try {
      const sports = await getAllSports()
      return sports.map((sport) => sport.strSport).filter((sport): sport is string => !!sport)
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching sports:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getUpcomingFixtures(params?: { leagueId?: string; teamId?: string; sport?: string; limit?: number }): Promise<UnifiedFixture[]> {
    try {
      // Smart upcoming events logic:
      // 1. If leagueId provided, use eventsNextLeague
      // 2. If teamId provided, use eventsNext
      // 3. If sport provided, get all leagues for that sport, then get upcoming events
      // 4. Otherwise, get upcoming events from popular leagues

      const limit = params?.limit || 20
      let allUpcoming: UnifiedFixture[] = []

      if (params?.leagueId) {
        const events = await theSportsDB.eventsNextLeague(params.leagueId)
        allUpcoming = events.slice(0, limit).map((event) => this.transformFixtureSync(event))
      } else if (params?.teamId) {
        const events = await theSportsDB.eventsNext(params.teamId)
        allUpcoming = events.slice(0, limit).map((event) => this.transformFixtureSync(event))
      } else if (params?.sport) {
        // Get leagues for this sport, then get upcoming events from each
        const leagues = await this.getLeagues(undefined, params.sport)
        const popularLeagues = leagues.slice(0, 5) // Limit to top 5 leagues per sport

        const eventsPromises = popularLeagues.map(league =>
          theSportsDB.eventsNextLeague(league.id).catch(() => [])
        )
        const eventsArrays = await Promise.all(eventsPromises)
        allUpcoming = eventsArrays.flat().slice(0, limit).map((event) => this.transformFixtureSync(event))
      } else {
        // Get upcoming from popular leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
        const popularLeagueIds = ["4328", "4335", "4332", "4331", "4334"]
        const eventsPromises = popularLeagueIds.map(id =>
          theSportsDB.eventsNextLeague(id).catch(() => [])
        )
        const eventsArrays = await Promise.all(eventsPromises)
        allUpcoming = eventsArrays.flat().slice(0, limit).map((event) => this.transformFixtureSync(event))
      }

      // Sort by date (earliest first)
      return allUpcoming.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime()
        const dateB = new Date(`${b.date}T${b.time}`).getTime()
        return dateA - dateB
      })
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching upcoming fixtures:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getLeagues(country?: string, sport?: string): Promise<UnifiedLeague[]> {
    const cacheKey = `leagues:featured:${country ?? ''}:${sport ?? ''}`
    const TTL_LEAGUES = 86_400 // 24 hours — league metadata rarely changes
    try {
      return await swrGet<UnifiedLeague[]>(
        cacheKey,
        async () => {
          const FEATURED_LEAGUES = [
            { id: '4328', name: 'English Premier League', country: 'England', sport: 'Soccer' },
            { id: '4335', name: 'Spanish La Liga', country: 'Spain', sport: 'Soccer' },
            { id: '4331', name: 'German Bundesliga', country: 'Germany', sport: 'Soccer' },
            { id: '4332', name: 'Italian Serie A', country: 'Italy', sport: 'Soccer' },
            { id: '4334', name: 'French Ligue 1', country: 'France', sport: 'Soccer' },
          ]
          const leaguePromises = FEATURED_LEAGUES.map(l => theSportsDB.lookupLeague(l.id))
          const fetchedLeagues = await Promise.all(leaguePromises)
          const validLeagues = fetchedLeagues.filter((l): l is NonNullable<typeof l> => l !== null)
          return validLeagues.map((league) => this.transformLeague(league))
        },
        TTL_LEAGUES,
      )
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching leagues:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getTeams(leagueId?: string, season?: number): Promise<UnifiedTeam[]> {
    try {
      if (leagueId) {
        // Try to get league name from static map first
        let leagueName = UnifiedSportsAPI.LEAGUE_NAME_MAP[leagueId]

        if (!leagueName) {
          // Fallback to API lookup for unknown leagues
          const league = await theSportsDB.lookupLeague(leagueId)
          if (!league?.strLeague) return []
          leagueName = league.strLeague
          // Cache for future use
          UnifiedSportsAPI.LEAGUE_NAME_MAP[leagueId] = leagueName
        }

        const teamsByName = await theSportsDB.searchAllTeams({ league: leagueName })
        return teamsByName.map((team) => this.transformTeam(team))
      }
      // If no leagueId, return empty or search by sport
      return []
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching teams:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getTeam(teamId: string): Promise<UnifiedTeam | null> {
    try {
      const team = await theSportsDB.lookupTeam(teamId)
      return team ? this.transformTeam(team) : null
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching team:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return null
    }
  }

  async getPlayers(teamId?: string, leagueId?: string, season?: number): Promise<UnifiedPlayer[]> {
    try {
      if (teamId) {
        const players = await theSportsDB.getAllPlayersInTeam(teamId)
        return players.map((player) => this.transformPlayer(player))
      }
      // If no teamId, return empty
      return []
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching players:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getPlayer(playerId: string): Promise<UnifiedPlayer | null> {
    try {
      const player = await theSportsDB.lookupPlayer(playerId)
      return player ? this.transformPlayer(player) : null
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching player:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return null
    }
  }

  async getFixtures(
    params: {
      leagueId?: string
      teamId?: string
      date?: string
      sport?: string
      live?: boolean
      last?: number
      next?: number
      season?: number
    } = {},
  ): Promise<UnifiedFixture[]> {
    try {
      if (params.date) {
        const events = await theSportsDB.eventsDay({
          date: params.date,
          sport: params.sport ?? "Soccer",
          league: params.leagueId,
        })
        return events.map((event) => this.transformFixtureSync(event))
      }

      if (params.leagueId) {
        if (params.last) {
          const events = await theSportsDB.eventsPastLeague(params.leagueId)
          return events.slice(0, params.last).map((event) => this.transformFixtureSync(event))
        }
        if (params.next) {
          const events = await theSportsDB.eventsNextLeague(params.leagueId)
          return events.slice(0, params.next).map((event) => this.transformFixtureSync(event))
        }

        const seasonStr = params.season ? this.getSeasonString(params.season) : this.getSeasonString()
        const events = await theSportsDB.eventsSeason({ leagueId: params.leagueId, season: seasonStr })
        return events.map((event) => this.transformFixtureSync(event))
      }

      if (params.teamId) {
        if (params.next) {
          const events = await theSportsDB.eventsNext(params.teamId)
          return events.slice(0, params.next).map((event) => this.transformFixtureSync(event))
        }
        if (params.last) {
          const events = await theSportsDB.eventsLast(params.teamId)
          return events.slice(0, params.last).map((event) => this.transformFixtureSync(event))
        }
        // Get both next and last
        const [nextEvents, lastEvents] = await Promise.all([
          theSportsDB.eventsNext(params.teamId),
          theSportsDB.eventsLast(params.teamId),
        ])
        return [...nextEvents, ...lastEvents].map((event) => this.transformFixtureSync(event))
      }

      return []
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching fixtures:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async getFixture(fixtureId: string): Promise<UnifiedFixture | null> {
    try {
      const event = await theSportsDB.lookupEvent(fixtureId)
      if (!event) return null

      // Fetch team data for logos
      const [homeTeam, awayTeam] = await Promise.all([
        event.idHomeTeam ? theSportsDB.lookupTeam(event.idHomeTeam).catch(() => null) : Promise.resolve(null),
        event.idAwayTeam ? theSportsDB.lookupTeam(event.idAwayTeam).catch(() => null) : Promise.resolve(null),
      ])

      return this.transformFixture(event, homeTeam || undefined, awayTeam || undefined)
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching fixture:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return null
    }
  }

  async getStandings(leagueId: string, season?: number): Promise<UnifiedStanding[]> {
    try {
      // Get current season if not provided (format: YYYY-YYYY+1)
      const seasonStr = season ? `${season}-${season + 1}` : this.getSeasonString()
      const table = await theSportsDB.lookupTable(leagueId, seasonStr)
      return this.transformStandings(table)
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching standings:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  // REMOVED: getLiveFixtures() - Live features are not supported by TheSportsDB API
  // Use getTodayFixtures() or getFixtures({ date: today }) instead

  async searchTeams(query: string): Promise<UnifiedTeam[]> {
    try {
      const teams = await theSportsDB.searchTeams(query)
      return teams.slice(0, 20).map((team) => this.transformTeam(team))
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error searching teams:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async searchPlayers(query: string): Promise<UnifiedPlayer[]> {
    try {
      const players = await theSportsDB.searchPlayers(query)
      return players.slice(0, 20).map((player) => this.transformPlayer(player))
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error searching players:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  async searchAll(query: string): Promise<{
    teams: UnifiedTeam[]
    players: UnifiedPlayer[]
    events: UnifiedFixture[]
  }> {
    try {
      const [teams, players, events] = await Promise.allSettled([
        this.searchTeams(query),
        this.searchPlayers(query),
        this.searchEvents(query),
      ])

      return {
        teams: teams.status === "fulfilled" ? teams.value : [],
        players: players.status === "fulfilled" ? players.value : [],
        events: events.status === "fulfilled" ? events.value : [],
      }
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error in comprehensive search:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return { teams: [], players: [], events: [] }
    }
  }

  async searchEvents(query: string): Promise<UnifiedFixture[]> {
    try {
      const events = await theSportsDB.searchEvents(query)
      return events.slice(0, 15).map((event) => this.transformFixtureSync(event))
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error searching events:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  // Get API usage statistics
  getApiUsage() {
    return theSportsDB.getMetrics()
  }

  // Clear cache (not applicable for TheSportsDB, but keep for compatibility)
  clearCache() {
    // TheSportsDB uses Next.js fetch caching, no manual cache clearing needed
    console.log("[UnifiedSportsAPI] Cache clearing not needed for TheSportsDB")
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const startTime = Date.now()
      const result = await theSportsDB.testConnection()
      const responseTime = Date.now() - startTime

      return {
        success: result.success,
        message: result.message,
        details: {
          responseTime: result.responseTime,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.warn("[UnifiedSportsAPI] API connection test failed:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async getTodayFixtures(): Promise<UnifiedFixture[]> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const events = await theSportsDB.eventsDay({ date: today, sport: "Soccer" })
      return events.map((event) => this.transformFixtureSync(event))
    } catch (error) {
      console.warn("[UnifiedSportsAPI] Error fetching today's fixtures:", error)
      if (error instanceof RateLimitError) {
        throw error
      }
      return []
    }
  }

  /**
   * Fetch recent results from popular league past-event endpoints.
   *
   * OLD APPROACH: 7 x eventsDay() calls = 7 API requests per page load.
   * NEW APPROACH: 5 x eventsPastLeague() calls cached for 5 min via SWR,
   *   reducing live API requests by ~85 % while still serving fresh data.
   */
  async getRecentResults(): Promise<UnifiedFixture[]> {
    const RECENT_RESULTS_TTL = 300 // 5 minutes — short enough to feel fresh, long enough to cache

    return swrGet<UnifiedFixture[]>(
      "unified:recent-results",
      async () => {
        try {
          // Parallel fetch from top 5 leagues using eventsPastLeague (1 call per league)
          const popularLeagueIds = ["4328", "4335", "4332", "4331", "4334"]
          const eventArrays = await Promise.allSettled(
            popularLeagueIds.map((id) => theSportsDB.eventsPastLeague(id)),
          )

          const allEvents = eventArrays.flatMap((r) =>
            r.status === "fulfilled" ? r.value : [],
          )

          // Keep only finished matches with a date in the last 14 days
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - 14)

          const recent = allEvents
            .filter((event) => {
              const isFinished =
                event.strStatus === "Match Finished" ||
                event.strStatus === "FT" ||
                event.strResult !== null
              const eventDate = event.dateEvent ? new Date(event.dateEvent) : null
              return isFinished && eventDate && eventDate >= cutoff
            })
            .map((event) => this.transformFixtureSync(event))

          return recent
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 40)
        } catch (error) {
          console.warn("[UnifiedSportsAPI] Error fetching recent results:", error)
          if (error instanceof RateLimitError) throw error
          return []
        }
      },
      RECENT_RESULTS_TTL,
    )
  }
}

export const unifiedSportsAPI = new UnifiedSportsAPI()

// Add testConnection as a static method
unifiedSportsAPI.testConnection = UnifiedSportsAPI.prototype.testConnection

export { UnifiedSportsAPI as UnifiedSportsApi }
export default unifiedSportsAPI
