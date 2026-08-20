import { NextResponse } from "next/server"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

/*
 * Next 14 statically caches a GET route handler that reads neither `request` nor any
 * dynamic function -- it is rendered once at build and served unchanged forever. This
 * route returns live data, so without an explicit revalidate it would freeze at whatever
 * the upstream happened to return during the build.
 *
 * Fixture lists change on announcement, not continuously.
 */
export const revalidate = 3600

export async function GET(request: Request, { params }: { params: { leagueId: string } }) {
    try {
        const { leagueId } = params

        // Fetch upcoming events directly using the shared API layer
        const allEvents = await unifiedSportsAPI.getFixtures({ leagueId, next: 15 })

        // Filter to only upcoming matches that haven't finished
        const upcomingEvents = allEvents.filter((e: any) => e.status !== "Match Finished").slice(0, 5)

        return NextResponse.json({
            data: upcomingEvents
        })
    } catch (error) {
        console.error(`[Fixtures API] Error fetching fixtures for league ${params.leagueId}:`, error)
        return NextResponse.json({ data: [] }, { status: 500 })
    }
}
