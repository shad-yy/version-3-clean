import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  venue?: string
  status?: string
  homeScore?: number | null
  awayScore?: number | null
}

interface Standing {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number
  form?: string
}

interface DynamicSEOContentProps {
  leagueName: string
  leagueSlug: string
  fixtures: Match[]
  standings: Standing[]
  baseUrl?: string
}

export function DynamicSEOContent({
  leagueName,
  leagueSlug,
  fixtures,
  standings,
  baseUrl = ENV.BASE_URL,
}: DynamicSEOContentProps) {

  const nextMatch = fixtures[0]
  const topTeam = standings[0]
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  // Generate SportsEvent schemas for next 3 fixtures
  const eventSchemas = fixtures.slice(0, 3).map(match => {
    const startIso = match.date ? (match.date.includes('T') ? match.date : `${match.date}T20:00:00+00:00`) : new Date().toISOString()
    const endDateObj = new Date(startIso)
    endDateObj.setHours(endDateObj.getHours() + 2)
    const endIso = endDateObj.toISOString()

    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${match.homeTeam} vs ${match.awayTeam}`,
      description: `${match.homeTeam} vs ${match.awayTeam}, a ${leagueName} fixture. Kick-off time, live score and match statistics.`,
      startDate: startIso,
      endDate: endIso,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: match.venue || `${match.homeTeam} Stadium`,
        // No addressCountry. It was hardcoded 'GB' for every fixture in every league,
        // which is wrong for most of them. Omitting an unknown property is valid schema;
        // asserting a false one is not.
      },
      homeTeam: { '@type': 'SportsTeam', name: match.homeTeam },
      awayTeam: { '@type': 'SportsTeam', name: match.awayTeam },
      performer: [
        { '@type': 'SportsTeam', name: match.homeTeam },
        { '@type': 'SportsTeam', name: match.awayTeam },
      ],
      organizer: {
        '@type': 'Organization',
        name: leagueName,
        url: `${baseUrl}/watch/${leagueSlug}`,
      },
      superEvent: {
        '@type': 'EventSeries',
        name: leagueName,
        url: `${baseUrl}/watch/${leagueSlug}`,
      },
      url: `${baseUrl}/match/${match.id}`,
    }
  })

  // Dynamic FAQ based on real data
  const dynamicFAQs = [
    nextMatch && {
      question: `When is the next ${leagueName} match?`,
      answer: `The next ${leagueName} match is ${nextMatch.homeTeam} vs ${nextMatch.awayTeam} on ${new Date(nextMatch.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. View live score updates, match stats, and TV schedules on Smart Live TV.`,
    },
    topTeam && {
      question: `Who is top of the ${leagueName} table?`,
      answer: `As of ${today}, ${topTeam.team} leads ${leagueName} with ${topTeam.points} points from ${topTeam.played} games (${topTeam.won}W ${topTeam.drawn}D ${topTeam.lost}L). Follow real-time standings and team stats on Smart Live TV.`,
    },
    // No broadcaster FAQ here. This component renders for every league, so a single
    // templated answer asserted UK rights holders for La Liga, Serie A, Bundesliga and
    // Ligue 1 alike — unverified for all of them. Broadcaster names belong on pages
    // backed by lib/data/broadcast-rights.ts, which carries a per-country verified date.
    {
      question: `Where can I follow ${leagueName} fixtures and results?`,
      answer: `Fixtures, kick-off times, live scores, the full table and results for ${leagueName} are published here and updated as matches are played.`,
    },
  ].filter(Boolean) as Array<{ question: string; answer: string }>

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dynamicFAQs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <div className="space-y-0">
      {/* Render schemas */}
      {eventSchemas.map((schema, i) => (
        <SchemaMarkup key={i} schema={schema} />
      ))}
      <SchemaMarkup schema={faqSchema} />

      {/* Upcoming fixtures with "how to watch" context */}
      {fixtures.length > 0 && (
        <section className="py-16 border-t border-[var(--sl-line)]">
          <h2 className="text-2xl md:text-3xl font-bold text-sl-text mb-3">
            How to Watch Upcoming {leagueName} Matches
          </h2>
          <p className="text-sl-mute text-sm mb-8 max-w-2xl">
            Confirmed kick-off times and the official UK broadcaster for
            each upcoming {leagueName} fixture. Times are shown in UK local
            time and may be changed by the competition organiser.
          </p>

          <div className="space-y-3 mb-8">
            {fixtures.slice(0, 5).map((match, i) => {
              const matchDate = (() => {
                const parts = match.date?.split('-').map(Number)
                if (!parts || parts.length !== 3) return 'TBA'
                const [y, m, d] = parts
                if (y < 2020 || y > 2030) return 'TBA'
                return new Date(Date.UTC(y, m-1, d))
                  .toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
              })()

              return (
                <div key={match.id}
                  className="flex items-center justify-between 
                    bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                    rounded-xl px-5 py-4 
                    hover:border-[var(--sl-amber)]/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sl-text text-sm">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    <p className="text-xs text-sl-mute mt-0.5">
                      {matchDate}
                      {match.venue && ` · ${match.venue}`}
                    </p>
                  </div>
                  <Link
                    href={`/match/${match.id}`}
                    className="text-xs font-semibold text-[var(--sl-amber)] 
                      hover:underline flex-shrink-0 ml-4"
                  >
                    How to watch →
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Dynamic FAQ — visible and schema-backed */}
      {dynamicFAQs.length > 0 && (
        <section className="py-16 border-t border-[var(--sl-line)]">
          <h2 className="text-2xl md:text-3xl font-bold text-sl-text mb-8">
            {leagueName} — Common Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {dynamicFAQs.map(faq => (
              <div key={faq.question}
                className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                  rounded-2xl p-5">
                <h3 className="font-bold text-sl-text text-sm mb-2">
                  {faq.question}
                </h3>
                <p className="text-sl-mute text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
