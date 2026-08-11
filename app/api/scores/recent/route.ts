import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

// Recent results are SWR-cached for 5 min inside getRecentResults()
// Edge cache can serve stale for up to 10 min before revalidating
export async function GET() {
  try {
    const data = await unifiedSportsAPI.getRecentResults()
    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.warn("[API] GET /api/scores/recent error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
