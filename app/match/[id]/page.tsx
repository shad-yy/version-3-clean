import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { theSportsDB } from '@/lib/api/the-sports-db'
import { MatchTabs } from '@/components/match/match-tabs'

async function getMatchData(id: string) {
  try {
    const match = await theSportsDB.lookupEvent(id)
    if (!match) return null

    // Parallel fetch lineups, timeline, stats, and team details (for fallback badges)
    const [lineup, timeline, stats, homeTeamData, awayTeamData] = await Promise.all([
      theSportsDB.lookupLineup(id).catch(() => []),
      theSportsDB.lookupTimeline(id).catch(() => []),
      theSportsDB.lookupEventStats(id).catch(() => []),
      match.idHomeTeam ? theSportsDB.lookupTeam(match.idHomeTeam).catch(() => null) : Promise.resolve(null),
      match.idAwayTeam ? theSportsDB.lookupTeam(match.idAwayTeam).catch(() => null) : Promise.resolve(null),
    ])

    return {
      match,
      lineup,
      timeline,
      stats,
      homeTeamBadge: match.strHomeTeamBadge || homeTeamData?.strTeamBadge || homeTeamData?.strTeamLogo || null,
      awayTeamBadge: match.strAwayTeamBadge || awayTeamData?.strTeamBadge || awayTeamData?.strTeamLogo || null,
    }
  } catch (err) {
    console.error(`[Match Detail Loader] Error loading match ${id}:`, err)
    return null
  }
}

function safeDateFormat(dateStr: string): string {
  if (!dateStr) return 'TBA'
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return 'TBA'
  const [y, m, d] = parts
  if (y < 2020 || y > 2030) return 'TBA'
  return new Date(Date.UTC(y, m-1, d))
    .toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric',
      month: 'long', year: 'numeric'
    })
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const data = await getMatchData(params.id)
  if (!data || !data.match) return { title: 'Match Preview' }
  
  const match = data.match
  const title = `${match.strHomeTeam} vs ${match.strAwayTeam} — Live Score & TV Guide`
  const desc = `${match.strHomeTeam} vs ${match.strAwayTeam} in the ${match.strLeague}: kick-off time, live score, lineups, and the official UK broadcaster showing the match.`
  
  return {
    title,
    description: desc,
    alternates: {
      canonical: `${ENV.BASE_URL}/match/${params.id}`,
    },
    openGraph: { title, description: desc, images: [match.strThumb || '/og-default.png'] },
  }
}

