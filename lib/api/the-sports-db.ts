// TheSportsDB API v1 - Complete Implementation
// Base URL: https://www.thesportsdb.com/api/v1/json/123/
// Documentation source: Sportsdb API documentation.json

import { errorLogger } from "@/lib/admin/error-logger"
import { getCache, setCache, cache, swrGet } from "@/lib/cache"

const API_KEY = process.env.THESPORTSDB_API_KEY || "123"
const typeofWindow = typeof window !== "undefined"
const BASE_URL = typeofWindow ? "/api/thesportsdb/" : `https://www.thesportsdb.com/api/v1/json/${API_KEY}/`

// Rate limiting: 25 req/min (safer than 30 limit, with buffer)
// 60 seconds / 25 requests = 2400ms between requests
const RATE_LIMIT_MS = 2400
let lastRequestTime = 0
let rateLimitQueue: Promise<void> = Promise.resolve()
let queueLock = false

// Circuit breaker: track consecutive 429s
const circuitBreaker = new Map<string, { failures: number; lastFailure: number }>()
const CIRCUIT_BREAKER_THRESHOLD = 5
const CIRCUIT_BREAKER_RESET_MS = 60000 // 1 minute

// Track request statistics
let requestStats = {
  total: 0,
  cached: 0,
  deduplicated: 0,
  rateLimited: 0,
}

// Log stats every 10 requests
function logRequestStats() {
  if (requestStats.total > 0 && requestStats.total % 10 === 0) {
    console.log('[TheSportsDB] Request Stats:', {
      total: requestStats.total,
      cached: requestStats.cached,
      deduplicated: requestStats.deduplicated,
      rateLimited: requestStats.rateLimited,
      cacheHitRate: `${((requestStats.cached / requestStats.total) * 100).toFixed(1)}%`,
    })
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function enqueueRateLimit() {
  // Wait for lock to be released
  while (queueLock) {
    await sleep(10)
  }

  queueLock = true

  try {
    const run = async () => {
      const now = Date.now()
      const elapsed = now - lastRequestTime
      if (elapsed < RATE_LIMIT_MS) {
        await sleep(RATE_LIMIT_MS - elapsed)
      }
      lastRequestTime = Date.now()
    }

    rateLimitQueue = rateLimitQueue.then(run, run)
    await rateLimitQueue
  } finally {
    queueLock = false
  }
}

function checkCircuitBreaker(endpoint: string): boolean {
  const breaker = circuitBreaker.get(endpoint)
  if (!breaker) return true

  // Reset if enough time has passed
  if (Date.now() - breaker.lastFailure > CIRCUIT_BREAKER_RESET_MS) {
    circuitBreaker.delete(endpoint)
    return true
  }

  // Block if too many failures
  return breaker.failures < CIRCUIT_BREAKER_THRESHOLD
}

function recordCircuitBreakerFailure(endpoint: string) {
  const breaker = circuitBreaker.get(endpoint) || { failures: 0, lastFailure: 0 }
  breaker.failures++
  breaker.lastFailure = Date.now()
  circuitBreaker.set(endpoint, breaker)
}

function resetCircuitBreaker(endpoint: string) {
  circuitBreaker.delete(endpoint)
}

// Log API key status on module load
if (!process.env.THESPORTSDB_API_KEY) {
  console.warn('[TheSportsDB] THESPORTSDB_API_KEY not set, using free tier fallback "123"')
}

interface TheSportsDBResponse<T> {
  [key: string]: T[] | null
}

interface SportsDBFetchResult {
  ok: boolean
  status: number
  url: string
  body: unknown
  error?: string
}

// Caching TTLs optimized for free tier API usage
const TTL = {
  leagueInfo: 86400, // 24 hours
  standings: 300,    // 5 minutes
  teamInfo: 86400,   // 24 hours
  playerInfo: 86400, // 24 hours
  events: 30,        // 30 seconds
  search: 300,       // 5 minutes
  list: 300,         // 5 minutes
  misc: 3600,
  eventsDay: 30,     // 30 seconds
}

function getCached<T>(key: string): T | null {
  return getCache<T>(key)
}

function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  if (ttlSeconds <= 0) return
  setCache(key, data, ttlSeconds)
}

let requestCount = 0

// Request deduplication map
const inflightRequests = new Map<string, Promise<any>>()

function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // If request is already in-flight, return existing promise
  if (inflightRequests.has(key)) {
    requestStats.deduplicated++
    return inflightRequests.get(key)!
  }

  // Create new request
  const promise = fetcher().finally(() => {
    // Remove from in-flight map when complete
    inflightRequests.delete(key)
  })

  inflightRequests.set(key, promise)
  return promise
}

