import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const seasonNum = season ? parseInt(season, 10) : undefined
    if (!id) {
      return NextResponse.json({ error: "League id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getStandings(id, seasonNum)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/leagues/[id]/standings error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
