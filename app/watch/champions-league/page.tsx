import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { LeagueBadge } from '@/components/league/league-badge'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { getUEFAMatches, getUEFAResults, UEFA_COMPETITIONS } from '@/lib/api/football-data'
import { getCurrentSeason } from '@/lib/api/unified-sports-api'

export const metadata: Metadata = {
  title: 'UEFA Champions League Live Scores & Fixtures | Sightline',
  description:
    'Follow UEFA Champions League live scores, upcoming matchday fixtures, group standings, and official TV broadcast schedules.',
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/champions-league`,
  },
  openGraph: {
    title: 'UEFA Champions League Live Scores & Fixtures | Sightline',
    description: 'Follow UEFA Champions League live scores, upcoming matchday fixtures, group standings, and official TV broadcast schedules.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Sightline' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UEFA Champions League Live Scores & Fixtures | Sightline',
    images: ['/og-default.png'],
  },
}

const fetchWithTimeout = async (url: string, ms = 5000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)
    return res.ok ? res.json() : null
  } catch {
    clearTimeout(timeout)
    return null
  }
}

function safeBadge(url: string | null | undefined, size: 'tiny' | 'small' | 'medium' = 'small'): string {
  if (!url) return '/placeholder-logo.png'
  if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
  return `${url}/${size}`
}

function safeParseSportsDBDate(date: string, time?: string): Date | null {
  if (!date) return null
  const parts = date.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [year, month, day] = parts
  if (year < 2020 || year > 2030) return null
  if (time) {
    const t = time.split('+')[0].split('-')[0]
    const [h, m] = t.split(':').map(Number)
    return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
  }
  return new Date(Date.UTC(year, month - 1, day))
}


const FormPill = ({ result }: { result: string }) => {
  const colors: Record<string, string> = {
    W: 'bg-sl-amber text-black',
    D: 'bg-sl-mute text-sl-text',
    L: 'bg-red-500 text-sl-text',
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || 'bg-sl-raise text-sl-text'
        }`}
    >
      {result}
    </span>
  )
}

const renderForm = (formStr?: string) => {
  if (!formStr) return null
  const results = formStr.replace(/[^WDL]/g, '').split('').slice(-5)
  if (results.length === 0) return null
  return (
    <div className="flex items-center gap-1 justify-center">
      {results.map((r, idx) => (
        <FormPill key={`${r}-${idx}`} result={r} />
      ))}
    </div>
  )
}

