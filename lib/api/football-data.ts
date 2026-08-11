import { cacheGet, cacheSet } from '@/lib/cache/redis'

const FD_BASE = 'https://api.football-data.org/v4'
const FD_KEY = process.env.FOOTBALL_DATA_API_KEY || ''

async function fdFetch<T>(
  path: string, 
  cacheKey: string, 
  ttl = 1800
): Promise<T | null> {
  const cached = await cacheGet<T>(cacheKey)
  if (cached !== null) return cached

  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }
    if (FD_KEY) {
      headers['X-Auth-Token'] = FD_KEY
    }

    const res = await fetch(`${FD_BASE}${path}`, {
      headers,
      next: { revalidate: ttl },
    })
    
    // 429 = rate limited, return null gracefully
    if (res.status === 429 || !res.ok) return null
    
    const data = await res.json() as T
    await cacheSet(cacheKey, data, ttl)
    return data
  } catch {
    return null
  }
}

export interface FDMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  homeTeam: { id: number; name: string; crest: string }
  awayTeam: { id: number; name: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
  venue?: string
}

export interface FDStanding {
  position: number
  team: { id: number; name: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form?: string
}

// Get upcoming UCL/UEL matches
export async function getUEFAMatches(
  competitionId: number,
  limit = 10
): Promise<FDMatch[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>(
    `/competitions/${competitionId}/matches?status=SCHEDULED&limit=${limit}`,
    `fd:matches:${competitionId}:upcoming`,
    1800 // 30 min cache
  )
  return data?.matches || []
}

// Get recent UEFA results
export async function getUEFAResults(
  competitionId: number,
  limit = 6
): Promise<FDMatch[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>(
    `/competitions/${competitionId}/matches?status=FINISHED&limit=${limit}`,
    `fd:matches:${competitionId}:finished`,
    3600
  )
  return data?.matches || []
}

// Competition IDs
export const UEFA_COMPETITIONS = {
  UCL: 2001,   // Champions League
  UEL: 2146,   // Europa League
  WORLD_CUP: 2000,
}
