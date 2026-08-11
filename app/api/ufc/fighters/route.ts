import { NextResponse } from "next/server"
import { getFighters } from "@/lib/api/ufc"

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
