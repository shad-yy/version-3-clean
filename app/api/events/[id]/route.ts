import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getFixture(id)
    if (!data) {
      return NextResponse.json({ data: null, error: "Event not found" }, { status: 200 })
    }
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/events/[id] error:", error)
    return NextResponse.json(
      { data: null, error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
