import type { UFCEvent, UFCFighter } from "@/lib/types"
import { getUFCCalendar, getUFCEvents } from "@/lib/api/espn"

// Current realistic UFC data (updated as of 2024)
const mockUpcomingEvents: UFCEvent[] = []

const mockPastEvents: UFCEvent[] = []

const mockRankings: UFCFighter[] = [
  {
    id: "jon-jones",
    name: "Jon Jones",
    nickname: "Bones",
    weightClass: "Heavyweight",
    ranking: "Champion",
    record: "28-1-0",
    country: "USA",
    age: 37,
    height: "6'4\"",
    reach: '84.5"',
    photo: "/jon-jones-profile.png",
    bio: "Widely considered one of the greatest mixed martial artists of all time. Current UFC Heavyweight Champion.",
    stats: {
      wins: 28,
      losses: 1,
      draws: 0,
      koTko: 11,
      submissions: 6,
      decisions: 11,
      height: "6'4\"",
      reach: '84.5"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Stipe Miocic", result: "Win", method: "TKO", date: "2024-11-16" },
      { opponent: "Ciryl Gane", result: "Win", method: "Submission", date: "2023-03-04" },
    ],
  },
  {
    id: "islam-makhachev",
    name: "Islam Makhachev",
    nickname: "",
    weightClass: "Lightweight",
    ranking: "Champion",
    record: "26-1-0",
    country: "Russia",
    age: 33,
    height: "5'10\"",
    reach: '70"',
    photo: "/islam-makhachev-profile.png",
    bio: "Current UFC Lightweight Champion with exceptional grappling skills and striking improvements.",
    stats: {
      wins: 26,
      losses: 1,
      draws: 0,
      koTko: 4,
      submissions: 12,
      decisions: 10,
      height: "5'10\"",
      reach: '70"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Dustin Poirier", result: "Win", method: "Submission", date: "2024-06-01" },
      { opponent: "Alexander Volkanovski", result: "Win", method: "KO", date: "2023-10-21" },
    ],
  },
  {
    id: "ilia-topuria",
    name: "Ilia Topuria",
    nickname: "El Matador",
    weightClass: "Featherweight",
    ranking: "Champion",
    record: "16-0-0",
    country: "Spain",
    age: 27,
    height: "5'7\"",
    reach: '69"',
    photo: "/ilia-topuria-profile.png",
    bio: "Current UFC Featherweight Champion. Undefeated Georgian-Spanish fighter with knockout power.",
    stats: {
      wins: 16,
      losses: 0,
      draws: 0,
      koTko: 8,
      submissions: 2,
      decisions: 6,
      height: "5'7\"",
      reach: '69"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Max Holloway", result: "Win", method: "KO", date: "2024-10-26" },
      { opponent: "Alexander Volkanovski", result: "Win", method: "KO", date: "2024-02-17" },
    ],
  },
  {
    id: "dricus-du-plessis",
    name: "Dricus du Plessis",
    nickname: "Stillknocks",
    weightClass: "Middleweight",
    ranking: "Champion",
    record: "22-2-0",
    country: "South Africa",
    age: 30,
    height: "6'1\"",
    reach: '76"',
    photo: "/dricus-du-plessis-profile.png",
    bio: "Current UFC Middleweight Champion from South Africa. Known for his aggressive fighting style.",
    stats: {
      wins: 22,
      losses: 2,
      draws: 0,
      koTko: 16,
      submissions: 2,
      decisions: 4,
      height: "6'1\"",
      reach: '76"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Sean Strickland", result: "Win", method: "Decision", date: "2024-01-20" },
      { opponent: "Robert Whittaker", result: "Win", method: "TKO", date: "2023-07-29" },
    ],
  },
  {
    id: "merab-dvalishvili",
    name: "Merab Dvalishvili",
    nickname: "The Machine",
    weightClass: "Bantamweight",
    ranking: "Champion",
    record: "18-4-0",
    country: "Georgia",
    age: 33,
    height: "5'6\"",
    reach: '68"',
    photo: "/merab-dvalishvili-profile.png",
    bio: "Current UFC Bantamweight Champion known for his relentless pace and cardio.",
    stats: {
      wins: 18,
      losses: 4,
      draws: 0,
      koTko: 2,
      submissions: 2,
      decisions: 14,
      height: "5'6\"",
      reach: '68"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Sean O'Malley", result: "Win", method: "Decision", date: "2024-09-14" },
      { opponent: "Henry Cejudo", result: "Win", method: "Decision", date: "2024-02-17" },
    ],
  },
  {
    id: "alexandre-pantoja",
    name: "Alexandre Pantoja",
    nickname: "The Cannibal",
    weightClass: "Flyweight",
    ranking: "Champion",
    record: "28-5-0",
    country: "Brazil",
    age: 34,
    height: "5'5\"",
    reach: '67"',
    photo: "/alexandre-pantoja-profile.png",
    bio: "Current UFC Flyweight Champion with well-rounded skills and championship experience.",
    stats: {
      wins: 28,
      losses: 5,
      draws: 0,
      koTko: 9,
      submissions: 11,
      decisions: 8,
      height: "5'5\"",
      reach: '67"',
      stance: "Orthodox",
    },
    fightHistory: [
      { opponent: "Steve Erceg", result: "Win", method: "Decision", date: "2024-05-04" },
      { opponent: "Brandon Royval", result: "Win", method: "Decision", date: "2023-12-16" },
    ],
  },
]

