import { NextResponse } from "next/server"
import { swrGet } from "@/lib/cache"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function mapEvent(e: any) {
    return {
        idLeague: e.idLeague ?? null,
        idEvent: e.idEvent,
        strEvent: e.strEvent,
        strHomeTeam: e.strHomeTeam,
        strAwayTeam: e.strAwayTeam,
        strHomeTeamBadge: e.strHomeTeamBadge ?? null,
        strAwayTeamBadge: e.strAwayTeamBadge ?? null,
        intHomeScore: e.intHomeScore !== null && e.intHomeScore !== undefined ? String(e.intHomeScore) : null,
        intAwayScore: e.intAwayScore !== null && e.intAwayScore !== undefined ? String(e.intAwayScore) : null,
        strTime: e.strTime || e.strTimeLocal || "",
        strDate: e.dateEvent || e.strDate || "",
        strLeague: e.strLeague,
        strLeagueBadge: e.strLeagueBadge ?? null,
        strStatus: e.strStatus || e.strResult || "Scheduled",
    }
}

/**
 * Today's fixtures.
 *
 * TTL is 90 seconds. This route issues three upstream calls and is requested by every
 * homepage visitor, so uncached it put 3 TheSportsDB requests on the wire per view --
 * against a 30/min free tier that a handful of concurrent readers would exhaust.
 *
 * swrGet also serves stale data while we are rate-limited, so a burst degrades to
 * slightly old fixtures rather than to an empty page.
 */
const TTL_SECONDS = 90

async function buildPayload() {
    try {
        // Get today AND tomorrow in UTC to catch timezone edge cases
        const now = new Date()
        const todayUTC = now.toISOString().split('T')[0]
        const tomorrowUTC = new Date(now.getTime() + 86400000)
          .toISOString().split('T')[0]
        const yesterdayUTC = new Date(now.getTime() - 86400000)
          .toISOString().split('T')[0]

        // Fetch fixtures for today AND tomorrow
        const [todayRes, tomorrowRes] = await Promise.allSettled([
          fetch(
            `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${todayUTC}&s=Soccer`,
            { cache: 'no-store' }
          ),
          fetch(
            `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${tomorrowUTC}&s=Soccer`,
            { cache: 'no-store' }
          ),
        ])

        // Combine and deduplicate
        const todayEvents = todayRes.status === 'fulfilled' && todayRes.value.ok
          ? (await todayRes.value.json())?.events || []
          : []
        const tomorrowEvents = tomorrowRes.status === 'fulfilled' && tomorrowRes.value.ok
          ? (await tomorrowRes.value.json())?.events || []
          : []

        const allEvents = [...todayEvents, ...tomorrowEvents]

        // Separate upcoming and results
        const upcoming = allEvents
          .filter((e: any) => {
            const status = (e.strStatus || '').toLowerCase()
            return !status.includes('finished') && 
                   status !== 'ft' &&
                   e.intHomeScore === null
          })
          .slice(0, 8)
          .map(mapEvent)

        const results = allEvents
          .filter((e: any) => {
            const status = (e.strStatus || '').toLowerCase()
            return status.includes('finished') || 
                   status === 'ft' ||
                   (e.intHomeScore !== null && e.intHomeScore !== '')
          })
          .slice(0, 8)
          .map(mapEvent)

        // If no results today, get yesterday's
        let finalResults = results
        if (results.length === 0) {
          try {
            const yestRes = await fetch(
              `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${yesterdayUTC}&s=Soccer`,
              { cache: 'no-store' }
            )
            if (yestRes.ok) {
              const yestData = await yestRes.json()
              finalResults = (yestData?.events || [])
                .filter((e: any) => {
                  const s = (e.strStatus || '').toLowerCase()
                  return s.includes('finished') || s === 'ft'
                })
                .slice(0, 6)
                .map((e: any) => ({ ...mapEvent(e), isYesterday: true }))
            }
          } catch {}
        }

        return {
          upcoming,
          events: upcoming, // backwards compat
          results: finalResults,
          label: upcoming.length > 0 ? 'today' : 'upcoming',
          count: upcoming.length,
        }
    } catch (error) {
        console.error(`[Fixtures Today API] Error:`, error)
        return { events: [], upcoming: [], results: [], label: "error", count: 0 }
    }
}

export async function GET() {
    // Keyed by UTC date so the cache turns over naturally at midnight rather than
    // serving yesterday's fixtures into the new day.
    const key = `fixtures:today:${new Date().toISOString().slice(0, 10)}`
    const payload = await swrGet(key, buildPayload, TTL_SECONDS)

    return NextResponse.json(payload, {
        headers: {
            // Let the CDN hold it too. The upstream budget is the scarce resource.
            'Cache-Control': `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=600`,
        },
    })
}
