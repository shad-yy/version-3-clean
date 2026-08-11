import type { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { unifiedSportsAPI, type UnifiedPlayer } from "@/lib/api/unified-sports-api"
import { Card, CardContent } from "@/components/ui/card"
import { PlayerCard } from "@/components/players/player-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Globe, Trophy, Filter, User } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { PLAYER_POSITIONS } from "@/lib/config"

export const metadata: Metadata = {
  title: "Football Players — Profiles & Season Stats | Smart Live TV",
  description:
    "Player profiles with appearances, goals, assists and career history for squads across the Premier League, La Liga, Serie A and more.",
  alternates: { canonical: `${ENV.BASE_URL}/players` },
}


const FEATURED_TEAMS = [
  { id: '133604', name: 'Arsenal' },
  { id: '133602', name: 'Liverpool' },
  { id: '133600', name: 'Barcelona' },
  { id: '133613', name: 'Bayern Munich' },
  { id: '133632', name: 'PSG' },
]

interface PlayersPageProps {
  searchParams: {
    search?: string
    team?: string
    position?: string
    nationality?: string
  }
}

function PlayersFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function PlayersList({ searchParams }: { searchParams: PlayersPageProps["searchParams"] }) {
  let players: UnifiedPlayer[] = []
  let error = null
  const selectedTeamId = searchParams.team || "133604" // Arsenal default

  try {
    if (searchParams.search) {
      players = await unifiedSportsAPI.searchPlayers(searchParams.search)
    } else {
      players = await unifiedSportsAPI.getPlayers(selectedTeamId)
    }

    // Filter by position if specified
    if (searchParams.position && searchParams.position !== "all") {
      players = players.filter((player) =>
        player.position?.toLowerCase().includes(searchParams.position!.toLowerCase()),
      )
    }

    // Filter by nationality if specified
    if (searchParams.nationality && searchParams.nationality !== "all") {
      players = players.filter((player) =>
        player.nationality?.toLowerCase().includes(searchParams.nationality!.toLowerCase()),
      )
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load players"
    players = []
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Players</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button asChild variant="outline">
          <Link href="/players">Try Again</Link>
        </Button>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
        <p className="text-gray-400">
          {searchParams.search ? `No players found for "${searchParams.search}"` : "No players available at the moment"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {players.map((player) => (
        <div key={player.id} className="h-full">
          <PlayerCard player={player} />
        </div>
      ))}
    </div>
  )
}

export default function PlayersPage({ searchParams }: PlayersPageProps) {
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-32 pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Football Players</h1>
        <p className="text-lg text-gray-400">Discover players from the world's top football teams</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search players..."
                  defaultValue={searchParams.search || ""}
                  className="pl-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/players?position=forward">
                    <User className="w-4 h-4 mr-2" />
                    Forwards
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/players?position=midfielder">
                    <User className="w-4 h-4 mr-2" />
                    Midfielders
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/players?position=defender">
                    <User className="w-4 h-4 mr-2" />
                    Defenders
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <Link href="/players">
                    <Filter className="w-4 h-4 mr-2" />
                    All Players
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Browse by Team</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {FEATURED_TEAMS.map((team) => {
            const currentTeam = searchParams.team || "133604";
            const isActive = currentTeam === team.id;
            const positionParams = searchParams.position && searchParams.position !== "all"
              ? `&position=${searchParams.position}`
              : "";
            return (
              <Button
                key={team.id}
                asChild
                variant={isActive ? "default" : "outline"}
                className={isActive ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : "bg-transparent"}
              >
                <Link href={`/players?team=${team.id}${positionParams}`}>
                  {team.name}
                </Link>
              </Button>
            )
          })}
        </div>

        <h2 className="text-2xl font-bold mb-4">Browse by Position</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLAYER_POSITIONS.filter(p => p.value !== 'all').map((pos) => (
            <Link key={pos.value} href={`/players?position=${pos.value}`}>
              <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors text-center p-4">
                <div className="text-2xl mb-2">
                  <User className="w-8 h-8 mx-auto text-primary" />
                </div>
                <div className="font-semibold text-white">{pos.label}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Players Grid */}
      <Suspense fallback={<PlayersFallback />}>
        <PlayersList searchParams={searchParams} />
      </Suspense>

      {/* Browse More */}
      <div className="mt-12 text-center">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">Explore More</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/teams">
                  <Users className="w-4 h-4 mr-2" />
                  Browse Teams
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/leagues">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leagues
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