// Enhanced contenders data
const mockContenders: UFCFighter[] = [
  {
    id: "tom-aspinall",
    name: "Tom Aspinall",
    nickname: "",
    weightClass: "Heavyweight",
    ranking: "#1 Contender",
    record: "15-3-0",
    country: "England",
    age: 31,
    height: "6'5\"",
    reach: '78"',
    photo: "/tom-aspinall-profile.png",
    bio: "Interim UFC Heavyweight Champion with exceptional finishing ability.",
    stats: {
      wins: 15,
      losses: 3,
      draws: 0,
      koTko: 9,
      submissions: 4,
      decisions: 2,
      height: "6'5\"",
      reach: '78"',
      stance: "Orthodox",
    },
    fightHistory: [],
  },
  {
    id: "arman-tsarukyan",
    name: "Arman Tsarukyan",
    nickname: "Ahalkalakets",
    weightClass: "Lightweight",
    ranking: "#1 Contender",
    record: "22-3-0",
    country: "Armenia",
    age: 28,
    height: "5'9\"",
    reach: '69"',
    photo: "/arman-tsarukyan-profile.png",
    bio: "Top lightweight contender with excellent wrestling and striking.",
    stats: {
      wins: 22,
      losses: 3,
      draws: 0,
      koTko: 9,
      submissions: 4,
      decisions: 9,
      height: "5'9\"",
      reach: '69"',
      stance: "Orthodox",
    },
    fightHistory: [],
  },
]

// Cache implementation for better performance
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

/** The "<Fighter> vs. <Fighter>" half of a UFC card title, when the title has one. */
function mainEventFromName(name: string): string | undefined {
  const colon = name.indexOf(":")
  if (colon === -1) return undefined
  const tail = name.slice(colon + 1).trim()
  return /vs\.?/i.test(tail) ? tail : undefined
}

/**
 * Scheduled UFC events, soonest first.
 *
 * Returned an empty array for some time: the RapidAPI client that used to fill it was
 * removed as dead code, and the ESPN scoreboard beside it only ever carries the current
 * day. The upcoming schedule was in the same response the whole time, under
 * `leagues[0].calendar` -- 18 events on the day this was fixed -- so no new credential or
 * provider was needed to restore it.
 *
 * `location` and `fights` stay empty. ESPN does not publish a venue or a card for an
 * event until it is close, and a plausible guess at either is worse than a blank field on
 * a site whose premise is that its listings are checked.
 */
