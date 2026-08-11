import { NextRequest, NextResponse } from "next/server"
import { getFighter } from "@/lib/api/ufc"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Fighter id is required" }, { status: 400 })
    }
    const data = await getFighter(id)
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }
    )
  } catch (error) {
    console.warn("[API] GET /api/ufc/fighters/[id] error:", error)
    return NextResponse.json(
      { data: null, error: "Fighter not found" },
      { status: 200 }
    )
  }
}
