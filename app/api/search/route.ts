import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    if (!q || q.length < 2 || q.length > 64) {
      return NextResponse.json(
        { data: { teams: [], players: [], events: [] } },
        { status: 200 }
      )
    }
    const data = await unifiedSportsAPI.searchAll(q)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/search error:", error)
    return NextResponse.json(
      { data: { teams: [], players: [], events: [] }, error: "Search temporarily unavailable" },
      { status: 200 }
    )
  }
}
