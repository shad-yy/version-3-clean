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
  title: 'Watch UEFA Europa League Live | Sports Data Hub',
  description:
    'UEFA Europa League fixtures, league phase table and results — with confirmed UK kick-off times and the official TNT Sports broadcast listing for every match.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${ENV.BASE_URL}/watch/europa-league`,
  },
  openGraph: {
    title: 'Watch UEFA Europa League Live | Sports Data Hub',
    description: 'UEFA Europa League fixtures, league phase table and results — with confirmed UK kick-off times and the official TNT Sports broadcast listing for every match.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch UEFA Europa League Live | Sports Data Hub',
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
    W: 'bg-green-500 text-black',
    D: 'bg-gray-500 text-white',
    L: 'bg-red-500 text-white',
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || 'bg-gray-700 text-white'
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

export default async function EuropaLeaguePage() {
  const [upcoming, results] = await Promise.allSettled([
    getUEFAMatches(UEFA_COMPETITIONS.UEL, 8),
    getUEFAResults(UEFA_COMPETITIONS.UEL, 4),
  ])
  const upcomingMatches = upcoming.status === 'fulfilled' ? upcoming.value : []
  const recentResults = results.status === 'fulfilled' ? results.value : []

  const [nextEvent, standings, pastEvents] = await Promise.allSettled([
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4735'),
    fetchWithTimeout(`https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4735&s=${getCurrentSeason()}`),
    fetchWithTimeout('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4735'),
  ])

  const nextJson = nextEvent.status === 'fulfilled' ? nextEvent.value : null
  const tableJson = standings.status === 'fulfilled' ? standings.value : null
  const pastJson = pastEvents.status === 'fulfilled' ? pastEvents.value : null

  const nextFixture = nextJson?.events?.[0] ?? null
  const tableRows: any[] = Array.isArray(tableJson?.table) ? tableJson.table : []
  const recent: any[] = Array.isArray(pastJson?.events) ? pastJson.events.slice(0, 3) : []

  const faqs = [
    {
      question: 'How to watch Europa League live in the UK?',
      answer:
        'In the UK, TNT Sports holds the exclusive rights to broadcast the UEFA Europa League, covering both the League Phase and the knockout rounds. discovery+ is the official streaming platform for TNT Sports.',
    },
    {
      question: 'Where can I stream the Europa League?',
      answer:
        'discovery+ carries every TNT Sports channel and is the official streaming route for the Europa League in the UK. It is also available as an add-on through Sky, Virgin Media and EE TV for existing customers.',
    },
    {
      question: 'Can I watch the Europa League from abroad?',
      answer:
        'discovery+ and TNT Sports are geo-restricted to the UK and Ireland. Outside those territories the Europa League is licensed to different broadcasters — for example CBS Sports and Paramount+ in the United States, and beIN Sports across much of the Middle East and North Africa.',
    },
    {
      question: 'Which TV channel is the Europa League on in the UK?',
      answer:
        'The Europa League is broadcast on the TNT Sports channels (TNT Sports 1, 2, 3 and 4), available on Sky, Virgin Media, EE TV and via discovery+.',
    },
    {
      question: 'Is any Europa League coverage free in the UK?',
      answer:
        'Live Europa League matches are not free-to-air in the UK. TNT Sports occasionally makes selected finals available on its free YouTube channel, and highlights are published after each matchweek, but the full live schedule requires a TNT Sports or discovery+ subscription.',
    },
  ]


  const faqSchema = generateFAQSchema(faqs)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/watch/europa-league#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Watch Live', item: `${ENV.BASE_URL}/watch` },
      { '@type': 'ListItem', position: 3, name: 'UEFA Europa League', item: `${ENV.BASE_URL}/watch/europa-league` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* HERO */}
      <FadeIn>
        <section
          className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #2a1000 0%, #0a0a0f 100%)',
            borderColor: '#f97316',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <LeagueBadge
                src="https://www.thesportsdb.com/images/media/league/badge/yvwvqu1432120355.png"
                localSrc="/leagues/europa-league.png"
                alt="UEFA Europa League"
                size={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">The Europa League — Every Match Live</h1>
            {nextFixture ? (
              <p className="text-gray-300 text-sm md:text-base mb-10">
                Next fixture:{' '}
                <span className="text-white font-bold">
                  {nextFixture.strEvent || `${nextFixture.strHomeTeam} vs ${nextFixture.strAwayTeam}`}
                </span>{' '}
                —{' '}
                <span className="text-gray-300">
                  {nextFixture.dateEvent ? safeParseSportsDBDate(nextFixture.dateEvent)?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </span>
              </p>
            ) : (
              <p className="text-gray-300 text-sm md:text-base mb-10">Next fixture: TBA</p>
            )}
            <ShimmerButton
              href="/scores"
              variant="league"
              leagueColor="#f97316"
              className="px-8 py-4 text-lg rounded-lg"
            >
              View Live Scores &amp; Fixtures →
            </ShimmerButton>
          </div>
        </section>
      </FadeIn>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
        <div className="lg:col-span-2 space-y-0">
          {/* ANSWER-FIRST GEO BLOCK */}
          <FadeIn direction="up">
            <section className="mb-12 p-6 border-l-4 border-[#f97316] bg-[#12121a] rounded-r-2xl">
              <h2 className="text-xl font-bold text-white mb-3">Direct Answer: How to Watch UEFA Europa League Live</h2>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">
                To watch the <strong>UEFA Europa League live</strong> in the UK, all 189 matches are broadcast on <strong>TNT Sports</strong>, with <strong>discovery+</strong> as the official streaming platform. TNT Sports is also available as an add-on through Sky, Virgin Media and EE TV. Below you will find the full fixture list, the current league phase table, and confirmed UK kick-off times.
              </p>

              <h3 className="text-lg font-bold text-white mb-4">Europa League TV Coverage & Cost Comparison</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/40 mb-6">
                <table className="w-full text-xs md:text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400">
                      <th className="p-3 font-semibold">Service</th>
                      <th className="p-3 font-semibold">Live Coverage</th>
                      <th className="p-3 font-semibold">Monthly Cost</th>
                      <th className="p-3 font-semibold">UHD 4K</th>
                      <th className="p-3 font-semibold">Contract</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    <tr>
                      <td className="p-3 font-bold text-white">discovery+ Premium</td>
                      <td className="p-3 text-gray-300">All 189 matches</td>
                      <td className="p-3 text-gray-300">£30.99/mo</td>
                      <td className="p-3 text-gray-300">Selected (Ultimate only)</td>
                      <td className="p-3 text-gray-300">None (Rolling)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Sky Sports + TNT Add-on</td>
                      <td className="p-3 text-gray-300">All 189 matches</td>
                      <td className="p-3 text-gray-300">£43 + £30.99 = £73.99/mo</td>
                      <td className="p-3 text-[#f97316]">Extra £6-£10/mo</td>
                      <td className="p-3 text-gray-300">18 Months</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="#upcoming-matches" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-bold text-black transition-colors">
                  Upcoming Fixtures
                </Link>
                <Link href="/scores" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-semibold text-white border border-gray-700 transition">
                  Live Scores
                </Link>
              </div>
            </section>
          </FadeIn>

          {/* UPCOMING MATCHES */}
          {upcomingMatches.length > 0 && (
            <section id="upcoming-matches" className="pb-16 md:pb-20 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-6">
                Upcoming Matches
              </h2>
              <div className="space-y-3">
                {upcomingMatches.map(match => (
                  <div key={match.id}
                    className="bg-[#12121a] border border-[#2a2a3a] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-white font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-white text-lg">
                          v
                        </span>
                        <p className="text-[10px] text-gray-600 mt-0.5">
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
                        <span className="text-white font-semibold text-sm 
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
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Results
              </h2>
              <div className="space-y-3">
                {recentResults.map(match => (
                  <div key={match.id}
                    className="bg-[#12121a] border border-[#2a2a3a] 
                      rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1 
                        justify-end">
                        <span className="text-white font-semibold text-sm 
                          text-right truncate max-w-[120px]">
                          {match.homeTeam.name}
                        </span>
                        <img src={match.homeTeam.crest} 
                          alt={match.homeTeam.name}
                          width={24} height={24}
                          className="w-6 h-6 object-contain" loading="lazy" />
                      </div>
                      <div className="text-center px-3 flex-shrink-0">
                        <span className="font-extrabold text-white text-lg">
                          {match.score.fullTime.home ?? '-'}
                          {' — '}
                          {match.score.fullTime.away ?? '-'}
                        </span>
                        <p className="text-[10px] text-gray-600 mt-0.5">
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
                        <span className="text-white font-semibold text-sm 
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
              <div className="bg-gray-950/60 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: '#0f1118' }}>
                      <tr className="text-xs font-bold uppercase border-b" style={{ borderColor: '#f97316' }}>
                        <th className="py-3 px-3 text-center w-10">#</th>
                        <th className="py-3 px-3 text-left">Team</th>
                        <th className="py-3 px-3 text-center w-10">P</th>
                        <th className="py-3 px-3 text-center w-10">W</th>
                        <th className="py-3 px-3 text-center w-10">D</th>
                        <th className="py-3 px-3 text-center w-10">L</th>
                        <th className="py-3 px-3 text-center w-10">GD</th>
                        <th className="py-3 px-3 text-center">Form</th>
                        <th className="py-3 px-3 text-center w-12 text-white">Pts</th>
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
                            className="border-b border-gray-800/60 hover:bg-gray-900/40 transition-colors even:bg-white/[0.02]"
                          >
                            <td className="py-3 px-3 text-center text-gray-400 font-bold">{rank}</td>
                            <td className="py-3 px-3">
                              <div
                                className={`flex items-center gap-3 pl-3 ${top8 ? 'border-l-2' : ''}`}
                                style={top8 ? { borderColor: '#f97316' } : undefined}
                              >
                                <img
                                  src={safeBadge(t.strTeamBadge || t.strBadge)}
                                  alt={t.strTeam}
                                  width={24} height={24}
                                  className="w-6 h-6 object-contain" loading="lazy"
                                />
                                <span className="font-bold text-white line-clamp-1">{t.strTeam}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-400">{played}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{win}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{draw}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{loss}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{gd}</td>
                            <td className="py-3 px-3 text-center">{renderForm(t.strForm)}</td>
                            <td className="py-3 px-3 text-center font-extrabold text-white">{pts}</td>
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
              <div className="bg-gray-950/60 rounded-2xl border border-gray-800 p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Live group standings are available to verified league data partners.
                </p>
                <p className="text-white font-bold text-lg mb-4">
                  2025–26 UEFA Europa League
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-6">
                  {[
                    { round: 'League Phase', date: 'Sep–Jan 2026' },
                    { round: 'Knockout Rounds', date: 'Feb–Apr 2026' },
                    { round: 'Semi-Finals', date: 'Apr/May 2026' },
                    { round: 'Final', date: '21 May 2026 · Bilbao' },
                  ].map(item => (
                    <div key={item.round} className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">{item.round}</div>
                      <div className="text-white font-bold text-sm">{item.date}</div>
                    </div>
                  ))}
                </div>
                <Link href="/scores" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-black text-sm"
                  style={{ backgroundColor: '#f97316' }}>
                  Follow Live Scores →
                </Link>
              </div>
              </section>
            </FadeIn>
          )}


          {/* EUROPA LEAGUE GREATEST MOMENTS */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Europa League Greatest Moments</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Sevilla\'s Dominance',
                  subtitle: 'Record Winners',
                  body:
                    'Sevilla has dominated the Europa League, winning it a record number of times and making the competition their own.',
                },
                {
                  title: 'Atalanta\'s Triumph',
                  subtitle: '2024 Final',
                  body:
                    'Atalanta shocked the world by defeating the previously unbeaten Bayer Leverkusen 3-0 in Dublin.',
                },
                {
                  title: 'Chelsea\'s Amsterdam Win',
                  subtitle: '2013 Final',
                  body:
                    'Branislav Ivanović scored a looping header in stoppage time to secure the trophy against Benfica.',
                },
              ].map((c) => (
                <div key={c.title} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="border-b pb-3 mb-3" style={{ borderColor: '#f97316' }}>
                    <h3 className="font-extrabold text-white">{c.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{c.subtitle}</p>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{c.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* HOW TO WATCH */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How to Watch</h2>
              <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, title: 'Check the fixture', body: 'Find the match and its confirmed UK kick-off time in the fixture list above.' },
                { n: 2, title: 'Find the channel', body: <>Every match is on TNT Sports, streamed via <span className="text-[#00e676]">discovery+</span>, or as an add-on through Sky, Virgin Media and EE TV.</> },
                { n: 3, title: 'Follow live', body: 'Track scores, lineups and the league phase table here as the match unfolds.' },
              ].map((s) => (
                <div key={s.n} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-black mb-4" style={{ backgroundColor: '#f97316' }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.body}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>

          {/* FAQ */}
          <FadeIn direction="up">
            <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">FAQ</h2>
              <StaggerIn className="space-y-6">
              {faqs.map((f) => (
                <div key={f.question} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-6">
                  <h3 className="font-bold text-white mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-400">{f.answer}</p>
                </div>
              ))}
              </StaggerIn>
            </section>
          </FadeIn>
        </div>

        {/* Right Column CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-950/60 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b" style={{ borderColor: '#f97316' }}>
              <h3 className="text-lg font-extrabold text-white">Tonight&apos;s Europa League</h3>
              <p className="text-sm text-gray-400 mt-2">
                Live scores, confirmed kick-off times and the official UK broadcaster for every match.
              </p>
            </div>
            <div className="p-6">
              <ShimmerButton
                href="/scores"
                variant="league"
                leagueColor="#f97316"
                className="w-full text-center py-4 rounded-xl text-black font-extrabold"
              >
                View Live Scores →
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