// Unified fetch wrapper with retries and exponential backoff
// Enhanced to handle full endpoint paths or relative paths
async function sportsdbFetch(
  endpoint: string,
  params: Record<string, string | number> = {},
  retryCount = 0,
): Promise<SportsDBFetchResult> {
  // If endpoint already includes full URL, use it; otherwise construct from BASE_URL
  let url: URL
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = new URL(endpoint)
  } else {
    const base = typeof window !== "undefined" ? window.location.origin + BASE_URL : BASE_URL
    url = new URL(endpoint, base)
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  // Check circuit breaker
  if (!checkCircuitBreaker(endpoint)) {
    return {
      ok: false,
      status: 429,
      url: url.toString(),
      body: null,
      error: 'Circuit breaker open - too many rate limit errors',
    }
  }

  // Mask API key in logs — full redaction, do not leak any key characters
  const masked = url.toString().replace(/(json\/).+?(\/)/, '$1***REDACTED***$2')
  if (retryCount === 0) {
    console.log('[TheSportsDB] REQUEST', masked)
  } else {
    console.log(`[TheSportsDB] RETRY ${retryCount + 1}/2`, masked)
  }

  try {
    await enqueueRateLimit()
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:120.0)',
      },
      cache: 'no-store',
    })

    const text = await res.text()
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      // Not JSON — log via errorLogger (async, non-blocking)
      errorLogger.logWarning(
        `Non-JSON response from ${url.toString()}: ${text.substring(0, 200)}`,
        'TheSportsDB',
        { endpoint, status: res.status },
      )
      body = text.substring(0, 2000)
    }

    if (!res.ok) {
      // Don't retry 429 (rate limit) - fail immediately
      if (res.status === 429) {
        recordCircuitBreakerFailure(endpoint)
        requestStats.rateLimited++
        console.warn(`[TheSportsDB] Rate limit exceeded for ${endpoint}`, { endpoint, status: 429 })
        // Don't retry - return immediately
        return { ok: false, status: 429, url: url.toString(), body: null, error: 'Rate limit exceeded' }
      }

      // Retry only server errors (5xx)
      if (res.status >= 500 && retryCount < 2) {
        const backoffMs = [200, 600, 1800][retryCount]
        await sleep(backoffMs)
        return sportsdbFetch(endpoint, params, retryCount + 1)
      }

      console.warn(`[TheSportsDB] ${endpoint} HTTP ${res.status}`)
    } else {
      // Success - reset circuit breaker
      resetCircuitBreaker(endpoint)
    }

    return { ok: res.ok, status: res.status, url: url.toString(), body }
  } catch (err) {
    // Retry on network errors
    if (retryCount < 2) {
      const backoffMs = [200, 600, 1800][retryCount]
      await sleep(backoffMs)
      return sportsdbFetch(endpoint, params, retryCount + 1)
    }

    const errorMsg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 0, url: url.toString(), body: null, error: errorMsg }
  }
}
export { sportsdbFetch }

class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

interface RequestOptions {
  cacheTTL?: number
  expectedKey?: string // Expected top-level key in response (e.g., 'teams', 'leagues', 'events')
  validateShape?: boolean
}

