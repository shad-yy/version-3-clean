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
    
    const players = await unifiedSportsAPI.searchPlayers(q)
    return NextResponse.json(
      players.map((p) => ({ 
        id: p.id, 
        name: p.name, 
        position: p.position || null, 
        team: p.team || null 
      })),
    )
  } catch (e) {
    console.warn("[API] GET /api/search/players failed:", e)
    return NextResponse.json([]) // Return empty array instead of error
  } finally {
    if (timer) clearTimeout(timer)
  }
}


