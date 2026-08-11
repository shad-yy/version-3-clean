import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

// Long-lived endpoints — league/team/player data changes at most once a day
const LONG_CACHE_PATTERNS = [
  'lookupleague', 'search_all_leagues', 'searchleagues',
  'lookupteam', 'search_all_teams', 'searchteams',
  'lookupplayer', 'searchplayers',
  'lookuptable',
]
// Short-lived — scores and events update frequently
const SHORT_CACHE_PATTERNS = [
  'eventsnow', 'eventstv', 'eventsday',
  'eventsnextleague', 'eventspastleague',
]

function getRevalidateTtl(path: string): number {
  const lower = path.toLowerCase()
  if (LONG_CACHE_PATTERNS.some(p => lower.includes(p))) return 86_400  // 24 hours
  if (SHORT_CACHE_PATTERNS.some(p => lower.includes(p))) return 30      // 30 seconds
  return 300 // default 5 minutes
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const pathBytes = params.path.join('/')
        const url = new URL(request.url)
        const ttl = getRevalidateTtl(pathBytes)

        // Construct the private authenticated URL
        const apiKey = API_CONFIG.thesportsdb.apiKey || "123"
        const targetUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/${pathBytes}${url.search}`

        const res = await fetch(targetUrl, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: ttl }
        })

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to proxy request" }, { status: res.status })
        }

        // TheSportsDB often returns content-type text/html even for JSON, so we just read as text then parse to avoid errors
        const textData = await res.text()
        let data;
        try {
            data = JSON.parse(textData)
        } catch {
            return NextResponse.json({ error: "Invalid JSON from proxy" }, { status: 500 })
        }

        const staleWhileRevalidate = Math.min(ttl * 2, 86_400)
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`
            }
        })
    } catch (error) {
        console.warn("[Proxy API] Error proxying to TheSportsDB:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
