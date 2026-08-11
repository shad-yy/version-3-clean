import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country") ?? undefined
    const sport = searchParams.get("sport") ?? undefined
    const data = await unifiedSportsAPI.getLeagues(country, sport)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/leagues error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
