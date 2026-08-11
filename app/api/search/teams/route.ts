import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

export async function GET(request: Request) {
  let timer: any
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    if (!q || q.length < 2 || q.length > 64) return NextResponse.json([])
    
    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), 8000)
    
    const teams = await unifiedSportsAPI.searchTeams(q)
    return NextResponse.json(
      teams.map((t) => ({ 
        id: t.id, 
        name: t.name, 
        league: (t as any).league || null 
      })),
    )
  } catch (e) {
    console.warn("[API] GET /api/search/teams failed:", e)
    return NextResponse.json([]) // Return empty array instead of error
  } finally {
    if (timer) clearTimeout(timer)
  }
}


