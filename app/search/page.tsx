import { Suspense } from "react"
import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { searchIndexer } from "@/lib/utils/search-index"
import { Search } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Search - Smart Live TV",
  description: "Search for teams, players, events, and leagues.",
}

interface SearchPageProps {
  searchParams: {
    q?: string
    tab?: string
  }
}

function SearchForm({ initialQuery, activeTab }: { initialQuery: string; activeTab: string }) {
  return (
    <form action="/search" method="GET" className="mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            name="q"
            placeholder="Search for teams, players, events..."
            defaultValue={initialQuery}
            className="pl-10"
          />
        </div>
        <input type="hidden" name="tab" value={activeTab} />
        <Button type="submit">Search</Button>
      </div>
    </form>
  )
}

async function SearchResults({ query, activeTab }: { query: string; activeTab: string }) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enter a search term to find teams, players, and events.</p>
      </div>
    )
  }

  try {
    // Use search indexer if available, otherwise fall back to API
    let teams: any[] = []
    let players: any[] = []
    let events: any[] = []

    if (searchIndexer.isStale()) {
      // Rebuild index if stale - fetch popular data
      try {
        const [popularLeagues, popularTeams] = await Promise.all([
          unifiedSportsAPI.getLeagues().then(leagues => leagues.slice(0, 50)),
          unifiedSportsAPI.getTeams("4328").then(teams => teams.slice(0, 50)),
        ])
        searchIndexer.indexLeagues(popularLeagues)
        searchIndexer.indexTeams(popularTeams)
      } catch (err) {
        console.warn("Failed to rebuild search index:", err)
      }
    }

    // Try indexed search first
    const indexedResults = searchIndexer.search(query, 10)
    
    if (indexedResults.teams.length > 0 || indexedResults.leagues.length > 0) {
      teams = indexedResults.teams
      players = indexedResults.players
      events = indexedResults.events
    }

    // Fall back to API search if index doesn't have results
    if (teams.length === 0 && (activeTab === "teams" || activeTab === "all")) {
      teams = await unifiedSportsAPI.searchTeams(query)
      searchIndexer.indexTeams(teams)
    }
    if (players.length === 0 && (activeTab === "players" || activeTab === "all")) {
      players = await unifiedSportsAPI.searchPlayers(query)
      searchIndexer.indexPlayers(players)
    }
    if (events.length === 0 && (activeTab === "events" || activeTab === "all")) {
      events = await unifiedSportsAPI.searchEvents(query)
      searchIndexer.indexEvents(events)
    }

    // Normalize responses to arrays to prevent runtime errors on slice/map
    const safeTeams = Array.isArray(teams) ? teams : []
    const safePlayers = Array.isArray(players) ? players : []
    const safeEvents = Array.isArray(events) ? events : []

    if (activeTab === "all") {
      return (
        <div className="space-y-8">
          {/* Teams */}
          {safeTeams.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Teams</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {safeTeams.slice(0, 6).map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                            {team.logo ? (
                              <OptimizedImage src={team.logo} alt={team.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                                {team.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">{team.country}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Players */}
          {safePlayers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {safePlayers.slice(0, 6).map((player) => (
                  <Link key={player.id} href={`/players/${player.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                            {player.photo ? (
                              <OptimizedImage src={player.photo} alt={player.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                                {player.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{player.name}</h3>
                            <p className="text-sm text-muted-foreground">{player.team}</p>
                            {player.position && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {player.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Events */}
          {safeEvents.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Events</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {safeEvents.slice(0, 4).map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.homeTeam} vs {event.awayTeam}</h3>
                          <Badge variant={event.status.includes("Finished") || event.status.includes("Full Time") ? "default" : "secondary"}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.league}</p>
                        <p className="text-sm">
                          {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                        </p>
                        {event.venue && <p className="text-sm text-muted-foreground">{event.venue}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {safeTeams.length === 0 && safePlayers.length === 0 && safeEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )
    }

    // Individual tab content
    if (activeTab === "teams") {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safeTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {team.logo ? (
                        <OptimizedImage src={team.logo} alt={team.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {team.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )
    }

    if (activeTab === "players") {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {safePlayers.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {player.photo ? (
                        <OptimizedImage src={player.photo} alt={player.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {player.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                      {player.position && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {player.position}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )
    }

    if (activeTab === "events") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {safeEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{event.homeTeam} vs {event.awayTeam}</h3>
                    <Badge variant={event.status.includes("Finished") || event.status.includes("Full Time") ? "default" : "secondary"}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{event.league}</p>
                  <p className="text-sm">
                    {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                  </p>
                  {event.venue && <p className="text-sm text-muted-foreground">{event.venue}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )
    }

    return null
  } catch (error) {
    console.error("Search error:", error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">An error occurred while searching. Please try again.</p>
      </div>
    )
  }
}

function SearchLoading() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const activeTab = searchParams.tab || "all"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        {query && <p className="text-muted-foreground">Results for "{query}"</p>}
      </div>

      <SearchForm initialQuery={query} activeTab={activeTab} />

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="all">
            <Suspense fallback={<SearchLoading />}>
              <SearchResults query={query} activeTab="all" />
            </Suspense>
          </TabsContent>

          <TabsContent value="teams">
            <Suspense fallback={<SearchLoading />}>
              <SearchResults query={query} activeTab="teams" />
            </Suspense>
          </TabsContent>

          <TabsContent value="players">
            <Suspense fallback={<SearchLoading />}>
              <SearchResults query={query} activeTab="players" />
            </Suspense>
          </TabsContent>

          <TabsContent value="events">
            <Suspense fallback={<SearchLoading />}>
              <SearchResults query={query} activeTab="events" />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