async function fetchFreshData<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T[]> {
  const { expectedKey, validateShape = true } = options
  const result = await sportsdbFetch(endpoint)

  if (!result.ok) {
    const startTime = Date.now()
    errorLogger.logApiCall(endpoint, result.status, Date.now() - startTime, { error: result.error })

    if (result.status === 429) {
      requestStats.rateLimited++
      errorLogger.logWarning(`Rate limit exceeded for ${endpoint}`, "TheSportsDB", { endpoint, status: 429 })
      throw new RateLimitError(`Rate limit exceeded for ${endpoint}. Please wait before retrying.`)
    }
    if (result.status === 404) {
      errorLogger.logWarning(`404 Not Found: ${endpoint}`, "TheSportsDB", { endpoint, status: 404 })
      console.warn(`[TheSportsDB] 404 Not Found: ${endpoint}`)
      return []
    }
    errorLogger.logError(
      new Error(`HTTP ${result.status}: ${result.error || 'Unknown error'}`),
      "TheSportsDB",
      { endpoint, status: result.status, error: result.error }
    )
    console.warn(`[TheSportsDB] Error ${result.status} for ${endpoint}: ${result.error || 'Unknown error'}`)
    return []
  }

  const startTime = Date.now()
  errorLogger.logApiCall(endpoint, result.status || 200, Date.now() - startTime)

  const json = result.body as TheSportsDBResponse<T>
  if (!json || typeof json !== 'object') {
    console.warn(`[TheSportsDB] Unexpected response shape for ${endpoint}`)
    return []
  }

  if (validateShape && expectedKey) {
    if (!(expectedKey in json)) {
      // Log via errorLogger — async, does not block the event loop
      errorLogger.logWarning(
        `Invalid response shape for ${endpoint}. Expected key '${expectedKey}' not found. Actual keys: ${Object.keys(json).join(', ')}`,
        'TheSportsDB',
        { endpoint, expectedKey, actualKeys: Object.keys(json) },
      )
      return []
    }
  }

  let resultArray: T[] | null = null
  if (expectedKey && expectedKey in json) {
    resultArray = json[expectedKey] as T[] | null
  } else {
    const firstKey = Object.keys(json)[0]
    resultArray = json[firstKey] ?? null
  }

  return Array.isArray(resultArray) ? resultArray : []
}

async function makeRequest<T>(
  endpoint: string,
  ttlSeconds = 0,
  options: RequestOptions = {},
): Promise<T[]> {
  requestCount++
  requestStats.total++
  logRequestStats()

  const cacheKey = `api:${endpoint}`

  if (ttlSeconds <= 0) {
    return deduplicateRequest(cacheKey, async () => {
      return fetchFreshData<T>(endpoint, options)
    })
  }

  return swrGet<T[]>(
    cacheKey,
    async () => {
      return deduplicateRequest(cacheKey, async () => {
        return fetchFreshData<T>(endpoint, options)
      })
    },
    ttlSeconds
  )
}

// Normalization utilities
function normalizeDate(dateStr?: string): string {
  if (!dateStr) return ''
  // If already in YYYY-MM-DD, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // Try to parse and normalize
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toISOString().split('T')[0]
}

// Export all types
export type {
  SportsDbSport,
  SportsDbCountry,
  SportsDbLeague,
  SportsDbSeason,
  SportsDbTeam,
  SportsDbPlayer,
  SportsDbEvent,
  SportsDbEventStat,
  SportsDbLineupPlayer,
  SportsDbEventTimeline,
  SportsDbTable,
  SportsDbVenue,
  SportsDbTV,
  SportsDbHighlight,
  SportsDbEquipment,
  SportsDbHonour,
  SportsDbFormerTeam,
  SportsDbMilestone,
  SportsDbContract,
  SportsDbPlayerResult,
  SportsDbEventResult,
} from '../types/sportsdb'

// Import types for use
import type {
  SportsDbSport,
  SportsDbCountry,
  SportsDbLeague,
  SportsDbSeason,
  SportsDbTeam,
  SportsDbPlayer,
  SportsDbEvent,
  SportsDbEventStat,
  SportsDbLineupPlayer,
  SportsDbEventTimeline,
  SportsDbTable,
  SportsDbVenue,
  SportsDbTV,
  SportsDbHighlight,
  SportsDbEquipment,
  SportsDbHonour,
  SportsDbFormerTeam,
  SportsDbMilestone,
  SportsDbContract,
  SportsDbPlayerResult,
  SportsDbEventResult,
} from '../types/sportsdb'

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

