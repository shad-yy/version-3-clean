import { resolveSiteUrl } from '@/lib/config/site-url'
export interface StructuredDataProps {
  type: "Organization" | "WebSite" | "SportsEvent" | "SportsTeam" | "Person"
  data: any
}

export function generateStructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-live-tv.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return {
    __html: JSON.stringify(structuredData),
  }
}

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Smart Live TV",
  url: "https://smart-live-tv.vercel.app",
  logo: "https://smart-live-tv.vercel.app/images/logo.png",
  description: "Your ultimate sports destination for live scores, news, and updates.",
  sameAs: ["https://twitter.com/SmartLiveTV", "https://facebook.com/SmartLiveTV"],
}

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Smart Live TV",
  url: "https://smart-live-tv.vercel.app",
  description: "Get live scores, news, and updates from football, UFC, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://smart-live-tv.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export function createSportsEventStructuredData(event: any) {
  const baseUrl = resolveSiteUrl()
  const startIso = event.date ? (event.date.includes('T') ? event.date : `${event.date}T20:00:00+00:00`) : new Date().toISOString()
  const endDateObj = new Date(startIso)
  endDateObj.setHours(endDateObj.getHours() + 2)
  const endIso = endDateObj.toISOString()

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${event.homeTeam} vs ${event.awayTeam}`,
    description: `Watch ${event.homeTeam} vs ${event.awayTeam} live stream in 4K UHD.`,
    startDate: startIso,
    endDate: endIso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue || `${event.homeTeam} Stadium`,
      address: {
        "@type": "PostalAddress",
        addressCountry: "GB",
      },
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: event.homeTeam,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: event.awayTeam,
    },
    performer: [
      { "@type": "SportsTeam", name: event.homeTeam },
      { "@type": "SportsTeam", name: event.awayTeam },
    ],
    organizer: {
      "@type": "Organization",
      name: event.league || "Premier League",
      url: `${baseUrl}/watch/premier-league`,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/pricing`,
      price: "12.00",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
    },
    superEvent: {
      "@type": "EventSeries",
      name: event.league || "Premier League",
      url: `${baseUrl}/watch/premier-league`,
    },
    sport: "Football",
  }
}

export function createSportsTeamStructuredData(team: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Football",
    logo: team.logo,
    foundingDate: team.founded?.toString(),
    location: {
      "@type": "Place",
      name: team.country,
    },
  }
}
