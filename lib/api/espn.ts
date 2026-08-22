import { cacheGet, cacheSet } from '@/lib/cache/redis'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'
const ESPN_CACHE_TTL = 1800 // 30 minutes

async function espnFetch<T>(
  url: string,
  cacheKey: string,
  ttl = ESPN_CACHE_TTL
): Promise<T | null> {
  // Try Redis cache first
  const cached = await cacheGet<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: ttl }
    })
    clearTimeout(timeout)
    
    if (!res.ok) throw new Error(`ESPN API ${res.status}`)
    const data = await res.json()
    
    // Cache in Redis
    await cacheSet(cacheKey, data, ttl)
    return data as T
  } catch (err) {
    console.warn(`[ESPN] Failed to fetch ${cacheKey}:`, err)
    return null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UFC FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ESPNEvent {
  id: string
  name: string
  shortName?: string
  date: string
  status: {
    type: {
      name: string
      description: string
      completed: boolean
    }
  }
  competitions?: Array<{
    id: string
    competitors: Array<{
      id: string
      displayName: string
      athlete?: { displayName: string }
      team?: { displayName: string }
      score?: string
    }>
    venue?: {
      fullName: string
      address?: { city: string; country?: string }
    }
    notes?: Array<{ headline: string }>
  }>
  links?: Array<{ href: string; text: string; rel?: string[] }>
}

export interface ESPNScoreboard {
  events: ESPNEvent[]
  season?: { year: number; type: number }
  leagues?: ESPNLeague[]
}

interface ESPNLeague {
  /**
   * The season's full event list.
   *
   * This is the only public, keyless source of *upcoming* UFC events. The `events` array
   * beside it holds just the current day, and passing a future `?dates=` returns an empty
   * set, so anything beyond today has to come from here.
   */
  calendar?: {
    label?: string
    startDate?: string
    endDate?: string
    /** `$ref` points at an internal `espn.pvt` host that does not resolve publicly --
     *  only the numeric id inside the URL is usable. */
    event?: { $ref?: string }
  }[]
  logos?: { href?: string }[]
}

/** A UFC fighter as ESPN's core API describes them. */
export interface ESPNAthlete {
  id: string
  name: string
  /** Direct headshot URL from the provider — not a constructed path. */
  headshot: string | null
  weightClass: string | null
  /** Country flag, when ESPN holds one. Frequently a blank placeholder. */
  flag: string | null
}

/**
 * UFC fighters, with real photographs.
 *
 * Uses `sports.core.api.espn.com`, which is a different service from the `site.api` used
 * for scoreboards and returns athlete **ids** — the thing that was missing. The scoreboard
 * exposes only names and country flags, which is why headshots looked impossible earlier:
 * the CDN path needs an id, and the endpoint being asked did not have one.
 *
 * ESPN hands back the headshot URL directly, so nothing is constructed here. A fighter
 * without a photograph returns null rather than a guessed path that 404s.
 *
 * This replaces a hardcoded roster carrying records, ages and rankings that no source
 * backed and that had quietly gone stale.
 *
 * Two round trips per fighter is why this is capped and cached hard: one page listing ids,
 * then one detail call each. At 24 fighters that is 25 requests on a cold cache and none
 * on a warm one.
 */
export async function getUFCAthletes(limit = 24): Promise<ESPNAthlete[]> {
  const index = await espnFetch<{ items?: { $ref?: string }[] }>(
    `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/athletes?limit=${limit}`,
    `espn:ufc:athletes:index:${limit}`,
    86_400,
  )

  const ids = (index?.items ?? [])
    .map((i) => i.$ref?.match(/\/athletes\/(\d+)/)?.[1])
    .filter((id): id is string => Boolean(id))

  if (ids.length === 0) return []

  const athletes = await Promise.all(
    ids.map((id) =>
      espnFetch<{
        id?: string
        displayName?: string
        headshot?: { href?: string }
        weightClass?: { text?: string }
        flag?: { href?: string }
      }>(
        `https://sports.core.api.espn.com/v2/sports/mma/athletes/${id}?lang=en&region=us`,
        `espn:ufc:athlete:${id}`,
        86_400,
      ),
    ),
  )

  return athletes
    .map((a) => {
      if (!a?.displayName) return null
      const flag = a.flag?.href ?? null
      return {
        id: String(a.id ?? ""),
        name: a.displayName,
        headshot: a.headshot?.href ?? null,
        weightClass: a.weightClass?.text ?? null,
        // ESPN serves a literal "blank.png" placeholder where it has no flag; carrying
        // that through would render an empty box that looks like a failed load.
        flag: flag && !flag.includes("blank") ? flag : null,
      }
    })
    .filter((a): a is ESPNAthlete => a !== null)
    // A fighter with no photograph is not useful on a screen whose point is photographs.
    .filter((a) => Boolean(a.headshot))
}

/** One scheduled UFC event, as far as the public calendar describes it. */
export interface ESPNCalendarEvent {
  id: string
  name: string
  /** ISO 8601 start, UTC. */
  startDate: string
}

/**
 * Scheduled UFC events, soonest first.
 *
 * Shares `espnFetch`'s cache entry with `getUFCEvents()` -- same URL, same key -- so
 * asking for both on one page costs one upstream request rather than two.
 *
 * Fight cards are deliberately not returned. ESPN does not expose the card for an event
 * until it is close, and inventing one is not an option, so this answers the question the
 * data can actually support: what is on, and when.
 */
export async function getUFCCalendar(limit = 6): Promise<ESPNCalendarEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
    'espn:ufc:scoreboard:v5',
    900
  )

  const calendar = data?.leagues?.[0]?.calendar ?? []
  const now = Date.now()

  return calendar
    .map((entry) => {
      const startDate = entry.startDate ?? ''
      const id = entry.event?.$ref?.match(/\/events\/(\d+)/)?.[1] ?? ''
      return { id, name: entry.label ?? '', startDate }
    })
    .filter((e) => {
      if (!e.id || !e.name || !e.startDate) return false
      const t = Date.parse(e.startDate)
      return Number.isFinite(t) && t > now
    })
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
    .slice(0, limit)
}

