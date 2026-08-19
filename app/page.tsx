import { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { Hero } from "@/components/sightline/hero"
import { LiveNowBanner } from '@/components/homepage/LiveNowBanner'
import { EventCountdown } from '@/components/homepage/EventCountdown'
import { MatchCard } from "@/components/homepage/match-card"
import { RightsLedger } from "@/components/sightline/rights-ledger"
import { LiveNow } from "@/components/sightline/live-now"
import dynamic from "next/dynamic"

const ServicePillars = dynamic(() => import("@/components/homepage/service-pillars").then(mod => ({ default: mod.ServicePillars })))
const SpotlightEvents = dynamic(() => import("@/components/homepage/spotlight-events").then(mod => ({ default: mod.SpotlightEvents })))
const LeagueTables = dynamic(() => import("@/components/homepage/league-tables").then(mod => ({ default: mod.LeagueTables })))
const NewsSection = dynamic(() => import("@/components/homepage/news-section").then(mod => ({ default: mod.NewsSection })))
const RecentPosts = dynamic(() => import("@/components/homepage/recent-posts").then(mod => ({ default: mod.RecentPosts })))
import { SiteNavigationLinks } from "@/components/seo/site-navigation-links"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: 'Where can I watch it? Sport, film and TV by country',
  description:
    'Find which service carries a match, film or series in your country. Live scores, fixtures and per-country availability, each with the date we last checked.',
  alternates: {
    canonical: ENV.BASE_URL,
  },
  openGraph: buildOpenGraph({
    title: 'Where can I watch it? Sport, film and TV by country',
    description:
      'Find which service carries a match, film or series in your country. Live scores, fixtures and per-country availability, each with the date we last checked.',
    url: ENV.BASE_URL,
  }),
}


export default async function HomePage() {
  const homepageFAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Sightline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sightline answers one question: where can I watch this, from where I am. It covers sport, film and television, naming the service that carries something in your country and the date that answer was last checked.',
        },
      },
      {
        '@type': 'Question',
        name: 'How frequently are scores and fixtures updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scores, fixtures and league tables update continuously from live data. Broadcast rights are verified by hand and carry the date they were last confirmed, because rights change by rights cycle rather than by minute.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which sports and competitions are tracked?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Football across the major European leagues, the UEFA club competitions, UFC and Formula 1, alongside film and television availability listed per country.',
        },
      },
    ],
  }

  // SpeakableSpecification for voice assistants (AEO)
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${ENV.BASE_URL}/#webpage`,
    name: 'Where can I watch it? Sport, film and TV by country',
    url: `${ENV.BASE_URL}/`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-speakable', '.faq-speakable'],
    },
    mainEntity: {
      '@id': `${ENV.BASE_URL}/#organization`,
    },
  }

  return (
    <div className="min-h-screen bg-sl-ground overflow-x-hidden text-sl-text">
      {/* Organization and WebSite are declared once, site-wide, in app/layout.tsx.
          Re-declaring them here produced two nodes sharing one @id with conflicting
          values. Only page-specific schema belongs on this page. */}
      <SchemaMarkup schema={homepageFAQSchema} />
      <SchemaMarkup schema={speakableSchema} />

      {/* ─── 1. HERO ─── */}
      <Hero />

      {/* Service Pillars (clarity strip) */}
      <ServicePillars />

      {/* The ledger: what we have verified, and plainly what we have not.
          Replaces the old broadcast resolver, which led with United Kingdom in both
          example rows and read as a coverage claim rather than a coverage limit. */}
      <RightsLedger />

      {/* Live now: three fixtures with the broadcaster for the reader's own
          country, or an explicit "not verified" where we hold nothing. */}
      <LiveNow />

      {/* Spotlight Events (wow section) */}
      <SpotlightEvents />

      {/* ─── 2. NEWS (above match cards) ─── */}
      <section className="py-12 md:py-16 bg-[#0a0a0f] border-t border-[#1a1a2a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <NewsSection />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 3. LIVE FIXTURES / MATCH CARDS ─── */}
      <ScrollReveal>
        <MatchCard />
      </ScrollReveal>

      {/* ─── 4. STANDINGS / LEAGUE TABLES ─── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      <ScrollReveal>
        <LeagueTables />
      </ScrollReveal>

      {/* ─── 7. LIVE NOW BANNER ─── */}
      <LiveNowBanner />

      <EventCountdown />

      {/* ─── 8. BLOG POSTS (recent posts at bottom) ─── */}
      <ScrollReveal>
        <RecentPosts />
      </ScrollReveal>

      {/* ─── 9. SITE NAVIGATION (SEO internal links) ─── */}
      <SiteNavigationLinks />

    </div>
  )
}
