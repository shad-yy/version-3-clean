import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { LeagueDetailView } from "@/components/league/league-detail-view"

interface LeaguePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  try {
    const leagues = await unifiedSportsAPI.getLeagues()
    const league = leagues.find((l) => l.id === params.id)

    if (!league) {
      return {
        title: "League Not Found - Smart Live TV",
        description: "The requested league could not be found.",
      }
    }

    return {
      title: `${league.name} - Standings, Fixtures & Teams | Smart Live TV`,
      description: `Follow ${league.name}: live standings, upcoming fixtures, team stats, and full match coverage. Stream ${league.name} live on Smart Live TV.`,
      openGraph: {
        title: `${league.name} - Smart Live TV`,
        description: `Live scores, standings and fixtures for ${league.name}.`,
        images: league.logo ? [{ url: league.logo }] : [],
      },
    }
  } catch {
    return {
      title: "League - Smart Live TV",
      description: "League information and statistics.",
    }
  }
}

async function LeagueContent({ leagueId }: { leagueId: string }) {
  try {
    const [leagues, teams, standings, fixtures] = await Promise.all([
      unifiedSportsAPI.getLeagues(),
      unifiedSportsAPI.getTeams(leagueId),
      unifiedSportsAPI.getStandings(leagueId),
      unifiedSportsAPI.getFixtures({ leagueId, next: 10 }),
    ])

    const league = leagues.find((l) => l.id === leagueId)
    if (!league) notFound()

    return (
      <LeagueDetailView
        league={league}
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          country: t.country,
          logo: t.logo ?? null,
          founded: t.founded != null ? String(t.founded) : null,
        }))}
        standings={standings.map((s) => ({
          teamId: s.teamId,
          team: s.team,
          teamLogo: s.teamLogo ?? null,
          position: String(s.position),
          played: String(s.played),
          won: String(s.won),
          drawn: String(s.drawn),
          lost: String(s.lost),
          goalsFor: String(s.goalsFor),
          goalsAgainst: String(s.goalsAgainst),
          goalDifference: String(s.goalDifference),
          points: String(s.points),
          form: s.form,
          description: s.description,
        }))}
        fixtures={fixtures.map((f) => ({
          id: f.id,
          homeTeam: f.homeTeam,
          awayTeam: f.awayTeam,
          homeLogo: f.homeLogo ?? null,
          awayLogo: f.awayLogo ?? null,
          date: f.date,
          time: f.time,
          status: f.status,
          isLive: f.isLive,
          venue: f.venue ?? null,
        }))}
      />
    )
  } catch (error) {
    console.error("Error loading league:", error)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sl-mute text-sm">Failed to load league information.</p>
          <p className="text-sl-mute text-xs">Please try again later.</p>
        </div>
      </div>
    )
  }
}

function LeagueLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-8 animate-pulse">
      {/* Banner skeleton */}
      <div className="h-44 rounded-2xl bg-[var(--sl-surface)] border border-[var(--sl-raise)]" />
      {/* Tabs skeleton */}
      <div className="h-14 max-w-xl mx-auto rounded-xl bg-[var(--sl-surface)] border border-[var(--sl-raise)]" />
      {/* Content skeleton */}
      <div className="h-96 rounded-2xl bg-[var(--sl-surface)] border border-[var(--sl-raise)]" />
    </div>
  )
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  // The existence check must be awaited HERE, in the page body, before any JSX is
  // returned. Inside the Suspense boundary below, the shell has already streamed with
  // a 200 and notFound() can no longer change the status -- which is why an unknown
  // league id used to render "Page Not Found" while answering 200. Google reads that
  // as a real page: a soft 404.
  //
  // getLeagues() is TTL-cached, so LeagueContent's own call below is a cache hit
  // rather than a second round trip.
  const leagues = await unifiedSportsAPI.getLeagues()
  if (!leagues.some((l) => l.id === params.id)) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[var(--sl-ground)] py-8 px-4 md:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/4 rounded-full blur-[120px]" />
      </div>

      <Suspense fallback={<LeagueLoading />}>
        <LeagueContent leagueId={params.id} />
      </Suspense>
    </main>
  )
}
