import { NextResponse } from "next/server"
import { getPastEvents } from "@/lib/api/ufc"

export async function GET() {
  try {
    const data = await getPastEvents()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/past-events error:", error)
    return NextResponse.json(
      { data: [], error: "UFC past events temporarily unavailable" },
      { status: 200 }
    )
  }
}
