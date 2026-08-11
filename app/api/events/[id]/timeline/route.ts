import { NextRequest, NextResponse } from "next/server"
import { lookupTimeline } from "@/lib/api/the-sports-db"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }
    const data = await lookupTimeline(id)
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/events/[id]/timeline error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