export async function searchTeams(teamName: string): Promise<SportsDbTeam[]> {
  if (!teamName || teamName.trim().length === 0) {
    throw new Error('Team name cannot be empty')
  }
  return makeRequest<SportsDbTeam>(`searchteams.php?t=${encodeURIComponent(teamName.trim())}`, TTL.search, {
    expectedKey: 'teams',
  })
}

export async function searchPlayers(playerName: string): Promise<SportsDbPlayer[]> {
  if (!playerName || playerName.trim().length === 0) {
    throw new Error('Player name cannot be empty')
  }
  return makeRequest<SportsDbPlayer>(`searchplayers.php?p=${encodeURIComponent(playerName.trim())}`, TTL.search, {
    expectedKey: 'player',
  })
}

export async function searchEvents(params: {
  eventTitle?: string
  season?: string
  date?: string
  filename?: string
} | string): Promise<SportsDbEvent[]> {
  if (typeof params === 'string') {
    // Simple string search
    return makeRequest<SportsDbEvent>(`searchevents.php?e=${encodeURIComponent(params)}`, TTL.search)
  }
  const searchParams = new URLSearchParams()
  if (params.eventTitle) searchParams.append('e', params.eventTitle)
  if (params.season) searchParams.append('s', params.season)
  if (params.date) searchParams.append('d', params.date)
  if (params.filename) searchParams.append('f', params.filename)
  const query = searchParams.toString()
  return makeRequest<SportsDbEvent>(`searchevents.php?${query}`, TTL.search)
}

export async function searchVenues(venueName: string): Promise<SportsDbVenue[]> {
  return makeRequest<SportsDbVenue>(`searchvenues.php?v=${encodeURIComponent(venueName)}`, TTL.search)
}

export async function searchLeagues(leagueName: string): Promise<SportsDbLeague[]> {
  return makeRequest<SportsDbLeague>(`searchleagues.php?l=${encodeURIComponent(leagueName)}`, TTL.search)
}

export async function searchAllLeagues(params?: {
  country?: string
  sport?: string
}): Promise<SportsDbLeague[]> {
  const searchParams = new URLSearchParams()
  if (params?.country) searchParams.append('c', params.country)
  if (params?.sport) searchParams.append('s', params.sport)
  const query = searchParams.toString()
  return makeRequest<SportsDbLeague>(`search_all_leagues.php${query ? `?${query}` : ''}`, TTL.list)
}

// ============================================================================
// LOOKUP / ID ENDPOINTS
// ============================================================================

export async function lookupLeague(leagueId: string): Promise<SportsDbLeague | null> {
  // Validate leagueId is numeric
  if (!/^\d+$/.test(leagueId)) {
    throw new Error(`Invalid leagueId: ${leagueId}. Must be numeric.`)
  }
  const leagues = await makeRequest<SportsDbLeague>(`lookupleague.php?id=${leagueId}`, TTL.leagueInfo, {
    expectedKey: 'leagues',
  })
  return leagues[0] ?? null
}

export async function lookupTable(leagueId: string, season: string): Promise<SportsDbTable[]> {
  // Validate leagueId is numeric
  if (!/^\d+$/.test(leagueId)) {
    throw new Error(`Invalid leagueId: ${leagueId}. Must be numeric.`)
  }

  // Season is required per TheSportsDB docs
  if (!season) {
    throw new Error('Season parameter is required for lookuptable.php')
  }

  // Validate season format: YYYY-YYYY
  if (!/^\d{4}-\d{4}$/.test(season)) {
    throw new Error(`Invalid season format: ${season}. Must be YYYY-YYYY (e.g., 2024-2025)`)
  }

  const endpoint = `lookuptable.php?l=${leagueId}&s=${encodeURIComponent(season)}`
  return makeRequest<SportsDbTable>(endpoint, TTL.standings, { expectedKey: 'table' })
}