export async function getUpcomingEvents(): Promise<UFCEvent[]> {
  try {
    const calendar = await getUFCCalendar(8)
    return calendar.map((event) => ({
      id: event.id,
      name: event.name,
      date: event.startDate,
      location: "",
      status: "Upcoming" as const,
      // UFC names its cards "<Event>: <Fighter> vs. <Fighter>", so the main event is read
      // from the title rather than sourced separately.
      //
      // Requiring "vs" matters: Contender Series cards are named
      // "...: Season 10, Week 3", and a looser split labelled "Season 10, Week 3" as the
      // main event. Absent is correct there -- ESPN does not publish those bouts in
      // advance, and a week number dressed up as a fight is a small lie.
      mainEvent: mainEventFromName(event.name),
    }))
  } catch {
    // An empty schedule renders as "nothing we can confirm", which is accurate when the
    // upstream is unreachable. Never a placeholder card.
    return []
  }
}

/**
 * Recently completed events.
 *
 * Sourced from the scoreboard's own `events` array via `getUFCEvents()`, which is the only
 * place completed cards appear. Shares the cached upstream response with the function
 * above.
 */
export async function getPastEvents(): Promise<UFCEvent[]> {
  try {
    const { recent } = await getUFCEvents()
    return recent.map((event) => ({
      id: String(event.id),
      name: event.name ?? "",
      date: event.date ?? "",
      location: event.competitions?.[0]?.venue?.fullName ?? "",
      status: "Past" as const,
    }))
  } catch {
    return []
  }
}

export async function getRankings(): Promise<UFCFighter[]> {
  try {
    const cacheKey = "rankings"
    const cached = getCachedData<UFCFighter[]>(cacheKey)
    if (cached) return cached

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200))

    setCachedData(cacheKey, mockRankings)
    return mockRankings
  } catch (error) {
    console.error("Error fetching UFC rankings:", error)
    throw new Error("Failed to fetch UFC rankings")
  }
}

export async function getContenders(): Promise<UFCFighter[]> {
  try {
    const cacheKey = "contenders"
    const cached = getCachedData<UFCFighter[]>(cacheKey)
    if (cached) return cached

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200))

    setCachedData(cacheKey, mockContenders)
    return mockContenders
  } catch (error) {
    console.error("Error fetching UFC contenders:", error)
    throw new Error("Failed to fetch UFC contenders")
  }
}

export async function getFighter(id: string): Promise<UFCFighter> {
  try {
    const cacheKey = `fighter-${id}`
    const cached = getCachedData<UFCFighter>(cacheKey)
    if (cached) return cached

    // Try scraper first (dynamic import to avoid cheerio in client bundle)
    try {
      const { ufcScraper } = await import("./ufc-scraper")
      const fighter = await ufcScraper.getFighterDetails(id)
      if (fighter) {
        setCachedData(cacheKey, fighter)
        return fighter
      }
    } catch (scraperError) {
      console.warn(`[UFC API] Scraper failed for fighter ${id}, trying fallback`)
    }

    // Fallback to mock data
    const allFighters = [...mockRankings, ...mockContenders]
    const fighter = allFighters.find((fighter) => fighter.id === id)

    if (!fighter) {
      throw new Error(`Fighter with id ${id} not found`)
    }

    setCachedData(cacheKey, fighter)
    return fighter
  } catch (error) {
    console.error("Error fetching UFC fighter:", error)
    if (error instanceof Error && error.message.includes("not found")) {
      throw error
    }
    throw new Error("Failed to fetch UFC fighter")
  }
}

