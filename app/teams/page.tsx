import type { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { unifiedSportsAPI, type UnifiedTeam } from "@/lib/api/unified-sports-api"
import { Card, CardContent } from "@/components/ui/card"
import { TeamCard } from "@/components/teams/team-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Globe, Trophy, Filter } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { POPULAR_LEAGUE_IDS, QUICK_LEAGUE_FILTERS } from "@/lib/config"

export const metadata: Metadata = {
  title: "Football Teams — Squads, Stats & Fixtures | Sightline",
  description:
    "Browse football club profiles with current squads, season statistics, recent results and upcoming fixtures across Europe's major leagues.",
  alternates: { canonical: `${ENV.BASE_URL}/teams` },
}


// NOTE: no `revalidate` here. This page reads searchParams, which forces a dynamic
// render on every request — an ISR value would never take effect and only misleads.

interface TeamsPageProps {
  searchParams: {
    search?: string
    league?: string
    country?: string
  }
}

function TeamsFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function TeamsList({ searchParams }: { searchParams: TeamsPageProps["searchParams"] }) {
  let teams: UnifiedTeam[] = []
  let error = null
  let partialFailure = false

  try {
    if (searchParams.search) {
      teams = await unifiedSportsAPI.searchTeams(searchParams.search)
    } else if (searchParams.league) {
      teams = await unifiedSportsAPI.getTeams(searchParams.league)
    } else {
      // Process leagues sequentially to respect rate limits
      const allTeams: UnifiedTeam[][] = []
      let failedLeagues = 0

      for (const leagueId of POPULAR_LEAGUE_IDS) {
        try {
          const leagueTeams = await unifiedSportsAPI.getTeams(leagueId)
          allTeams.push(leagueTeams)
        } catch (err) {
          console.warn(`Failed to fetch teams for league ${leagueId}:`, err)
          allTeams.push([])
          failedLeagues++
        }
      }

      teams = allTeams.flat().slice(0, 40) // Limit to 40 teams for performance

      // Show warning if some leagues failed
      if (failedLeagues > 0 && teams.length > 0) {
        partialFailure = true
      } else if (teams.length === 0) {
        error = "Unable to load teams. Please try again later."
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load teams"
    teams = []
  }

  return (
    <div>
      {partialFailure && (
        <div className="bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            Some leagues could not be loaded due to rate limits. Showing available teams.
          </p>
        </div>
      )}
      {error && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Teams</h3>
          <p className="text-sl-mute mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link href="/teams">Try Again</Link>
          </Button>
        </div>
      )}

      {!error && teams.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-sl-dim" />
          <h3 className="text-xl font-semibold mb-2">No Teams Found</h3>
          <p className="text-sl-mute">
            {searchParams.search ? `No teams found for "${searchParams.search}"` : "No teams available at the moment"}
          </p>
        </div>
      )}

      {!error && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="h-full">
              <TeamCard team={team} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeamsPage({ searchParams }: TeamsPageProps) {
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Football Teams</h1>
        <p className="text-lg text-sl-mute">Discover teams from the world's top football leagues</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sl-mute w-5 h-5" />
                <Input
                  placeholder="Search teams..."
                  defaultValue={searchParams.search || ""}
                  className="pl-12 bg-sl-raise border-sl-line text-white placeholder-gray-400"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/teams?league=39">
                    <Trophy className="w-4 h-4 mr-2" />
                    Premier League
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/teams?league=140">
                    <Trophy className="w-4 h-4 mr-2" />
                    La Liga
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/teams">
                    <Filter className="w-4 h-4 mr-2" />
                    All Teams
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Leagues */}
      {!searchParams.search && !searchParams.league && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Leagues</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {QUICK_LEAGUE_FILTERS.map((league) => (
              <Link key={league.id} href={`/teams?league=${league.id}`}>
                <Card className="bg-sl-surface/50 border-sl-line hover:bg-sl-raise/50 transition-colors text-center p-4">
                  <div className="font-semibold text-white">{league.name}</div>
                  <div className="text-sm text-sl-mute">{league.country}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <Suspense fallback={<TeamsFallback />}>
        <TeamsList searchParams={searchParams} />
      </Suspense>

      {/* Browse More */}
      <div className="mt-12 text-center">
        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">Explore More</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/leagues">
                  <Trophy className="w-4 h-4 mr-2" />
                  Browse Leagues
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/players">
                  <Users className="w-4 h-4 mr-2" />
                  View Players
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/scores">
                  <Trophy className="w-4 h-4 mr-2" />
                  Live Scores
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
