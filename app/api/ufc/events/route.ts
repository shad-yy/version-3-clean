import { NextResponse } from "next/server"
import { getUpcomingEvents } from "@/lib/api/ufc"

export async function GET() {
  try {
    const data = await getUpcomingEvents()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/events error:", error)
    return NextResponse.json(
      { data: [], error: "UFC events temporarily unavailable" },
      { status: 200 }
    )
  }
}