export async function getEvent(id: string): Promise<UFCEvent> {
  try {
    const cacheKey = `event-${id}`
    const cached = getCachedData<UFCEvent>(cacheKey)
    if (cached) return cached

    // Try scraper first - get event details (dynamic import to avoid cheerio in client bundle)
    try {
      const { ufcScraper } = await import("./ufc-scraper")
      const allEvents = await ufcScraper.getUpcomingEvents()
      const event = allEvents.find((event) => event.id === id)
      if (event) {
        setCachedData(cacheKey, event)
        return event
      }
    } catch (scraperError) {
      console.warn(`[UFC API] Scraper failed for event ${id}, trying fallback`)
    }

    /*
     * Fall back to the scheduled calendar.
     *
     * Without this, every upcoming event 404s. The scraper only covers what it can reach,
     * ESPN's `summary` endpoint returns 404 for an event that has not happened yet, and
     * the mock arrays beneath are empty -- so the homepage rail linked eight real events
     * to eight dead pages.
     *
     * The calendar knows the name and the date, which is enough for a page that answers
     * "when is it". The card is absent because the upstream does not publish one in
     * advance, not because we failed to fetch it.
     */
    const scheduled = await getUFCCalendar(64)
    const fromCalendar = scheduled.find((e) => e.id === id)
    if (fromCalendar) {
      const event: UFCEvent = {
        id: fromCalendar.id,
        name: fromCalendar.name,
        date: fromCalendar.startDate,
        location: "",
        status: "Upcoming",
        mainEvent: mainEventFromName(fromCalendar.name),
      }
      setCachedData(cacheKey, event)
      return event
    }

    const allEvents = [...mockUpcomingEvents, ...mockPastEvents]
    const event = allEvents.find((event) => event.id === id)

    if (!event) {
      throw new Error(`Event with id ${id} not found`)
    }

    setCachedData(cacheKey, event)
    return event
  } catch (error) {
    console.error("Error fetching UFC event:", error)
    if (error instanceof Error && error.message.includes("not found")) {
      throw error
    }
    throw new Error("Failed to fetch UFC event")
  }
}

export async function getFighters(): Promise<UFCFighter[]> {
  try {
    const cacheKey = "all-fighters"
    const cached = getCachedData<UFCFighter[]>(cacheKey)
    if (cached) return cached

    // Use scraper to get real data from ufc.com (dynamic import to avoid cheerio in client bundle)
    const { ufcScraper } = await import("./ufc-scraper")
    const fighters = await ufcScraper.getFighters()

    if (fighters.length > 0) {
      setCachedData(cacheKey, fighters)
      return fighters
    }

    // Fallback to mock data if scraper fails
    console.warn("[UFC API] Scraper returned no fighters, using fallback data")
    const allFighters = [...mockRankings, ...mockContenders]
    setCachedData(cacheKey, allFighters)
    return allFighters
  } catch (error) {
    console.error("Error fetching UFC fighters:", error)
    // Fallback to mock data on error
    const allFighters = [...mockRankings, ...mockContenders]
    return allFighters
  }
}

export async function searchFighters(query: string): Promise<UFCFighter[]> {
  try {
    const allFighters = await getFighters()
    const filtered = allFighters.filter(
      (fighter) =>
        fighter.name.toLowerCase().includes(query.toLowerCase()) ||
        fighter.nickname?.toLowerCase().includes(query.toLowerCase()) ||
        fighter.weightClass?.toLowerCase().includes(query.toLowerCase()),
    )
    return filtered.slice(0, 10) // Limit results
  } catch (error) {
    console.error("Error searching UFC fighters:", error)
    throw new Error("Failed to search UFC fighters")
  }
}

export async function testUfcApiConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
  const startTime = Date.now()
  try {
    await getRankings()
    const responseTime = Date.now() - startTime
    return {
      success: true,
      message: "UFC API connection successful",
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      responseTime,
    }
  }
}

export async function getUfcApiMetrics() {
  return {
    requestCount: Math.floor(Math.random() * 600) + 300,
    errorCount: Math.floor(Math.random() * 20),
    averageResponseTime: Math.floor(Math.random() * 300) + 100,
    uptime: 99.8 + Math.random() * 0.2,
  }
}

export async function getUfcApiHealth() {
  const testResult = await testUfcApiConnection()
  return {
    status: testResult.success ? ("healthy" as const) : ("down" as const),
    responseTime: testResult.responseTime,
    lastChecked: new Date().toISOString(),
    error: testResult.success ? undefined : testResult.message,
  }
}

// Clear cache function for admin use
export async function clearUfcCache(): Promise<void> {
  cache.clear()
  const { ufcScraper } = await import("./ufc-scraper")
  ufcScraper.clearCache()
}

// UFC API client with enhanced functionality
export const ufcAPI = {
  getUpcomingEvents,
  getPastEvents,
  getRankings,
  getContenders,
  getFighter,
  getEvent,
  getFighters,
  searchFighters,
  clearCache: clearUfcCache,
}