export default async function ChampionsLeaguePage() {
  const [upcoming, results] = await Promise.allSettled([
    getUEFAMatches(UEFA_COMPETITIONS.UCL, 8),
    getUEFAResults(UEFA_COMPETITIONS.UCL, 4),
  ])
  const upcomingMatches = upcoming.status === 'fulfilled' ? upcoming.value : []
  const recentResults = results.status === 'fulfilled' ? results.value : []

  const [nextEvent, standings, pastEvents] = await Promise.allSettled([
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4480'),
    fetchWithTimeout(`https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4480&s=${getCurrentSeason()}`),
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4480'),
  ])

  const nextJson = nextEvent.status === 'fulfilled' ? nextEvent.value : null
  const tableJson = standings.status === 'fulfilled' ? standings.value : null
  const pastJson = pastEvents.status === 'fulfilled' ? pastEvents.value : null

  const nextFixture = nextJson?.events?.[0] ?? null
  const tableRows: any[] = Array.isArray(tableJson?.table) ? tableJson.table : []
  const recent: any[] = Array.isArray(pastJson?.events) ? pastJson.events.slice(0, 3) : []

  const faqs = [
    {
      question: 'Where can I check Champions League live scores?',
      answer:
        'Sightline updates all UEFA Champions League matchday scores, live stats, and group tables in real time.',
    },
    {
      question: 'Which networks broadcast UEFA Champions League?',
      answer:
        'In the UK, TNT Sports and BBC highlights broadcast UCL matches. Check official listings for global regional broadcast partners.',
    },
    {
      question: 'How to stay updated on UCL matchdays?',
      answer: "Use our live scoreboard widget to follow real-time match events, goals, and group standings.",
    },
  ]

  const faqSchema = generateFAQSchema(faqs)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/champions-league#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'UEFA Champions League', item: `${ENV.BASE_URL}/watch/champions-league` },
    ],
  }

  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-sl-text">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* HERO */}
      <FadeIn>
        <section
          className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #001a4e 0%, var(--sl-ground) 100%)',
            borderColor: '#c8a951',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <LeagueBadge
                src="https://r2.thesportsdb.com/images/media/league/badge/ucl.png"
                localSrc="/leagues/champions-league.png"
                alt="UEFA Champions League"
                size={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">The Greatest Club Competition on Earth</h1>
            {nextFixture ? (
              <p className="text-sl-mid text-sm md:text-base mb-10">
                Next fixture:{' '}
                <span className="text-sl-text font-bold">
                  {nextFixture.strEvent || `${nextFixture.strHomeTeam} vs ${nextFixture.strAwayTeam}`}
                </span>{' '}
                —{' '}
                <span className="text-sl-mid">
                  {nextFixture.dateEvent ? safeParseSportsDBDate(nextFixture.dateEvent)?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </span>
              </p>
            ) : (
              <p className="text-sl-mid text-sm md:text-base mb-10">Next fixture: TBA</p>
            )}
            <ShimmerButton
              href="/scores"
              variant="league"
              leagueColor="#c8a951"
              className="px-8 py-4 text-lg rounded-lg"
            >
              View Live Scores &amp; Fixtures →
            </ShimmerButton>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-0">
          {/* UPCOMING MATCHES */}
          {upcomingMatches.length > 0 && (
            <section className="pb-16 md:pb-20">
              <h2 className="text-2xl font-bold text-sl-text mb-6">
                Upcoming Matches
              </h2>
              <div className="space-y-3">
                {upcomingMatches.map(match => (
                  <div key={match.id}
                    className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-sl-text font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-sl-text text-lg">
                          v
                        </span>
                        <p className="text-[10px] text-sl-dim mt-0.5">
                          {new Date(match.utcDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <img src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                        <span className="text-sl-text font-semibold text-sm 
                          truncate max-w-[120px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RECENT RESULTS (football-data) */}
          {recentResults.length > 0 && (
            <section className="pb-16 md:pb-20">
              <h2 className="text-2xl font-bold text-sl-text mb-6">
                Recent Results
              </h2>
              <div className="space-y-3">
                {recentResults.map(match => (
                  <div key={match.id}
                    className="bg-[var(--sl-surface)] border border-[var(--sl-line)] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-sl-text font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-sl-text text-lg">
                          {match.score.fullTime.home ?? '-'}
                          {' — '}
                          {match.score.fullTime.away ?? '-'}
                        </span>
                        <p className="text-[10px] text-sl-dim mt-0.5">
                          {new Date(match.utcDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <img src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                        <span className="text-sl-text font-semibold text-sm 
                          truncate max-w-[120px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STANDINGS */}
          {tableRows.length > 0 ? (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Standings</h2>
              <div className="bg-sl-ground/60 rounded-2xl border border-sl-line overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--sl-panel)' }}>
                      <tr className="text-xs font-bold uppercase border-b" style={{ borderColor: '#c8a951' }}>
                        <th className="py-3 px-3 text-center w-10">#</th>
                        <th className="py-3 px-3 text-left">Team</th>
                        <th className="py-3 px-3 text-center w-10">P</th>
                        <th className="py-3 px-3 text-center w-10">W</th>
                        <th className="py-3 px-3 text-center w-10">D</th>
                        <th className="py-3 px-3 text-center w-10">L</th>
                        <th className="py-3 px-3 text-center w-10">GD</th>
                        <th className="py-3 px-3 text-center">Form</th>
                        <th className="py-3 px-3 text-center w-12 text-sl-text">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((t: any, idx: number) => {
                        const rank = Number(t.intRank ?? idx + 1)
                        const played = Number(t.intPlayed ?? 0)
                        const win = Number(t.intWin ?? 0)
                        const draw = Number(t.intDraw ?? 0)
                        const loss = Number(t.intLoss ?? 0)
                        const gd = Number(t.intGoalDifference ?? 0)
                        const pts = Number(t.intPoints ?? 0)
                        const top8 = rank <= 8
                        return (
                          <tr
                            key={`${t.idTeam || t.strTeam || idx}`}
                            className="border-b border-sl-line/60 hover:bg-sl-surface/40 transition-colors even:bg-white/[0.02]"
                          >
                            <td className="py-3 px-3 text-center text-sl-mute font-bold">{rank}</td>
                            <td className="py-3 px-3">
                              <div
                                className={`flex items-center gap-3 pl-3 ${top8 ? 'border-l-2' : ''}`}
                                style={top8 ? { borderColor: '#c8a951' } : undefined}
                              >
                                <img
                                  src={safeBadge(t.strTeamBadge || t.strBadge)}
                                  alt={t.strTeam}
                                  width={24} height={24}
                                  className="w-6 h-6 object-contain" loading="lazy"
                                />
                                <span className="font-bold text-sl-text line-clamp-1">{t.strTeam}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center text-sl-mute">{played}</td>
                            <td className="py-3 px-3 text-center text-sl-mute">{win}</td>
                            <td className="py-3 px-3 text-center text-sl-mute">{draw}</td>
                            <td className="py-3 px-3 text-center text-sl-mute">{loss}</td>
                            <td className="py-3 px-3 text-center text-sl-mute">{gd}</td>
                            <td className="py-3 px-3 text-center">{renderForm(t.strForm)}</td>
                            <td className="py-3 px-3 text-center font-extrabold text-sl-text">{pts}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </section>
            </FadeIn>
          ) : (
            <FadeIn direction="up">
              <section className="pb-16 md:pb-20">
              <div className="bg-sl-ground/60 rounded-2xl border border-sl-line p-8 text-center">
                <p className="text-sl-mute text-sm mb-2">
                  Live group standings are available to verified league data partners.
                </p>
                <p className="text-sl-text font-bold text-lg mb-4">
                  2025–26 UEFA Champions League
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
                  {[
                    { round: 'Quarter-Finals', date: 'Apr 2026' },
                    { round: 'Semi-Finals', date: 'Apr/May 2026' },
                    { round: 'Final', date: '30 May 2026 · Munich' },
                    { round: 'Current Stage', date: 'Semi-Finals' },
                  ].map(item => (
                    <div key={item.round} className="bg-sl-surface rounded-xl p-3 border border-sl-line">
                      <div className="text-sl-mute text-xs mb-1">{item.round}</div>
                      <div className="text-sl-text font-bold text-sm">{item.date}</div>
                    </div>
                  ))}
                </div>
                <Link href="/scores" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-black text-sm"
                  style={{ backgroundColor: '#c8a951' }}>
                  Follow Live Scores →
                </Link>
              </div>
              </section>
            </FadeIn>
          )}


          {/* UCL GREATEST MOMENTS */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[var(--sl-line)]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">UCL Greatest Moments</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'The Istanbul Miracle',
                  subtitle: 'Liverpool 3-3 AC Milan, 2005 Final',
                  body:
                    'Down 3-0 at half time. Liverpool scored 3 in 6 minutes. Won on penalties. The greatest comeback in football history.',
                },
                {
                  title: "Ronaldo's Bicycle Kick",
                  subtitle: 'Real Madrid vs Juventus, 2018 QF',
                  body:
                    'Cristiano Ronaldo scored one of the greatest goals ever seen. Even Juventus fans gave him a standing ovation.',
                },
                {
                  title: "Messi's Wembley Masterclass",
                  subtitle: 'Barcelona 3-1 Manchester United, 2011 Final',
                  body:
                    'Messi scored twice as Barcelona put on a tactical masterclass. Widely regarded as the greatest UCL final performance ever.',
                },
              ].map((c) => (
                <div key={c.title} className="bg-sl-ground/60 rounded-2xl border border-sl-line p-6">
                  <div className="border-b pb-3 mb-3" style={{ borderColor: '#c8a951' }}>
                    <h3 className="font-extrabold text-sl-text">{c.title}</h3>
                    <p className="text-xs text-sl-mute mt-1">{c.subtitle}</p>
                  </div>
                  <p className="text-sm text-sl-mid leading-relaxed">{c.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* HOW TO FOLLOW */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[var(--sl-line)]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Matchday Coverage</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Check Live Scores', body: 'Follow real-time scores updates and goal notifications.' },
                { n: 2, title: 'Inspect Standings', body: 'View live updated group stage tables and goal difference.' },
                { n: 3, title: 'Broadcast Listings', body: 'Find official television networks carrying each fixture globally.' },
              ].map((s) => (
                <div key={s.n} className="bg-sl-ground/60 rounded-2xl border border-sl-line p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-black mb-4" style={{ backgroundColor: '#c8a951' }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold text-sl-text mb-2">{s.title}</h3>
                  <p className="text-sm text-sl-mute">{s.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* FAQ */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[var(--sl-line)]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">FAQ</h2>
              <StaggerIn className="space-y-6">
              {faqs.map((f) => (
                <div key={f.question} className="bg-sl-ground/60 rounded-2xl border border-sl-line p-6">
                  <h3 className="font-bold text-sl-text mb-2">{f.question}</h3>
                  <p className="text-sm text-sl-mute">{f.answer}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>
        </div>

        {/* Right Column CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-sl-ground/60 rounded-3xl border border-sl-line overflow-hidden">
            <div className="p-6 border-b" style={{ borderColor: '#c8a951' }}>
              <h3 className="text-lg font-extrabold text-sl-text">Tonight&apos;s Champions League</h3>
              <p className="text-sm text-sl-mute mt-2">
                Live scores, confirmed kick-off times, and the broadcaster for each country we have verified.
              </p>
            </div>
            <div className="p-6">
              <Link
                href="/scores"
                className="block w-full text-center py-4 rounded-xl text-black font-extrabold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#c8a951' }}
              >
                View Live Scores →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
