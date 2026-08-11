import { NextRequest, NextResponse } from 'next/server'
import { cacheGet, cacheSet } from '@/lib/cache/redis'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

// Allowlist of permitted ESPN paths
const ALLOWED_PATHS = [
  'mma/ufc/scoreboard',
  'mma/ufc/news',
  'racing/f1/scoreboard', 
  'racing/f1/news',
  'football/nfl/scoreboard',
  'basketball/nba/scoreboard',
]

export async function GET(
  req: NextRequest,
  { params }: { params: { sport: string[] } }
) {
  const path = params.sport.join('/')
  
  // Security: only allow whitelisted paths
  if (!ALLOWED_PATHS.includes(path)) {
    return NextResponse.json(
      { error: 'Not allowed' }, 
      { status: 403 }
    )
  }
  
  const cacheKey = `espn:proxy:${path}`
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    })
  }
  
  try {
    const res = await fetch(`${ESPN_BASE}/${path}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 }
    })
    if (!res.ok) throw new Error(`ESPN ${res.status}`)
    const data = await res.json()
    await cacheSet(cacheKey, data, 1800)
    
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'ESPN data unavailable' },
      { status: 503 }
    )
  }
}