export async function lookupTeam(teamId: string): Promise<SportsDbTeam | null> {
  // Validate teamId is numeric
  if (!/^\d+$/.test(teamId)) {
    throw new Error(`Invalid teamId: ${teamId}. Must be numeric.`)
  }

  // WORKAROUND for "123" test key specifically returning Arsenal (133604) for all lookupteam calls
  const primaryLeagues = ["English Premier League", "Spanish La Liga", "German Bundesliga", "Italian Serie A", "French Ligue 1"];
  for (const league of primaryLeagues) {
    try {
      const teams = await makeRequest<SportsDbTeam>(`search_all_teams.php?l=${encodeURIComponent(league)}`, TTL.list, { expectedKey: 'teams' })
      const found = teams.find(t => t.idTeam === teamId)
      if (found) return found
    } catch { }
  }

  // Fallback to actual lookup
  const teams = await makeRequest<SportsDbTeam>(`lookupteam.php?id=${teamId}`, TTL.teamInfo, { expectedKey: 'teams' })
  return teams[0] ?? null
}

export async function lookupEquipment(teamId: string): Promise<SportsDbEquipment[]> {
  return makeRequest<SportsDbEquipment>(`lookupequipment.php?id=${teamId}`, TTL.teamInfo)
}

export async function lookupPlayer(playerId: string): Promise<SportsDbPlayer | null> {
  // Validate playerId is numeric
  if (!/^\d+$/.test(playerId)) {
    throw new Error(`Invalid playerId: ${playerId}. Must be numeric.`)
  }
  // TheSportsDB API returns 'players' (plural) array, not 'player' (singular)
  const players = await makeRequest<SportsDbPlayer>(`lookupplayer.php?id=${playerId}`, TTL.playerInfo, {
    expectedKey: 'players', // Changed from 'player' to 'players'
  })
  return players[0] ?? null
}

export async function lookupHonours(playerId: string): Promise<SportsDbHonour[]> {
  return makeRequest<SportsDbHonour>(`lookuphonours.php?id=${playerId}`, TTL.playerInfo)
}

export async function lookupFormerTeams(playerId: string): Promise<SportsDbFormerTeam[]> {
  return makeRequest<SportsDbFormerTeam>(`lookupformerteams.php?id=${playerId}`, TTL.playerInfo)
}

export async function lookupMilestones(playerId: string): Promise<SportsDbMilestone[]> {
  return makeRequest<SportsDbMilestone>(`lookupmilestones.php?id=${playerId}`, TTL.playerInfo)
}

export async function lookupContracts(playerId: string): Promise<SportsDbContract[]> {
  return makeRequest<SportsDbContract>(`lookupcontracts.php?id=${playerId}`, TTL.playerInfo)
}

export async function playerResults(playerId: string): Promise<SportsDbPlayerResult[]> {
  return makeRequest<SportsDbPlayerResult>(`playerresults.php?id=${playerId}`, TTL.playerInfo)
}

