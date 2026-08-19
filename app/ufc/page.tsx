import type { Metadata } from 'next'
import { Suspense } from 'react'
import { UFCSkeleton } from '@/components/ufc/ufc-skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { getUpcomingEvents, getPastEvents } from '@/lib/api/ufc'

export const metadata: Metadata = {
  title: 'UFC Schedule, Fight Cards & Rankings | Smart Live TV',
  description: 'Upcoming UFC events, full fight cards, fighter records and divisional rankings, plus official UK broadcast listings for every card.',
  alternates: { canonical: `${ENV.BASE_URL}/ufc` },
}

function safeDateFormat(dateStr?: string): string {
  if (!dateStr) return 'TBA'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'TBA'
  // Reject obviously wrong dates
  if (d.getFullYear() < 2024 || d.getFullYear() > 2030) return 'TBA'
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${ENV.BASE_URL}/ufc#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'UFC', item: `${ENV.BASE_URL}/ufc` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are all UFC events pay-per-view in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. UFC Fight Night cards are included with a TNT Sports subscription in the UK. Numbered events such as UFC 300 are sold separately as pay-per-view through discovery+. Smart Live TV publishes the full schedule and which category each event falls into.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which channel shows UFC in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TNT Sports holds the UK broadcast rights for the UFC, with streaming through discovery+. Prelims are often shown on UFC Fight Pass. Smart Live TV lists the broadcaster and UK start time for every card.',
      },
    },
    {
      '@type': 'Question',
      name: 'What time do UFC events start in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UFC cards held in the United States usually begin in the early hours of Sunday morning UK time, with prelims from around 11pm and the main card from 3am. Cards staged in Abu Dhabi or Europe fall in UK prime time instead. Smart Live TV lists the confirmed UK start time for prelims and main card on every event page.',
      },
    },
  ],
}

