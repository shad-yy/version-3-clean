import { NextResponse } from "next/server"
import { getFighters } from "@/lib/api/ufc"

/*
 * Next 14 statically caches a GET route handler that reads neither `request` nor any
 * dynamic function -- it is rendered once at build and served unchanged forever. This
 * route returns live data, so without an explicit revalidate it would freeze at whatever
 * the upstream happened to return during the build.
 *
 * Roster data is near-static.
 */
export const revalidate = 86400

export async function GET() {
  try {
    const data = await getFighters()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/fighters error:", error)
    return NextResponse.json(
      { data: [], error: "UFC fighters temporarily unavailable" },
      { status: 200 }
    )
  }
}