export async function lookupEvent(eventId: string): Promise<SportsDbEvent | null> {
  // Validate eventId is numeric
  if (!/^\d+$/.test(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}. Must be numeric.`)
  }
  const events = await makeRequest<SportsDbEvent>(`lookupevent.php?id=${eventId}`, TTL.events, {
    expectedKey: 'events',
  })
  return events[0] ?? null
}

export async function eventResults(eventId: string): Promise<SportsDbEventResult[]> {
  return makeRequest<SportsDbEventResult>(`eventresults.php?id=${eventId}`, TTL.events)
}

export async function lookupLineup(eventId: string): Promise<SportsDbLineupPlayer[]> {
  return makeRequest<SportsDbLineupPlayer>(`lookuplineup.php?id=${eventId}`, TTL.events)
}

export async function lookupTimeline(eventId: string): Promise<SportsDbEventTimeline[]> {
  return makeRequest<SportsDbEventTimeline>(`lookuptimeline.php?id=${eventId}`, TTL.events)
}

export async function lookupEventStats(eventId: string): Promise<SportsDbEventStat[]> {
  return makeRequest<SportsDbEventStat>(`lookupeventstats.php?id=${eventId}`, TTL.events)
}

export async function lookupTV(eventId: string): Promise<SportsDbTV[]> {
  return makeRequest<SportsDbTV>(`lookuptv.php?id=${eventId}`, TTL.events)
}

export async function lookupVenue(venueId: string): Promise<SportsDbVenue | null> {
  const venues = await makeRequest<SportsDbVenue>(`lookupvenue.php?id=${venueId}`, TTL.teamInfo)
  return venues[0] ?? null
}

// ============================================================================
// LISTS / GLOBAL
// ============================================================================

export async function allSports(): Promise<SportsDbSport[]> {
  return makeRequest<SportsDbSport>('all_sports.php', TTL.list, { expectedKey: 'sports' })
}

export async function allCountries(): Promise<SportsDbCountry[]> {
  return makeRequest<SportsDbCountry>('all_countries.php', TTL.list, { expectedKey: 'countries' })
}

export async function allLeagues(): Promise<SportsDbLeague[]> {
  return makeRequest<SportsDbLeague>('search_all_leagues.php?s=Soccer', TTL.list)
}

export async function searchAllSeasons(leagueId: string): Promise<SportsDbSeason[]> {
  return makeRequest<SportsDbSeason>(`search_all_seasons.php?id=${leagueId}`, TTL.list)
}

export async function searchAllTeams(params: {
  league?: string
  sport?: string
  country?: string
}): Promise<SportsDbTeam[]> {
  // Note: search_all_teams.php expects league NAME, not ID (per docs)
  const searchParams = new URLSearchParams()
  if (params.league) searchParams.append('l', params.league)
  if (params.sport) searchParams.append('s', params.sport)
  if (params.country) searchParams.append('c', params.country)
  const query = searchParams.toString()
  return makeRequest<SportsDbTeam>(`search_all_teams.php${query ? `?${query}` : ''}`, TTL.list, {
    expectedKey: 'teams',
  })
}

export async function lookupAllPlayers(teamId: string): Promise<SportsDbPlayer[]> {
  // Validate teamId is numeric
  if (!/^\d+$/.test(teamId)) {
    throw new Error(`Invalid teamId: ${teamId}. Must be numeric.`)
  }
  return makeRequest<SportsDbPlayer>(`lookup_all_players.php?id=${teamId}`, TTL.playerInfo, {
    expectedKey: 'player',
  })
}

// ============================================================================
// EVENTS & SCHEDULING
// ============================================================================

export async function eventsNext(teamId: string): Promise<SportsDbEvent[]> {
  if (!/^\d+$/.test(teamId)) {
    throw new Error(`Invalid teamId: ${teamId}. Must be numeric.`)
  }
  return makeRequest<SportsDbEvent>(`eventsnext.php?id=${teamId}`, TTL.events, { expectedKey: 'events' })
}

export async function eventsLast(teamId: string): Promise<SportsDbEvent[]> {
  if (!/^\d+$/.test(teamId)) {
    throw new Error(`Invalid teamId: ${teamId}. Must be numeric.`)
  }
  return makeRequest<SportsDbEvent>(`eventslast.php?id=${teamId}`, TTL.events, { expectedKey: 'events' })
}

export async function eventsNextLeague(leagueId: string): Promise<SportsDbEvent[]> {
  if (!/^\d+$/.test(leagueId)) {
    throw new Error(`Invalid leagueId: ${leagueId}. Must be numeric.`)
  }
  return makeRequest<SportsDbEvent>(`eventsnextleague.php?id=${leagueId}`, TTL.events, { expectedKey: 'events' })
}

export async function eventsPastLeague(leagueId: string): Promise<SportsDbEvent[]> {
  if (!/^\d+$/.test(leagueId)) {
    throw new Error(`Invalid leagueId: ${leagueId}. Must be numeric.`)
  }
  return makeRequest<SportsDbEvent>(`eventspastleague.php?id=${leagueId}`, TTL.events, { expectedKey: 'events' })
}

export async function eventsDay(params: {
  date: string // YYYY-MM-DD
  sport?: string
  league?: string
}): Promise<SportsDbEvent[]> {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    throw new Error(`Invalid date format: ${params.date}. Must be YYYY-MM-DD`)
  }
  const searchParams = new URLSearchParams()
  searchParams.append('d', params.date)
  if (params.sport) searchParams.append('s', params.sport)
  if (params.league) {
    // Validate league is numeric if provided
    if (!/^\d+$/.test(params.league)) {
      throw new Error(`Invalid league: ${params.league}. Must be numeric.`)
    }
    searchParams.append('l', params.league)
  }
  return makeRequest<SportsDbEvent>(`eventsday.php?${searchParams.toString()}`, TTL.eventsDay, {
    expectedKey: 'events',
  })
}

export async function eventsSeason(params: {
  leagueId: string
  season: string
}): Promise<SportsDbEvent[]> {
  // Validate leagueId is numeric
  if (!/^\d+$/.test(params.leagueId)) {
    throw new Error(`Invalid leagueId: ${params.leagueId}. Must be numeric.`)
  }
  // Validate season format: YYYY-YYYY
  if (!/^\d{4}-\d{4}$/.test(params.season)) {
    throw new Error(`Invalid season format: ${params.season}. Must be YYYY-YYYY (e.g., 2024-2025)`)
  }
  return makeRequest<SportsDbEvent>(
    `eventsseason.php?id=${params.leagueId}&s=${encodeURIComponent(params.season)}`,
    TTL.events,
    { expectedKey: 'events' },
  )
}

export async function eventsTV(params?: {
  date?: string
  sport?: string
  country?: string
  channel?: string
  channelId?: string
}): Promise<SportsDbTV[]> {
  const searchParams = new URLSearchParams()
  if (params?.date) searchParams.append('d', params.date)
  if (params?.sport) searchParams.append('s', params.sport)
  if (params?.country) searchParams.append('a', params.country)
  if (params?.channel) searchParams.append('c', params.channel)
  if (params?.channelId) searchParams.append('id', params.channelId)
  const query = searchParams.toString()
  return makeRequest<SportsDbTV>(`eventstv.php${query ? `?${query}` : ''}`, TTL.events)
}

export async function eventsHighlights(params?: {
  date?: string
  leagueId?: string
  sport?: string
}): Promise<SportsDbHighlight[]> {
  const searchParams = new URLSearchParams()
  if (params?.date) searchParams.append('d', params.date)
  if (params?.leagueId) searchParams.append('l', params.leagueId)
  if (params?.sport) searchParams.append('s', params.sport)
  const query = searchParams.toString()
  return makeRequest<SportsDbHighlight>(`eventshighlights.php${query ? `?${query}` : ''}`, TTL.events)
}

// REMOVED: liveScore() - Live features are not supported by TheSportsDB API
// Use eventsDay() with today's date instead

// ============================================================================
// MISC / MEDIA
// ============================================================================

export async function eventHighlights(eventId: string): Promise<SportsDbHighlight[]> {
  return makeRequest<SportsDbHighlight>(`eventhighlights.php?id=${eventId}`, TTL.events)
}

export async function eventImages(eventId: string): Promise<any[]> {
  return makeRequest<any>(`eventimages.php?id=${eventId}`, TTL.misc)
}

export async function teamBadge(teamName: string): Promise<string | null> {
  try {
    const teams = await searchTeams(teamName)
    return teams[0]?.strTeamBadge ?? teams[0]?.strTeamLogo ?? null
  } catch {
    return null
  }
}

export async function venues(): Promise<SportsDbVenue[]> {
  return makeRequest<SportsDbVenue>('venues.php', TTL.list)
}

export async function seasons(leagueId: string): Promise<SportsDbSeason[]> {
  return makeRequest<SportsDbSeason>(`seasons.php?id=${leagueId}`, TTL.list)
}

// Aliases
export const sports = allSports
export const countries = allCountries

// Helper functions for common use cases
export async function getAllTeamsInLeague(leagueId: string): Promise<SportsDbTeam[]> {
  return searchAllTeams({ league: leagueId })
}

export async function getAllPlayersInTeam(teamId: string): Promise<SportsDbPlayer[]> {
  return lookupAllPlayers(teamId)
}

// Legacy aliases for compatibility
export const getAllLeagues = allLeagues
export const getAllSports = allSports
export const getAllCountries = allCountries
export const lookupEventLineup = lookupLineup
export const lookupEventTimeline = lookupTimeline
export const nextEvents = eventsNext
export const lastEvents = eventsLast
export const eventsByLeague = eventsSeason

// Wrapper functions for string-based convenience
export async function getEventsByDate(date: string, sport?: string, leagueId?: string): Promise<SportsDbEvent[]> {
  return eventsDay({ date, sport, league: leagueId })
}

export async function getEventsByLeague(leagueId: string, season?: string): Promise<SportsDbEvent[]> {
  const seasonStr = season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  return eventsSeason({ leagueId, season: seasonStr })
}

// Metrics and testing
export function getMetrics() {
  return {
    requests: requestCount,
    cacheSize: cache.size,
    baseUrl: BASE_URL,
    stats: {
      total: requestStats.total,
      cached: requestStats.cached,
      deduplicated: requestStats.deduplicated,
      rateLimited: requestStats.rateLimited,
      cacheHitRate: requestStats.total > 0 ? `${((requestStats.cached / requestStats.total) * 100).toFixed(1)}%` : '0%',
    },
  }
}

export function clearTheSportsDbCache() {
  cache.clear()
}

export function getTheSportsDbCacheSnapshot() {
  const snapshot: Record<string, { expiry: number; data: unknown }> = {}
  for (const [key, value] of cache.entries()) {
    snapshot[key] = { expiry: (value as any).expires, data: (value as any).data }
  }
  return snapshot
}

export async function testConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
  const startTime = Date.now()
  try {
    const result = await makeRequest<SportsDbSport>('all_sports.php')
    const responseTime = Date.now() - startTime
    return {
      success: result.length > 0,
      message: result.length > 0 ? `Connected successfully. Found ${result.length} sports.` : 'No data returned',
      responseTime,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
      responseTime: Date.now() - startTime,
    }
  }
}

// Export default object
export const theSportsDB = {
  // Search
  searchTeams,
  searchPlayers,
  searchEvents,
  searchVenues,
  searchLeagues,
  searchAllLeagues,
  // Lookup
  lookupLeague,
  lookupTable,
  lookupTeam,
  lookupEquipment,
  lookupPlayer,
  lookupHonours,
  lookupFormerTeams,
  lookupMilestones,
  lookupContracts,
  playerResults,
  lookupEvent,
  eventResults,
  lookupLineup,
  lookupTimeline,
  lookupEventStats,
  lookupTV,
  lookupVenue,
  // Lists
  allSports,
  allCountries,
  allLeagues,
  searchAllSeasons,
  searchAllTeams,
  lookupAllPlayers,
  // Events
  eventsNext,
  eventsLast,
  eventsNextLeague,
  eventsPastLeague,
  eventsDay,
  eventsSeason,
  eventsTV,
  eventsHighlights,
  // Misc
  eventHighlights,
  eventImages,
  teamBadge,
  venues,
  seasons,
  // Helpers
  getAllTeamsInLeague,
  getAllPlayersInTeam,
  getMetrics,
  testConnection,
  // Aliases
  sports,
  countries,
  getAllLeagues,
  getAllSports,
  getAllCountries,
  lookupEventLineup,
  lookupEventTimeline,
  nextEvents,
  lastEvents,
  eventsByLeague,
  getEventsByDate,
  getEventsByLeague,
}

export default theSportsDB

export { RateLimitError }
