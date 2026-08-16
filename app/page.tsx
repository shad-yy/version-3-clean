import { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { buildOpenGraph } from "@/lib/seo/open-graph"
import { SchemaMarkup } from "@/components/SchemaMarkup"

import { HeroSection } from "@/components/homepage/hero-section"
import { LiveNowBanner } from '@/components/homepage/LiveNowBanner'
import { EventCountdown } from '@/components/homepage/EventCountdown'
import { MatchCard } from "@/components/homepage/match-card"
import { BroadcastResolver } from "@/components/homepage/broadcast-resolver"
import dynamic from "next/dynamic"

const ServicePillars = dynamic(() => import("@/components/homepage/service-pillars").then(mod => ({ default: mod.ServicePillars })))
const SpotlightEvents = dynamic(() => import("@/components/homepage/spotlight-events").then(mod => ({ default: mod.SpotlightEvents })))
const LeagueTables = dynamic(() => import("@/components/homepage/league-tables").then(mod => ({ default: mod.LeagueTables })))
const NewsSection = dynamic(() => import("@/components/homepage/news-section").then(mod => ({ default: mod.NewsSection })))
const RecentPosts = dynamic(() => import("@/components/homepage/recent-posts").then(mod => ({ default: mod.RecentPosts })))
import { SiteNavigationLinks } from "@/components/seo/site-navigation-links"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: 'Smart Live TV | Real-Time Live Sports Scores & Global Broadcast Guide',
  description:
    'Live sports scores, match schedules, league standings, team stats, and official broadcast guides for Premier League, Champions League, UFC, F1, and more.',
  alternates: {
    canonical: ENV.BASE_URL,
  },
  openGraph: buildOpenGraph({
    title: 'Smart Live TV | Real-Time Live Sports Scores & Global Broadcast Guide',
    description:
      'Live sports scores, match schedules, league standings, team stats, and official broadcast guides for Premier League, Champions League, UFC, F1, and more.',
    url: ENV.BASE_URL,
  }),
}


export default function HomePage() {
  const homepageFAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Smart Live TV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Smart Live TV is a real-time live sports score, telemetry, and official TV broadcast directory hub covering Premier League, Champions League, UFC, Formula 1, and global leagues.',
        },
      },
      {
        '@type': 'Question',
        name: 'How frequently are scores and fixtures updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Match scores, live match stats, and league tables are updated in real time via live sports telemetry APIs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which sports and competitions are tracked?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Smart Live TV tracks top European football leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1), UEFA Champions League, Europa League, UFC, Formula 1, and international tournaments.',
        },
      },
    ],
  }

  // SpeakableSpecification for voice assistants (AEO)
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${ENV.BASE_URL}/#webpage`,
    name: 'Smart Live TV — Real-Time Live Sports Scores & Global Broadcast Guide',
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
    <div className="min-h-screen bg-gray-950 overflow-x-hidden text-gray-100">
      {/* Organization and WebSite are declared once, site-wide, in app/layout.tsx.
          Re-declaring them here produced two nodes sharing one @id with conflicting
          values. Only page-specific schema belongs on this page. */}
      <SchemaMarkup schema={homepageFAQSchema} />
      <SchemaMarkup schema={speakableSchema} />

      {/* ─── 1. HERO ─── */}
      <HeroSection />

      {/* Service Pillars (clarity strip) */}
      <ServicePillars />

      {/* Where to watch — the differentiator, stated plainly and server-rendered */}
      <BroadcastResolver />

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
