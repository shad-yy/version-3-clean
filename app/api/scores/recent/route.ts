import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

/*
 * Next 14 statically caches a GET route handler that reads neither `request` nor any
 * dynamic function -- it is rendered once at build and served unchanged forever. This
 * route returns live data, so without an explicit revalidate it would freeze at whatever
 * the upstream happened to return during the build.
 *
 * Recent results move while matches are being played.
 */
export const revalidate = 90

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