export default async function MatchPage(
  { params }: { params: { id: string } }
) {
  const data = await getMatchData(params.id)
  if (!data) notFound()

  const { match, lineup, timeline, stats, homeTeamBadge, awayTeamBadge } = data
  const homeTeam = match.strHomeTeam
  const awayTeam = match.strAwayTeam
  const league = match.strLeague
  const date = safeDateFormat(match.dateEvent)
  const venue = match.strVenue || ''
  const isCompleted = ['match finished', 'ft', 'finished', 'aet'].some(s => match.strStatus?.toLowerCase()?.includes(s))
  
  // Determine watch page for this league
  const leagueWatchMap: Record<string, string> = {
    'English Premier League': '/watch/premier-league',
    'Spanish La Liga': '/watch/la-liga',
    'German Bundesliga': '/watch/bundesliga',
    'Italian Serie A': '/watch/serie-a',
    'French Ligue 1': '/watch/ligue-1',
    'UEFA Champions League': '/watch/champions-league',
    'UEFA Europa League': '/watch/europa-league',
  }
  const watchHref = leagueWatchMap[league] || '/pricing'

  const startIso = match.dateEvent ? (match.dateEvent.includes('T') ? match.dateEvent : `${match.dateEvent}T20:00:00+00:00`) : new Date().toISOString()
  const endDateObj = new Date(startIso)
  endDateObj.setHours(endDateObj.getHours() + 2)
  const endIso = endDateObj.toISOString()

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${homeTeam} vs ${awayTeam}`,
    description: `${homeTeam} vs ${awayTeam}, a ${league} fixture. Live score, lineups, match statistics and official UK broadcast listing.`,
    startDate: startIso,
    endDate: endIso,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venue || `${homeTeam} Stadium`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GB',
      },
    },
    homeTeam: { '@type': 'SportsTeam', name: homeTeam },
    awayTeam: { '@type': 'SportsTeam', name: awayTeam },
    performer: [
      { '@type': 'SportsTeam', name: homeTeam },
      { '@type': 'SportsTeam', name: awayTeam },
    ],
    organizer: {
      '@type': 'Organization',
      name: league,
      url: `${ENV.BASE_URL}${watchHref}`,
    },
    offers: {
      '@type': 'Offer',
      url: `${ENV.BASE_URL}/pricing`,
      price: '12.00',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
    },
    superEvent: {
      '@type': 'EventSeries',
      name: league,
      url: `${ENV.BASE_URL}${watchHref}`,
    },
    url: `${ENV.BASE_URL}/match/${params.id}`,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `When does ${homeTeam} vs ${awayTeam} kick off?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${homeTeam} vs ${awayTeam} is a ${league} fixture. The confirmed kick-off time, live score, lineups and match statistics are published on this page and updated as the match progresses.`,
        },
      },
      {
        '@type': 'Question',
        name: `What channel is ${homeTeam} vs ${awayTeam} on?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In the UK, ${league} fixtures are broadcast by the competition's official rights holders, typically Sky Sports or TNT Sports depending on the fixture. Our ${league} broadcast guide lists the channel for each match.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I find the ${homeTeam} vs ${awayTeam} result?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The final score, goalscorers and full match statistics for ${homeTeam} vs ${awayTeam} are published on this page once the match finishes, and in the ${league} results archive.`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={eventSchema} />
      <SchemaMarkup schema={faqSchema} />

      {/* Hero */}
      <section 
        className="relative pt-32 pb-20 px-4 text-center border-b border-[#1a1a2a] overflow-hidden bg-[#0d0d14]"
      >
        {/* Background Event Image Overlay */}
        {match.strThumb && (
          <>
            <img 
              src={match.strThumb} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0d0d14]/95 to-[#0a0a0f]" />
          </>
        )}

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-xs font-bold text-[#00e676] uppercase tracking-[0.2em] mb-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {league}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 my-6 w-full">
            {/* Home Team Badge & Name */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a1a24]/80 border border-white/10 flex items-center justify-center p-2 backdrop-blur-sm shadow-xl">
                {homeTeamBadge ? (
                  <img src={homeTeamBadge} alt={homeTeam} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <span className="text-xl font-bold text-gray-400">{homeTeam.substring(0, 3).toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-3 text-center">{homeTeam}</h2>
            </div>

            {/* Score or VS */}
            <div className="flex flex-col items-center justify-center">
              {isCompleted && match.intHomeScore !== null ? (
                <div className="text-4xl md:text-6xl font-black text-white tracking-widest bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
                  {match.intHomeScore} - {match.intAwayScore}
                </div>
              ) : (
                <div className="text-2xl md:text-3xl font-black text-gray-500 bg-white/5 border border-white/5 px-5 py-2.5 rounded-xl tracking-wider">
                  VS
                </div>
              )}
              {match.strStatus && (
                <span className="text-xs text-[#00e676] font-bold uppercase tracking-wider mt-2.5">
                  {match.strStatus}
                </span>
              )}
            </div>

            {/* Away Team Badge & Name */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a1a24]/80 border border-white/10 flex items-center justify-center p-2 backdrop-blur-sm shadow-xl">
                {awayTeamBadge ? (
                  <img src={awayTeamBadge} alt={awayTeam} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <span className="text-xl font-bold text-gray-400">{awayTeam.substring(0, 3).toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-3 text-center">{awayTeam}</h2>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-gray-400 text-sm mb-8 flex-wrap">
            <span>📅 {date}</span>
            {match.strTime && <span>⏰ {match.strTime.split('+')[0]} BST</span>}
            {venue && <span>📍 {venue}</span>}
          </div>

          {!isCompleted && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href={watchHref}
                className="bg-[#00e676] text-black font-extrabold px-8 py-4 rounded-xl text-base hover:bg-[#00ff87] transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]"
              >
                Where to Watch →
              </Link>
              <Link href="/scores" className="border border-[#2a2a3a] hover:border-[#00e676]/30 text-gray-300 font-bold px-8 py-4 rounded-xl text-base bg-white/5">
                Live Scores
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tabs / Match Center Section */}
      <section className="bg-[#0a0a0f] border-b border-[#1a1a2a]">
        <MatchTabs
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeTeamBadge={homeTeamBadge}
          awayTeamBadge={awayTeamBadge}
          homeTeamId={match.idHomeTeam}
          awayTeamId={match.idAwayTeam}
          venue={venue}
          date={date}
          time={match.strTime || ''}
          league={league}
          lineup={lineup}
          timeline={timeline}
          stats={stats}
          watchHref={watchHref}
        />
      </section>

      {/* How to Watch */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          How to Watch {homeTeam} vs {awayTeam} Live
        </h2>
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 mb-6">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">{homeTeam} vs {awayTeam}</strong>
            {' '}is covered by the official UK rights holders for the{' '}
            <Link href={watchHref} className="text-[#00e676] hover:underline font-semibold">
              {league}
            </Link>
            . Our broadcast guide lists which channel is showing this fixture,
            the confirmed kick-off time, and where highlights are available
            afterwards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Check the Kick-Off Time', d: 'Confirm the local start time and competition round shown above.' },
            { n: '2', t: 'Find the Official Broadcaster', d: 'See which UK rights holder is showing this fixture live.' },
            { n: '3', t: 'Follow Live', d: `Track ${homeTeam} vs ${awayTeam} scores, lineups and stats here.` },
          ].map(s => (
            <div key={s.n} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold text-sm flex items-center justify-center mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-white mb-1 text-sm">{s.t}</h3>
              <p className="text-gray-400 text-xs">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ visible section (matches schema) */}
      <section className="py-16 px-4 max-w-4xl mx-auto border-t border-[#2a2a3a]">
        <h2 className="text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqSchema.mainEntity.map(f => (
            <div key={f.name} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-2">{f.name}</h3>
              <p className="text-gray-400 text-sm">
                {f.acceptedAnswer.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center border-t border-[#00e676]/10" style={{ background: 'linear-gradient(to bottom, #0a0a0f, rgba(0,230,118,0.03))' }}>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Follow Every {league} Match
        </h2>
        <p className="text-gray-400 mb-8">
          Live scores, fixtures, standings and official UK broadcast listings.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/scores" className="bg-[#00e676] text-black font-extrabold px-10 py-4 rounded-xl hover:bg-[#00ff87] transition-all">
            View Live Scores →
          </Link>
          <Link href={watchHref} className="border border-[#2a2a3a] hover:border-[#00e676]/30 text-gray-300 font-bold px-10 py-4 rounded-xl">
            View All {league} Matches
          </Link>
        </div>
      </section>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur border-t border-[#2a2a3a] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/scores" className="bg-[#00e676] text-black font-bold text-sm py-4 rounded-2xl text-center touch-manipulation">
            Live Scores
          </Link>
          <Link href={watchHref} className="border border-[#2a2a3a] text-gray-300 font-bold text-sm py-4 rounded-2xl text-center">
            TV Guide
          </Link>
        </div>
      </div>
    </div>
  )
}
