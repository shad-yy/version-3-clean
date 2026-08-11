import { NextResponse } from "next/server"
import { getRankings } from "@/lib/api/ufc"

export async function GET() {
  try {
    const data = await getRankings()
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/rankings error:", error)
    return NextResponse.json(
      { data: [], error: "UFC rankings temporarily unavailable" },
      { status: 200 }
    )
  }
}