export async function getUFCEvents(): Promise<{
  upcoming: ESPNEvent[]
  recent: ESPNEvent[]
}> {
  const data = await espnFetch<ESPNScoreboard>(
    'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
    'espn:ufc:scoreboard:v5',
    900
  )

  const events = data?.events || []
  const now = new Date()
  
  // 30 days ago threshold for "recent"
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  )

  const upcoming = events.filter(e => {
    if (e.status?.type?.completed) return false
    if (!e.date) return false
    const d = new Date(e.date)
    return !isNaN(d.getTime()) && 
      d >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
  })

  const recent = events.filter(e => {
    if (!e.status?.type?.completed) return false
    if (!e.date) return false
    const d = new Date(e.date)
    return !isNaN(d.getTime()) && d >= thirtyDaysAgo
  })

  return { upcoming, recent }
}

export async function getUFCEventSummary(eventId: string): Promise<any> {
  // Use summary endpoint — returns human-readable fight card
  return espnFetch(
    `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/summary?event=${eventId}`,
    `espn:ufc:event:${eventId}`,
    3600
  )
}

export async function getUFCFighters(): Promise<any[]> {
  // Core API returns paginated fighter list
  const data = await espnFetch<{ items: any[]; count: number }>(
    'https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/athletes?limit=50&active=true',
    'espn:ufc:fighters',
    86400 // 24hr cache — fighters don't change often
  )
  return data?.items || []
}

export async function getUFCNews(): Promise<any[]> {
  const data = await espnFetch<{ articles: any[] }>(
    'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/news?limit=8',
    'espn:ufc:news',
    1800
  )
  return data?.articles || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// F1 FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface F1Race {
  id: string
  name: string
  shortName?: string
  date: string
  completed: boolean
  location: string
  country: string
  circuit?: string
  winner?: string
  winnerTime?: string
}

export async function getF1Schedule(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/racing/f1/scoreboard`,
    'espn:f1:scoreboard'
  )
  return data?.events || []
}

export async function getF1News(): Promise<any[]> {
  const data = await espnFetch<{ articles: any[] }>(
    `${ESPN_BASE}/racing/f1/news?limit=10`,
    'espn:f1:news'
  )
  return data?.articles || []
}

function mapF1Race(e: ESPNEvent): F1Race {
  const comp = e.competitions?.[0]
  const winner = comp?.competitors?.find((c: any) => c.order === 1)
  return {
    id: e.id,
    name: e.name || e.shortName || 'F1 Race',
    shortName: e.shortName,
    date: e.date,
    completed: e.status?.type?.completed || false,
    location: comp?.venue?.address?.city || 
              comp?.venue?.fullName || 'TBA',
    country: comp?.venue?.address?.country || '',
    circuit: comp?.venue?.fullName,
    winner: winner?.athlete?.displayName || 
            winner?.team?.displayName || undefined,
  }
}

export async function getF1FullSchedule(): Promise<F1Race[]> {
  // Scoreboard returns full event objects with all details
  const board = await espnFetch<ESPNScoreboard>(
    'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
    'espn:f1:scoreboard:full',
    900
  )
  return (board?.events || []).map(mapF1Race)
}

export async function getF1DriverStandings(): Promise<any[]> {
  // Driver list from core API
  const data = await espnFetch<any>(
    'https://sports.core.api.espn.com/v2/sports/racing/leagues/f1/athletes?limit=30&active=true',
    'espn:f1:drivers',
    86400
  )
  return data?.items || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NFL FUNCTIONS (for future use)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getNFLScoreboard(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/football/nfl/scoreboard`,
    'espn:nfl:scoreboard'
  )
  return data?.events || []
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NBA FUNCTIONS (for future use)  
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getNBAScoreboard(): Promise<ESPNEvent[]> {
  const data = await espnFetch<ESPNScoreboard>(
    `${ESPN_BASE}/basketball/nba/scoreboard`,
    'espn:nba:scoreboard'
  )
  return data?.events || []
}
