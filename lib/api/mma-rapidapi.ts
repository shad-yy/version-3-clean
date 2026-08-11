import { cacheGet, cacheSet } from '@/lib/cache/redis'

const MMA_BASE = 'https://mmaapi.p.rapidapi.com'
const MMA_KEY = process.env.RAPIDAPI_MMA_KEY || ''

const MMA_HEADERS = {
  'x-rapidapi-host': 'mmaapi.p.rapidapi.com',
  'x-rapidapi-key': MMA_KEY,
  'Accept': 'application/json',
}

async function mmaFetch<T>(
  path: string,
  cacheKey: string,
  ttl = 3600
): Promise<T | null> {
  // Check Redis cache first
  const cached = await cacheGet<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`${MMA_BASE}${path}`, {
      headers: MMA_HEADERS,
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.warn(`[MMA API] ${path} returned ${res.status}`)
      return null
    }

    const data = await res.json() as T
    await cacheSet(cacheKey, data, ttl)
    return data
  } catch (err) {
    console.warn(`[MMA API] Failed ${path}:`, err)
    return null
  }
}

export interface MMAEvent {
  id: string | number
  name: string
  date: string
  location?: string
  venue?: string
  status?: string
  fights?: MMAFight[]
}

export interface MMAFight {
  id: string | number
  fighter1: string
  fighter2: string
  weightClass?: string
  result?: string
  method?: string
  round?: number
  time?: string
  isMainEvent?: boolean
}

export interface MMAFighter {
  id: string | number
  name: string
  nickname?: string
  record?: string
  weightClass?: string
  country?: string
  ranking?: string
  imageUrl?: string
}

// Get upcoming MMA events (15 min cache - events are near-real-time)
export async function getUpcomingMMAEvents(): Promise<MMAEvent[]> {
  const data = await mmaFetch<any>(
    '/events?upcoming=true&limit=10',
    'mma:events:upcoming',
    900
  )
  
  if (!data) return []
  
  // Handle different response shapes
  const events = Array.isArray(data) ? data : 
    data?.events || data?.data || data?.results || []
  
  return events.map((e: any) => ({
    id: e.id || e.event_id || String(Math.random()),
    name: e.name || e.event_name || e.title || 'UFC Event',
    date: e.date || e.event_date || e.scheduled_date || '',
    location: e.location || e.city || e.venue_location || '',
    venue: e.venue || e.arena || e.facility || '',
    status: e.status || 'Upcoming',
    fights: (e.fights || e.bouts || []).map((f: any) => ({
      id: f.id || f.fight_id,
      fighter1: f.fighter1?.name || f.fighter_1_name || f.f1 || '',
      fighter2: f.fighter2?.name || f.fighter_2_name || f.f2 || '',
      weightClass: f.weight_class || f.division || '',
      isMainEvent: f.is_main_event || f.main_event || false,
    })),
  }))
}

// Get recent MMA results (1 hour cache)
export async function getRecentMMAResults(): Promise<MMAEvent[]> {
  const data = await mmaFetch<any>(
    '/events?completed=true&limit=6',
    'mma:events:recent',
    3600
  )
  
  if (!data) return []
  
  const events = Array.isArray(data) ? data : 
    data?.events || data?.data || []
  
  return events.map((e: any) => ({
    id: e.id || String(Math.random()),
    name: e.name || e.event_name || 'UFC Event',
    date: e.date || e.event_date || '',
    location: e.location || e.venue || '',
    status: 'Completed',
    fights: (e.fights || e.bouts || []).slice(0, 5).map((f: any) => ({
      id: f.id,
      fighter1: f.fighter1?.name || f.fighter_1_name || '',
      fighter2: f.fighter2?.name || f.fighter_2_name || '',
      weightClass: f.weight_class || '',
      result: f.winner?.name || f.winner || '',
      method: f.method || f.finish_method || '',
      round: f.round || f.finish_round,
      isMainEvent: f.is_main_event || false,
    })),
  }))
}

// Get fighter rankings (24 hour cache)
export async function getMMAFighters(): Promise<MMAFighter[]> {
  const data = await mmaFetch<any>(
    '/fighters?organization=UFC&limit=20',
    'mma:fighters:top',
    86400
  )
  
  if (!data) return []
  
  const fighters = Array.isArray(data) ? data : 
    data?.fighters || data?.data || []
  
  return fighters.map((f: any) => ({
    id: f.id || f.fighter_id,
    name: f.name || f.fighter_name || '',
    nickname: f.nickname || '',
    record: f.record || `${f.wins || 0}-${f.losses || 0}-${f.draws || 0}`,
    weightClass: f.weight_class || f.division || '',
    country: f.country || f.nationality || '',
    ranking: f.ranking || f.rank || '',
  }))
}
