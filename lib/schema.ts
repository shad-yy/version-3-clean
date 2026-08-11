import { resolveSiteUrl, SITE_NAME } from '@/lib/config/site-url'
interface SportsEventParams {
    name: string
    homeTeam: string
    awayTeam: string
    /** ISO date or date-time. Omit rather than guess — no startDate is emitted without it. */
    date?: string
    league: string
    /** Real venue name only. Omitted entirely when unknown. */
    venue?: string
    /** Canonical URL for this fixture. */
    url?: string
}

interface FAQParams {
    question: string
    answer: string
}

/**
 * SportsEvent JSON-LD for a single fixture.
 *
 * Rules, learned the hard way:
 *  - No `offers`. We do not sell tickets or subscriptions, and a fabricated Offer
 *    (this previously advertised "£12.00 GBP" pointing at /pricing) is a
 *    structured-data misrepresentation.
 *  - No invented `startDate`. If we do not have a real kick-off timestamp we omit
 *    the property rather than substituting "now" — an invalid startDate is worse
 *    than an absent one.
 *  - No invented `location`. "{homeTeam} Stadium" is a guess, not a venue.
 *    Pass a real venue or the property is omitted.
 *
 * See reports/audit-2026-07-31.md (Persona 4, S-11) and
 * https://developers.google.com/search/docs/appearance/structured-data/event
 */
export function generateSportsEventSchema({
    name,
    homeTeam,
    awayTeam,
    date,
    league,
    venue,
    url,
}: SportsEventParams) {
    const baseUrl = resolveSiteUrl()

    // Only emit a startDate when we actually have one.
    const startIso = (() => {
        if (!date) return undefined
        const iso = date.includes("T") ? date : `${date}T00:00:00+00:00`
        const parsed = new Date(iso)
        return isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
    })()

    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name,
        description: `${name} — ${league} fixture. Live score, lineups, match statistics and the official UK broadcast listing.`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        homeTeam: { "@type": "SportsTeam", name: homeTeam },
        awayTeam: { "@type": "SportsTeam", name: awayTeam },
        competitor: [
            { "@type": "SportsTeam", name: homeTeam },
            { "@type": "SportsTeam", name: awayTeam },
        ],
        sport: "Soccer",
        superEvent: { "@type": "EventSeries", name: league },
        url: url || baseUrl,
    }

    if (startIso) {
        schema.startDate = startIso
        const endDateObj = new Date(startIso)
        endDateObj.setHours(endDateObj.getHours() + 2)
        schema.endDate = endDateObj.toISOString()
    }

    if (venue) {
        schema.location = { "@type": "Place", name: venue }
    }

    return schema
}

/**
 * ItemList of SportsEvent nodes, for pages that list many fixtures (e.g. /scores).
 * Entries without a usable kick-off timestamp are still included — the SportsEvent
 * builder simply omits startDate for those.
 */
export function generateSportsEventListSchema(
    fixtures: SportsEventParams[],
    listName: string,
    listUrl: string,
) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: listName,
        url: listUrl,
        numberOfItems: fixtures.length,
        itemListElement: fixtures.map((fixture, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: (() => {
                const { ["@context"]: _ctx, ...node } = generateSportsEventSchema(fixture) as Record<string, unknown>
                return node
            })(),
        })),
    }
}

export function generateFAQSchema(faqs: FAQParams[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    }
}

export function generateOrganizationSchema() {
    const baseUrl = resolveSiteUrl()
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        sameAs: [
            "https://twitter.com/SmartLiveTV",
            "https://facebook.com/SmartLiveTV",
            "https://www.instagram.com/smartlivetv",
        ],
    }
}

export function generateWebPageSchema(title: string, description: string, url: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: description,
        url: url,
    }
}
