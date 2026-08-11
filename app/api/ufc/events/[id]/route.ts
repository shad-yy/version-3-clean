import { NextRequest, NextResponse } from "next/server"
import { getEvent } from "@/lib/api/ufc"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }
    const data = await getEvent(id)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/events/[id] error:", error)
    return NextResponse.json(
      { data: null, error: "Event not found" },
      { status: 200 }
    )
  }
}
