import { NextRequest, NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "next" // next | last
    if (!id) {
      return NextResponse.json({ error: "Team id is required" }, { status: 400 })
    }
    const data =
      type === "last"
        ? await unifiedSportsAPI.getFixtures({ teamId: id, last: 15 })
        : await unifiedSportsAPI.getFixtures({ teamId: id, next: 15 })
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/teams/[id]/events error:", error)
    return NextResponse.json(
      { data: [], error: "Data temporarily unavailable" },
      { status: 200 }
    )
  }
}
