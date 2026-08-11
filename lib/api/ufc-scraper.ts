// UFC HTML Scraper - Scrapes real data from ufc.com
import { load } from "cheerio"
import type { UFCEvent, UFCFighter } from "@/lib/types"

interface ScrapedUFCEvent {
  id: string
  name: string
  date: string
  location: string
  status: "Upcoming" | "Past"
  image?: string
  mainEvent?: string
  fights: Array<{
    id: string
    fighter1: { name: string; record?: string; image?: string; url?: string }
    fighter2: { name: string; record?: string; image?: string; url?: string }
    weightClass: string
    isMainEvent: boolean
    isTitleFight: boolean
    cardSegment: string
    result?: string | null
  }>
  description?: string
  venue?: string
}

interface ScrapedUFCFighter {
  id: string
  name: string
  nickname?: string
  record: string
  weightClass: string
  image?: string
  country?: string
  height?: string
  weight?: string
  reach?: string
  stance?: string
  dob?: string
  wins?: number
  losses?: number
  draws?: number
  noContests?: number
}

class UFCScraper {
  private baseUrl = "https://www.ufc.com"
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchWithCache(url: string): Promise<string> {
    const cacheKey = url
    const cached = this.cache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      this.cache.set(cacheKey, { data: html, timestamp: now })
      return html
    } catch (error) {
      console.error(`[UFC Scraper] Error fetching ${url}:`, error)
      throw error
    }
  }

  private parseDate(dateStr: string): string {
    // Parse various date formats from UFC website
    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0]
      }
    } catch {
      // Fallback parsing
    }
    return dateStr
  }

  async getUpcomingEvents(): Promise<UFCEvent[]> {
    try {
      const html = await this.fetchWithCache(`${this.baseUrl}/events`)
      const $ = load(html)

      const events: ScrapedUFCEvent[] = []

      // Scrape events from the events page
      $(".c-card-event--result, .c-card-event--upcoming").each((_, element) => {
        const $el = $(element)
        const eventLink = $el.find("a").attr("href")
        const eventName = $el.find(".c-card-event__headline").text().trim()
        const eventDate = $el.find(".c-card-event__date").text().trim()
        const eventLocation = $el.find(".c-card-event__location").text().trim()
        const eventImage = $el.find("img").attr("src") || $el.find("img").attr("data-src")

        if (eventName && eventDate) {
          const eventId = eventLink?.split("/").pop() || `ufc-${Date.now()}-${events.length}`
          const isUpcoming = $el.hasClass("c-card-event--upcoming")

          events.push({
            id: eventId,
            name: eventName,
            date: this.parseDate(eventDate),
            location: eventLocation || "TBD",
            status: isUpcoming ? "Upcoming" : "Past",
            image: eventImage ? (eventImage.startsWith("http") ? eventImage : `${this.baseUrl}${eventImage}`) : undefined,
            fights: [],
          })
        }
      })

      // For each event, fetch detailed fight card
      for (const event of events.slice(0, 10)) {
        // Limit to 10 events to avoid rate limiting
        try {
          const eventDetails = await this.getEventDetails(event.id)
          if (eventDetails) {
            event.fights = eventDetails.fights ?? []
            event.mainEvent = eventDetails.mainEvent
            event.description = eventDetails.description
            event.venue = eventDetails.venue
          }
        } catch (err) {
          console.warn(`[UFC Scraper] Failed to fetch details for ${event.id}:`, err)
        }
      }

      return events.map(this.transformEvent)
    } catch (error) {
      console.error("[UFC Scraper] Error scraping upcoming events:", error)
      return []
    }
  }

  async getEventDetails(eventId: string): Promise<Partial<ScrapedUFCEvent> | null> {
    try {
      const html = await this.fetchWithCache(`${this.baseUrl}/event/${eventId}`)
      const $ = load(html)

      const fights: ScrapedUFCEvent["fights"] = []
      let mainEvent: string | undefined

      // Scrape fight card
      $(".c-listing-fight, .c-card-matchup").each((_, element) => {
        const $el = $(element)
        const fighter1Name = $el.find(".c-listing-fight__corner-name--red, .c-card-matchup__corner-name--red").first().text().trim()
        const fighter2Name = $el.find(".c-listing-fight__corner-name--blue, .c-card-matchup__corner-name--blue").first().text().trim()
        const weightClass = $el.find(".c-listing-fight__class, .c-card-matchup__class").text().trim()
        const isMain = $el.hasClass("c-listing-fight--main") || $el.hasClass("c-card-matchup--main")
        const isTitle = weightClass.toLowerCase().includes("title") || weightClass.toLowerCase().includes("championship")

        if (fighter1Name && fighter2Name) {
          const fightId = `fight-${eventId}-${fights.length}`
          fights.push({
            id: fightId,
            fighter1: { name: fighter1Name },
            fighter2: { name: fighter2Name },
            weightClass: weightClass || "TBD",
            isMainEvent: isMain,
            isTitleFight: isTitle,
            cardSegment: isMain ? "Main Card" : "Prelims",
          })

          if (isMain) {
            mainEvent = `${fighter1Name} vs ${fighter2Name}`
          }
        }
      })

      // Get event description
      const description = $(".c-hero__description, .event-description").text().trim()

      // Get venue
      const venue = $(".c-hero__venue, .event-venue").text().trim()

      return {
        fights,
        mainEvent,
        description,
        venue,
      }
    } catch (error) {
      console.error(`[UFC Scraper] Error fetching event details for ${eventId}:`, error)
      return null
    }
  }

  async getFighters(): Promise<UFCFighter[]> {
    try {
      const html = await this.fetchWithCache(`${this.baseUrl}/athletes`)
      const $ = load(html)

      const fighters: ScrapedUFCFighter[] = []

      // Scrape fighters from athletes page
      $(".c-listing-athlete, .c-card-athlete").each((_, element) => {
        const $el = $(element)
        const fighterLink = $el.find("a").attr("href")
        const fighterName = $el.find(".c-listing-athlete__name, .c-card-athlete__name").text().trim()
        const fighterRecord = $el.find(".c-listing-athlete__record, .c-card-athlete__record").text().trim()
        const fighterImage = $el.find("img").attr("src") || $el.find("img").attr("data-src")
        const weightClass = $el.find(".c-listing-athlete__class, .c-card-athlete__class").text().trim()

        if (fighterName) {
          const fighterId = fighterLink?.split("/").pop() || `fighter-${Date.now()}-${fighters.length}`

          fighters.push({
            id: fighterId,
            name: fighterName,
            record: fighterRecord || "0-0-0",
            weightClass: weightClass || "Unknown",
            image: fighterImage ? (fighterImage.startsWith("http") ? fighterImage : `${this.baseUrl}${fighterImage}`) : undefined,
          })
        }
      })

      return fighters.map(this.transformFighter)
    } catch (error) {
      console.error("[UFC Scraper] Error scraping fighters:", error)
      return []
    }
  }

  async getFighterDetails(fighterId: string): Promise<UFCFighter | null> {
    try {
      const html = await this.fetchWithCache(`${this.baseUrl}/athlete/${fighterId}`)
      const $ = load(html)

      const name = $(".c-hero__headline, .fighter-name").text().trim()
      const nickname = $(".c-hero__nickname, .fighter-nickname").text().trim()
      const record = $(".c-hero__record, .fighter-record").text().trim()
      const weightClass = $(".c-hero__class, .fighter-class").text().trim()
      const image = $(".c-hero__image img, .fighter-image img").attr("src") || $(".c-hero__image img, .fighter-image img").attr("data-src")
      const country = $(".c-hero__country, .fighter-country").text().trim()
      const height = $(".c-stat__label:contains('Height')").next().text().trim()
      const weight = $(".c-stat__label:contains('Weight')").next().text().trim()
      const reach = $(".c-stat__label:contains('Reach')").next().text().trim()
      const stance = $(".c-stat__label:contains('Stance')").next().text().trim()
      const dob = $(".c-stat__label:contains('DOB')").next().text().trim()

      // Parse record
      const recordMatch = record.match(/(\d+)-(\d+)-(\d+)/)
      const wins = recordMatch ? parseInt(recordMatch[1]) : 0
      const losses = recordMatch ? parseInt(recordMatch[2]) : 0
      const draws = recordMatch ? parseInt(recordMatch[3]) : 0

      if (!name) return null

      return this.transformFighter({
        id: fighterId,
        name,
        nickname,
        record: record || "0-0-0",
        weightClass: weightClass || "Unknown",
        image: image ? (image.startsWith("http") ? image : `${this.baseUrl}${image}`) : undefined,
        country,
        height,
        weight,
        reach,
        stance,
        dob,
        wins,
        losses,
        draws,
        noContests: 0,
      })
    } catch (error) {
      console.error(`[UFC Scraper] Error fetching fighter details for ${fighterId}:`, error)
      return null
    }
  }

  private transformEvent(event: ScrapedUFCEvent): UFCEvent {
      return {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        status: event.status,
        image: event.image,
        mainEvent: event.mainEvent,
        fights: event.fights.map((fight) => ({
          id: fight.id,
          fighter1: { name: fight.fighter1.name, url: fight.fighter1.url },
          fighter2: { name: fight.fighter2.name, url: fight.fighter2.url },
          weightClass: fight.weightClass,
          isMainEvent: fight.isMainEvent,
          isTitleFight: fight.isTitleFight,
          cardSegment: fight.cardSegment as "Main Card" | "Prelims" | "Early Prelims",
          result: fight.result || null,
        })),
      }
  }

  private transformFighter(fighter: ScrapedUFCFighter): UFCFighter {
    return {
      id: fighter.id,
      name: fighter.name,
      nickname: fighter.nickname,
      record: fighter.record,
      weightClass: fighter.weightClass,
      photo: fighter.image,
      country: fighter.country,
      height: fighter.height,
      weight: fighter.weight,
      reach: fighter.reach,
      stats: {
        wins: fighter.wins ?? 0,
        losses: fighter.losses ?? 0,
        draws: fighter.draws ?? 0,
        koTko: 0,
        submissions: 0,
        decisions: 0,
        stance: fighter.stance,
        dob: fighter.dob,
      },
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const ufcScraper = new UFCScraper()

