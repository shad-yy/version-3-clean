import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unifiedSportsAPI } from '@/lib/api/unified-sports-api'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { LEAGUES, LeagueSlug } from '@/lib/constants/leagues'
import { LeagueBadge } from '@/components/league/league-badge'
import { DynamicSEOContent } from '@/components/league/DynamicSEOContent'
import { ENV } from '@/lib/config/env'
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

/** Only append a size suffix if the URL doesn't already have one */
function safeBadge(url: string | null | undefined, size: 'tiny' | 'small' | 'medium' = 'small'): string {
    if (!url) return '/placeholder-logo.png'
    if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
    return `${url}/${size}`
}


type Props = { params: { slug: string } }

function safeParseSportsDBDate(date: string, time?: string): Date | null {
    if (!date) return null
    const parts = date.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return null
    const [year, month, day] = parts
    if (time) {
      const t = time.split('+')[0].split('-')[0]
      const [h, m] = t.split(':').map(Number)
      return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
    }
    return new Date(Date.UTC(year, month - 1, day))
}

function formatMatchDate(dateStr: string | null | undefined): string {
    const d = safeParseSportsDBDate(dateStr || '')
    if (!d) return 'TBA'
    // Reject obviously wrong years
    if (d.getFullYear() < 2024 || d.getFullYear() > 2030) return 'TBA'
    return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

// Exact titles per spec — all verified under 60 chars
const LEAGUE_TITLES: Record<string, string> = {
    'premier-league': 'Premier League Live Scores & Broadcast Guide',
    'la-liga':        'La Liga Live Scores & Official TV Guide',
    'bundesliga':     'Bundesliga Live Scores & Match Schedule',
    'serie-a':        'Serie A Live Scores & Broadcast Schedule',
    'ligue-1':        'Ligue 1 Live Scores & Match Telemetry',
    'champions-league': 'UEFA Champions League Scores & TV Guide',
}

// Force static building for the top SEO pages.
//
// champions-league is excluded deliberately: app/watch/champions-league/page.tsx is a
// literal route with its own copy and metadata, and Next gives literal segments
// precedence over dynamic ones. Generating it here produced a shadowed page that could
// never be served. LEAGUES still carries the entry — it is used for badges and theming
// elsewhere — this only stops the dead route being built.
const SHADOWED_BY_LITERAL_ROUTE = new Set(["champions-league"])

export function generateStaticParams() {
    return Object.keys(LEAGUES)
        .filter((slug) => !SHADOWED_BY_LITERAL_ROUTE.has(slug))
        .map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
    const league = LEAGUES[params.slug as LeagueSlug]
    if (!league) return { title: 'League Not Found' }

    let title = `${league.name} Live Scores & Broadcast Guide | Smart Live TV`
    let description = `Follow real-time scores, upcoming matchday fixtures, team standings, and official TV broadcast guides for ${league.name}.`

    if (params.slug === 'premier-league') {
        title = "Premier League Live Scores & Official Broadcast Guide"
        description = "Follow real-time Premier League scores, upcoming matchday fixtures, table standings, and official television broadcast listings."
    }

    return {
        title,
        description,
        alternates: {
            canonical: `${ENV.BASE_URL}/watch/${params.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-default.png'],
        },
    }
}

export default async function WatchLeaguePage({ params }: Props) {
    const slug = params.slug
    const theme = LEAGUES[slug as LeagueSlug]

    if (!theme) return notFound()

    const [allFixtures, fullStandings] = await Promise.all([
        unifiedSportsAPI.getFixtures({ leagueId: theme.id, next: 15 }),
        unifiedSportsAPI.getStandings(theme.id)
    ])

    const fixtures = allFixtures.filter(e => e.status !== "Match Finished").slice(0, 5)
    const standings = fullStandings || []

    const FormPill = ({ result }: { result: string }) => {
        const colors: Record<string, string> = {
            W: 'bg-green-500 text-black',
            D: 'bg-gray-500 text-sl-text',
            L: 'bg-red-500 text-sl-text'
        }
        return (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || 'bg-gray-700 text-sl-text'}`}>
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
                {results.map((r, idx) => <FormPill key={`${r}-${idx}`} result={r} />)}
            </div>
        )
    }

    const getDescriptionBorder = (desc?: string) => {
        if (!desc) return ''
        if (desc.includes('Champions League')) return 'border-l-2 border-blue-500'
        if (desc.includes('Europa League')) return 'border-l-2 border-orange-500'
        if (desc.includes('Relegation')) return 'border-l-2 border-red-500'
        return ''
    }



    const sportsOrgSchema = {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: theme.name,
        url: `${ENV.BASE_URL}/watch/${slug}`,
        sport: 'Soccer',
        // addressCountry must be ISO 3166-1 alpha-2. This previously passed the country
        // NAME ('England', 'Spain'), which is invalid schema. Multi-national competitions
        // have no code, so the property is omitted rather than guessed.
        ...(theme.countryCode
            ? { location: { '@type': 'Place', addressCountry: theme.countryCode } }
            : {}),
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${ENV.BASE_URL}/watch/${slug}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${ENV.BASE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Watch Live',
          item: `${ENV.BASE_URL}/watch`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: theme.name,
          item: `${ENV.BASE_URL}/watch/${slug}`,
        },
      ],
    }

    return (
        <div className="min-h-screen bg-sl-ground text-gray-100">
            <SchemaMarkup schema={sportsOrgSchema} />
            <SchemaMarkup schema={breadcrumbSchema} />

            {/* Hero Section */}
            <FadeIn>
                <section
                    className="pt-28 md:pt-36 pb-16 text-center px-4 border-b"
                    style={{
                        background: `linear-gradient(135deg, ${theme.primary} 0%, var(--sl-ground) 100%)`,
                        borderColor: theme.secondary,
                    }}
                >
                    <div className="container mx-auto max-w-4xl">
                        <div className="flex items-center justify-center mb-6">
                            <LeagueBadge 
                                src={theme.badgeUrl}
                                localSrc={theme.localBadge}
                                alt={theme.name} 
                                size={64}
                                className="object-contain" 
                            />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6">
                            {theme.heroText}
                        </h1>
                        <p className="text-xl text-sl-mid max-w-2xl mx-auto mb-10">
                            Track live match scores, team lineups, table standings, and official TV channel broadcast schedules for every {theme.name} fixture this season.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <ShimmerButton
                                href="/scores"
                                variant="league"
                                leagueColor={theme.secondary}
                                className="px-8 py-4 text-lg rounded-lg w-full sm:w-auto"
                            >
                                Live Score Center →
                            </ShimmerButton>
                            <Link
                                href="/leagues"
                                className="bg-[var(--sl-amber)] text-black font-extrabold px-10 py-5 rounded-xl text-lg hover:bg-[var(--sl-amber-hover)] transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] touch-manipulation w-full sm:w-auto text-center"
                            >
                                Explore League Standings →
                            </Link>
                        </div>
                    </div>
                </section>
            </FadeIn>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
                {/* Left Column: Content + Fixtures */}
                <div className="lg:col-span-2 space-y-0">

                    {/* SEO Content Block */}
                    <FadeIn direction="up">
                        <section className="prose prose-invert prose-lg max-w-none">
                            <h2 className="text-3xl font-bold text-sl-text mb-8 md:mb-12">Official Broadcast & Live Schedule Guide</h2>
                            <p className="max-w-2xl">
                                Following {theme.name} requires staying updated on match schedules, official TV broadcast networks, and team form. Smart Live TV provides real-time telemetry, live scores, and verified television network listings across major regions.
                            </p>
                            <p className="max-w-2xl">
                                Whether you are following live match updates, analyzing team statistics, or searching for official TV channels in the UK and worldwide, our live score platform delivers up-to-second telemetry on desktop and mobile devices.
                            </p>
                            <p className="max-w-2xl">
                                Check real-time match stats and standings on our{' '}
                                <Link href="/scores" className="text-green-400 hover:text-green-300">Live Scores Hub</Link>.
                                {slug !== 'champions-league' && (
                                    <> Also check official listings for the{' '}
                                    <Link href="/watch/champions-league" className="text-blue-400 hover:text-blue-300">UEFA Champions League</Link>.</>
                                )}
                            </p>

                            <div className="my-10 p-6 border border-sl-line rounded-2xl bg-sl-surface/50">
                                <h3 className="text-2xl font-bold text-sl-text mb-6">Explore Competition Hubs</h3>
                                <p className="mb-4">Navigate to live match hubs and telemetry pages:</p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/scores" className="px-4 py-2 bg-sl-raise hover:bg-gray-700 rounded-lg text-sm font-medium text-sl-text border border-sl-line transition">
                                        Live Scores
                                    </Link>
                                    <Link href="/leagues" className="px-4 py-2 bg-sl-raise hover:bg-gray-700 rounded-lg text-sm font-medium text-sl-text border border-sl-line transition">
                                        All Leagues
                                    </Link>
                                    <Link href="/news" className="px-4 py-2 bg-sl-raise hover:bg-gray-700 rounded-lg text-sm font-medium text-sl-text border border-sl-line transition">
                                        Sports News
                                    </Link>
                                </div>
                            </div>

                            <div className="my-10 p-6 border border-sl-line rounded-2xl bg-sl-surface/50">
                                <h3 className="text-2xl font-bold text-sl-text mb-6">Other Top Football Leagues</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(LEAGUES)
                                        .filter(([s]) => s !== params.slug)
                                        .map(([s, l]) => (
                                            <Link key={s} href={`/watch/${s}`} className="px-4 py-2 bg-sl-raise hover:bg-gray-700 rounded-lg text-sm font-medium text-sl-text border border-sl-line transition">
                                                {l.name}
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        </section>
                    </FadeIn>

                    {/* Upcoming Matches */}
                    <section className="py-16 md:py-20 border-t border-[var(--sl-line)]">
                        <h2 className="text-2xl font-bold text-sl-text mb-8 md:mb-12">Upcoming {theme.name} Fixtures</h2>
                        {fixtures.length > 0 ? (
                            <StaggerIn className="space-y-6">
                                {fixtures.map((match: any) => (
                                    <div key={match.id} className="bg-sl-surface p-6 rounded-2xl border border-sl-line flex flex-col md:flex-row items-center justify-between gap-6 hover:border-sl-line transition">
                                        <div className="flex items-center gap-6 w-full md:w-auto flex-1">
                                            <div className="flex flex-col items-center w-24">
                                                <img src={safeBadge(match.homeLogo)} alt={match.homeTeam} width={48} height={48} className="w-12 h-12 object-contain mb-2" loading="lazy" />
                                                <span className="text-xs text-center font-bold text-sl-mid">{match.homeTeam}</span>
                                            </div>
                                            <div className="text-center px-4 text-sm text-sl-mute font-bold">
                                                VS<br /><span className="text-xs font-normal">{formatMatchDate(match.date)}</span>
                                            </div>
                                            <div className="flex flex-col items-center w-24">
                                                <img src={safeBadge(match.awayLogo)} alt={match.awayTeam} width={48} height={48} className="w-12 h-12 object-contain mb-2" loading="lazy" />
                                                <span className="text-xs text-center font-bold text-sl-mid">{match.awayTeam}</span>
                                            </div>
                                        </div>
                                        <ShimmerButton
                                            href={`/match/${match.id}`}
                                            variant="league"
                                            leagueColor={theme.secondary}
                                            className="px-6 py-3 text-sm rounded-lg whitespace-nowrap w-full md:w-auto"
                                        >
                                            Match Center & Telemetry →
                                        </ShimmerButton>
                                    </div>
                                ))}
                            </StaggerIn>
                        ) : (
                            <p className="text-sl-mute p-6 bg-sl-surface rounded-xl border border-sl-line text-center">No upcoming fixtures scheduled right now.</p>
                        )}
                    </section>

                    <DynamicSEOContent
                        leagueName={theme.name}
                        leagueSlug={slug}
                        fixtures={fixtures.map((f: any) => ({
                            id: f.id || String(f.idEvent),
                            homeTeam: f.homeTeam || f.strHomeTeam,
                            awayTeam: f.awayTeam || f.strAwayTeam,
                            date: f.date || f.dateEvent,
                            venue: f.venue || f.strVenue,
                            status: f.status || f.strStatus,
                        }))}
                        standings={standings.map((s: any) => ({
                            position: s.position,
                            team: s.team,
                            played: s.played,
                            won: s.won,
                            drawn: s.drawn,
                            lost: s.lost,
                            points: s.points,
                            form: s.form,
                        }))}
                    />

                </div>

                {/* Right Column: Standings Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-sl-surface rounded-3xl border border-sl-line overflow-hidden">
                        <div className="p-4 border-b bg-sl-raise/50" style={{ borderColor: theme.secondary }}>
                            <h3 className="text-lg font-bold text-sl-text">Live {theme.name} Table</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 z-10" style={{ backgroundColor: '#0f1118' }}>
                                    <tr className="text-gray-200 font-bold uppercase border-b" style={{ borderColor: theme.secondary }}>
                                        <th className="py-2 px-2 text-center w-8">#</th>
                                        <th className="py-2 px-2 text-left">Team</th>
                                        <th className="py-2 px-2 text-center w-8">P</th>
                                        <th className="py-2 px-2 text-center w-8">W</th>
                                        <th className="py-2 px-2 text-center w-8">D</th>
                                        <th className="py-2 px-2 text-center w-8">L</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GF</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GA</th>
                                        <th className="py-2 px-2 text-center w-8 hidden md:table-cell">GD</th>
                                        <th className="py-2 px-2 text-center">Form</th>
                                        <th className="py-2 px-2 text-center w-10 text-sl-text">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.slice(0, 10).map((team: any, i: number) => (
                                        <tr
                                            key={team.teamId || i}
                                            className={`border-b border-sl-line/60 hover:bg-sl-raise/50 transition-colors even:bg-white/[0.02]`}
                                        >
                                            <td className="py-2 px-2 text-center font-bold text-sl-mute">{team.position}</td>
                                            <td className="py-2 px-2">
                                                <div className={`flex items-center gap-2 pl-2 ${getDescriptionBorder(team.description)}`}>
                                                    <img src={safeBadge(team.teamLogo)} alt={team.team} width={20} height={20} className="w-5 h-5 object-contain" loading="lazy" />
                                                    <span className="font-semibold text-gray-200 line-clamp-1 flex-1">{team.team}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-center text-sl-mute">{team.played}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute">{team.won}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute">{team.drawn}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute">{team.lost}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute hidden md:table-cell">{team.goalsFor}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute hidden md:table-cell">{team.goalsAgainst}</td>
                                            <td className="py-2 px-2 text-center text-sl-mute hidden md:table-cell">{team.goalDifference}</td>
                                            <td className="py-2 px-2 text-center">{renderForm(team.form)}</td>
                                            <td className="py-2 px-2 text-center font-bold text-sl-text">{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-sl-line bg-sl-raise/20 text-center">
                            <Link href="/leagues" className="text-green-500 hover:text-green-400 font-bold text-sm">View full table &amp; all teams →</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <FadeIn direction="up">
                <section className="py-16 md:py-20 text-center px-4 border-t" style={{ borderColor: theme.secondary, background: `linear-gradient(180deg, var(--sl-ground) 0%, ${theme.primary}33 100%)` }}>
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-bold text-sl-text mb-4">Smart Live TV Telemetry</h2>
                        <p className="text-sl-mute text-lg mb-8">Real-time match updates, team stats, and verified global TV channel guides.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/scores"
                                className="px-10 py-5 text-xl rounded-xl font-bold bg-[var(--sl-amber)] text-black hover:bg-[var(--sl-amber-hover)] transition-all w-full sm:w-auto text-center shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                            >
                                Explore Live Scores Hub →
                            </Link>
                        </div>
                    </div>
                </section>
            </FadeIn>

      {/* Mobile Sticky CTA — md:hidden */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--sl-ground)]/95 backdrop-blur-md border-t border-[var(--sl-line)] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/scores"
            className="bg-[var(--sl-amber)] text-black font-bold text-base py-4 rounded-2xl text-center touch-manipulation active:scale-95 transition-transform cta-button"
          >
            Live Scores
          </Link>
          <Link
            href="/leagues"
            className="bg-[var(--sl-surface)] border border-[var(--sl-line)] text-sl-text font-bold text-base py-4 rounded-2xl text-center touch-manipulation active:scale-95 transition-transform cta-button"
          >
            Leagues
          </Link>
        </div>
      </div>
    </div>
  )
}