async function UFCContent() {
  const [upcoming, recent] = await Promise.allSettled([
    getUpcomingEvents(),
    getPastEvents(),
  ])

  const upcomingEvents = upcoming.status === 'fulfilled' 
    ? upcoming.value : []
  const recentEvents = recent.status === 'fulfilled' 
    ? recent.value : []

  // Filter out any events with obviously wrong dates
  const validUpcoming = upcomingEvents.filter(e => {
    if (!e.date) return true // TBA is OK
    const d = new Date(e.date)
    return isNaN(d.getTime()) || d.getFullYear() >= 2025
  })

  const validRecent = recentEvents.filter(e => {
    if (!e.date) return false
    const d = new Date(e.date)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    )
    return !isNaN(d.getTime()) && 
      d >= thirtyDaysAgo && 
      d.getFullYear() >= 2025
  })

  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100">
      <SchemaMarkup schema={breadcrumbSchema} />
      <SchemaMarkup schema={faqSchema} />

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 px-4 
        text-center border-b border-[var(--sl-line)]"
        style={{
          background: 'linear-gradient(135deg, #1a0000 0%, var(--sl-ground) 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src="/leagues/ufc.png"
              alt="UFC"
              width={72}
              height={72}
              className="object-contain" loading="lazy"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold 
            text-sl-text mb-4">
            UFC Schedule, Fight Cards &amp; Rankings
          </h1>
          <p className="text-sl-mute text-lg max-w-2xl mx-auto mb-8">
            Upcoming events, full fight cards, fighter records and divisional
            rankings — with UK start times and the official broadcaster for
            every card.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="#upcoming-events"
              className="bg-[var(--sl-amber)] text-black font-extrabold
                px-8 py-4 rounded-xl text-base hover:bg-[var(--sl-amber-hover)]
                transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              View Upcoming Events ↓
            </Link>
            <Link href="/scores"
              className="border border-[var(--sl-line)] hover:border-[var(--sl-amber)]/40
                text-sl-mid font-bold px-8 py-4 rounded-xl text-base">
              Live Scores
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 
        lg:px-8 py-16 space-y-16">

        {/* Upcoming Events */}
        <section id="upcoming-events" className="scroll-mt-28">
          <h2 className="text-2xl md:text-3xl font-bold 
            text-sl-text mb-8">
            Upcoming UFC Events
          </h2>
          {validUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6">
              {validUpcoming.map(event => (
                <Link
                  key={event.id}
                  href={`/ufc/events/${event.id}`}
                  className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                    rounded-2xl overflow-hidden 
                    hover:border-[var(--sl-amber)]/30 transition-all group"
                >
                  <div className="h-1.5 bg-gradient-to-r 
                    from-[var(--sl-amber)] to-[#ff6b35]" />
                  <div className="p-5">
                    <span className="inline-flex items-center gap-1.5 
                      bg-[var(--sl-amber)]/10 text-[var(--sl-amber)] text-[10px] 
                      font-extrabold uppercase tracking-wide 
                      px-2.5 py-1 rounded-full mb-3">
                      <span className="w-1.5 h-1.5 rounded-full 
                        bg-[var(--sl-amber)] animate-pulse" />
                      Upcoming
                    </span>
                    <h3 className="font-extrabold text-sl-text mb-3 
                      group-hover:text-[var(--sl-amber)] transition-colors 
                      leading-tight">
                      {event.name}
                    </h3>
                    <div className="space-y-1.5 text-sm text-sl-mute">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{safeDateFormat(event.date)}</span>
                      </div>
                      {event.location && event.location !== 'TBA' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                    {event.mainEvent && (
                      <p className="mt-3 text-xs font-semibold 
                        text-sl-mute border-t border-[var(--sl-line)] pt-3">
                        Main Event: {event.mainEvent}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
              rounded-2xl p-10 text-center">
              <Image src="/leagues/ufc.png" alt="UFC"
                width={48} height={48}
                className="object-contain mx-auto mb-4 opacity-40" />
              <h3 className="font-bold text-sl-text mb-2">
                Next Event Being Scheduled
              </h3>
              <p className="text-sl-mute text-sm max-w-sm mx-auto">
                The next UFC event details will appear here once the card
                and date are confirmed by the promotion.
              </p>
            </div>
          )}
        </section>

        {/* Recent Results — only show if we have them */}
        {validRecent.length > 0 && (
          <section className="border-t border-[var(--sl-line)] pt-16">
            <h2 className="text-2xl md:text-3xl font-bold 
              text-sl-text mb-8">
              Recent Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6">
              {validRecent.slice(0, 6).map(event => (
                <Link
                  key={event.id}
                  href={`/ufc/events/${event.id}`}
                  className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                    rounded-2xl overflow-hidden 
                    hover:border-[var(--sl-amber)]/30 transition-all group"
                >
                  <div className="h-1.5 bg-[var(--sl-line)]" />
                  <div className="p-5">
                    <span className="inline-block bg-sl-raise 
                      text-sl-mute text-[10px] font-bold uppercase 
                      tracking-wide px-2.5 py-1 rounded-full mb-3">
                      Completed
                    </span>
                    <h3 className="font-extrabold text-sl-text mb-3 
                      group-hover:text-[var(--sl-amber)] transition-colors 
                      leading-tight">
                      {event.name}
                    </h3>
                    <div className="space-y-1.5 text-sm text-sl-mute">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{safeDateFormat(event.date)}</span>
                      </div>
                      {event.location && event.location !== 'TBA' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="border-t border-[var(--sl-line)] pt-16">
          <h2 className="text-2xl font-bold text-sl-text mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {faqSchema.mainEntity.map((f: any) => (
              <div key={f.name}
                className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                  rounded-2xl p-5">
                <h3 className="font-bold text-sl-text text-sm mb-2">
                  {f.name}
                </h3>
                <p className="text-sl-mute text-sm leading-relaxed">
                  {f.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-[var(--sl-amber)]/10 pt-16 
          text-center">
          <h2 className="text-3xl font-extrabold text-sl-text mb-3">
            Follow Every UFC Fight Night
          </h2>
          <p className="text-sl-mute mb-8">
            Fight cards, fighter records, divisional rankings and UK start times.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/scores"
              className="bg-[var(--sl-amber)] text-black font-extrabold
                px-10 py-4 rounded-xl hover:bg-[var(--sl-amber-hover)] transition-all">
              Live Scores →
            </Link>
            <Link href="/news"
              className="border border-[var(--sl-line)] text-sl-mid
                font-bold px-10 py-4 rounded-xl
                hover:border-[var(--sl-amber)]/30 transition-all">
              MMA News
            </Link>
          </div>
        </section>
      </div>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-50 
        md:hidden bg-[var(--sl-ground)]/95 backdrop-blur-sm 
        border-t border-[var(--sl-line)] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="#upcoming-events"
            className="bg-[var(--sl-amber)] text-black font-bold
              text-sm py-4 rounded-2xl text-center
              touch-manipulation active:scale-[0.98]">
            Events
          </Link>
          <Link href="/scores"
            className="border border-[var(--sl-line)] text-sl-mid
              font-bold text-sm py-4 rounded-2xl text-center
              touch-manipulation">
            Live Scores
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * The async work is wrapped in Suspense HERE, inside the page, rather than in a
 * segment-level loading.tsx.
 *
 * A loading.tsx at app/ufc/ covers every descendant, including /ufc/events/[id] and
 * /ufc/fighters/[id]. That boundary starts streaming a 200 before those pages can call
 * notFound(), so an unknown fighter id answered 200 while rendering the 404 page -- a
 * soft 404. Keeping the boundary inside this file gives the index its skeleton back
 * without imposing one on the dynamic routes below it.
 */
export default function UFCPage() {
  return (
    <Suspense fallback={<UFCSkeleton />}>
      <UFCContent />
    </Suspense>
  )
}
