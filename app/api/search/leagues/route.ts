import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    if (!q || q.length < 2 || q.length > 64) return NextResponse.json([])
    const leagues = await unifiedSportsAPI.getLeagues(undefined, undefined)
    const filtered = leagues
      .filter((l) => l.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 20)
    return NextResponse.json(
      filtered.map((l) => ({ id: l.id, name: l.name, sport: l.sport, country: l.country || null }))
    )
  } catch (e) {
    console.warn("[API] GET /api/search/leagues failed:", e)
    return NextResponse.json([])
  }
}


