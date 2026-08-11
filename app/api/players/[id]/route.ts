import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Player id is required" }, { status: 400 })
    }
    const data = await unifiedSportsAPI.getPlayer(id)
    if (!data) {
      return NextResponse.json({ data: null, error: "Player not found" }, { status: 200 })
    }
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/players/[id] error:", error)
    return NextResponse.json(
      { data: null, error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
