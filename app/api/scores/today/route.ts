import { NextRequest, NextResponse } from "next/server"

const TODAY_SCORES_TTL = 30 // 30 seconds — fresh enough for live scores, saves API quota

export async function GET(_request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const apiKey = process.env.THESPORTSDB_API_KEY || "123"
    const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsday.php?d=${today}&s=Soccer`

    // Use next.js fetch cache for server-side deduplication (30s revalidation)
    const res = await fetch(url, { next: { revalidate: TODAY_SCORES_TTL } })
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const events = data.events || []

    if (events.length === 0) {
      return NextResponse.json(
        { matches: [], message: "No matches scheduled today" },
        { headers: { 'Cache-Control': `public, s-maxage=${TODAY_SCORES_TTL}, stale-while-revalidate=90` } }
      )
    }

    const matches = events.map((event: any) => ({
      id: event.idEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
      awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
      status: event.strStatus || "Scheduled",
      date: event.dateEvent,
      time: event.strTime || "00:00",
      venue: event.strVenue || undefined,
      league: event.strLeague || "Unknown League",
      homeLogo: event.strHomeTeamBadge ? `${event.strHomeTeamBadge}/tiny` : undefined,
      awayLogo: event.strAwayTeamBadge ? `${event.strAwayTeamBadge}/tiny` : undefined,
      isLive: event.strStatus === "In Progress" || event.strStatus === "Halftime"
    }))

    return NextResponse.json(
      { matches, message: "Success" },
      { headers: { 'Cache-Control': `public, s-maxage=${TODAY_SCORES_TTL}, stale-while-revalidate=90` } }
    )
  } catch (error) {
    console.warn("[API] GET /api/scores/today error:", error)
    return NextResponse.json(
      { matches: [], message: "No matches scheduled today" },
      { status: 200 }
    )
  }
}
