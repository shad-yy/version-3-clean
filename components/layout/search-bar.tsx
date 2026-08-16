"use client"

import { useState, useRef, useEffect } from "react"
import { Clock, Landmark, Newspaper, Search, TrendingUp, Trophy, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// Fetch via server endpoints to avoid exposing API keys in the client

interface SearchResult {
  id: string
  title: string
  type: "team" | "player" | "league" | "news"
  url: string
  description?: string
}

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const searchIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const [selectedIndex, setSelectedIndex] = useState(-1)
  useEffect(() => {
    const saved = localStorage.getItem("recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Handle search
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      performSearch(debouncedQuery)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [debouncedQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // Cancel previous in-flight
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const localId = ++searchIdRef.current
      const searchResults: SearchResult[] = []

      const [teamsRes, playersRes, newsRes, leaguesRes] = await Promise.allSettled([
        fetch(`/api/search/teams?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store", signal: controller.signal }),
        fetch(`/api/search/players?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store", signal: controller.signal }),
        fetch(`/api/search/news?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store", signal: controller.signal }),
        fetch(`/api/search/leagues?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store", signal: controller.signal }),
      ])

      if (localId !== searchIdRef.current) return

      if (teamsRes.status === "fulfilled" && teamsRes.value.ok) {
        const teamsJson = await teamsRes.value.json().catch(() => [])
        if (Array.isArray(teamsJson)) {
          const teamResults = teamsJson.slice(0, 3).filter((t) => t && t.id && t.name).map((team: any) => ({
            id: `team-${team.id}`,
            title: team.name,
            type: "team" as const,
            url: `/teams/${team.id}`,
            description: `${team.league || "Professional"} team`,
          }))
          searchResults.push(...teamResults)
        }
      }

      if (playersRes.status === "fulfilled" && playersRes.value.ok) {
        const playersJson = await playersRes.value.json().catch(() => [])
        if (Array.isArray(playersJson)) {
          const playerResults = playersJson
            .slice(0, 3)
            .filter((p) => p && p.id && p.name)
            .map((player: any) => ({
              id: `player-${player.id}`,
              title: player.name,
              type: "player" as const,
              url: `/players/${player.id}`,
              description: `${player.position || "Player"} - ${player.team || "Professional"}`,
            }))
          searchResults.push(...playerResults)
        }
      }

      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const newsJson = await newsRes.value.json().catch(() => [])
        if (Array.isArray(newsJson)) {
          const newsSearchResults = newsJson
            .slice(0, 2)
            .filter((a) => a && a.title)
            .map((article: any, idx: number) => ({
              id: `news-${idx}`,
              title: article.title,
              type: "news" as const,
              url: `/news?search=${encodeURIComponent(searchQuery)}`,
              description: (article.description || "").substring(0, 100) + "..." || "Sports news article",
            }))
          searchResults.push(...newsSearchResults)
        }
      }

      if (leaguesRes.status === "fulfilled" && leaguesRes.value.ok) {
        const leaguesJson = await leaguesRes.value.json().catch(() => [])
        if (Array.isArray(leaguesJson)) {
          const leagueResults = leaguesJson
            .slice(0, 2)
            .filter((l) => l && l.id && l.name)
            .map((league: any) => ({
              id: `league-${league.id}`,
              title: league.name,
              type: "league" as const,
              url: `/leagues/${league.id}`,
              description: `${league.sport || "Sport"} league - ${league.country || "International"}`,
            }))
          searchResults.push(...leagueResults)
        }
      }

      if (searchResults.length === 0) {
        const mockResults: SearchResult[] = [
          {
            id: "1",
            title: "Manchester United",
            type: "team" as const,
            url: "/teams/manchester-united",
            description: "English Premier League team",
          },
          {
            id: "2",
            title: "Cristiano Ronaldo",
            type: "player" as const,
            url: "/players/cristiano-ronaldo",
            description: "Portuguese forward",
          },
          {
            id: "3",
            title: "Premier League",
            type: "league" as const,
            url: "/leagues/premier-league",
            description: "English top division",
          },
        ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

        setResults(mockResults)
      } else {
        const sortedResults = searchResults.sort((a, b) => {
          const typeOrder = { team: 0, player: 1, news: 2, league: 3 }
          return typeOrder[a.type] - typeOrder[b.type]
        })
        setResults(sortedResults.slice(0, 8))
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const newRecentSearches = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem("recent-searches", JSON.stringify(newRecentSearches))

      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
      setQuery("")
      setSelectedIndex(-1)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    const newRecentSearches = [result.title, ...recentSearches.filter((s) => s !== result.title)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem("recent-searches", JSON.stringify(newRecentSearches))

    router.push(result.url)
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(-1)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recent-searches")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "team":
        return <Trophy className="w-4 h-4" aria-hidden="true" />
      case "player":
        return <User className="w-4 h-4" aria-hidden="true" />
      case "league":
        return <Landmark className="w-4 h-4" aria-hidden="true" />
      case "news":
        return <Newspaper className="w-4 h-4" aria-hidden="true" />
      default:
        return <Search className="w-4 h-4" aria-hidden="true" />
    }
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search teams, players, leagues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (selectedIndex >= 0) {
                const allItems: (string | SearchResult)[] = [...recentSearches, ...results]
                const selected = allItems[selectedIndex]
                if (selected) {
                  const title = typeof selected === 'string' ? selected : selected.title
                  handleSearch(title)
                }
              } else {
                handleSearch(query)
              }
            }
            if (e.key === "Escape") {
              setIsOpen(false)
              setSelectedIndex(-1)
            }
            if (e.key === "ArrowDown") {
              e.preventDefault()
              const allItems: (string | SearchResult)[] = [...recentSearches, ...results]
              setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1))
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              setSelectedIndex(prev => Math.max(prev - 1, -1))
            }
          }}
          aria-label="Search teams, players, leagues, and news"
          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-700"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-gray-700 shadow-xl z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full p-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0 ${
                      recentSearches.length + 4 + index === selectedIndex ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 shrink-0">{getTypeIcon(result.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-white">{result.title}</div>
                        {result.description && <div className="text-sm text-gray-400">{result.description}</div>}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length > 2 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Recent Searches</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-xs text-gray-400">
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className={`w-full p-2 text-left text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors ${
                            index === selectedIndex ? 'bg-gray-800' : ''
                          }`}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Trending</span>
                  </div>
                  <div className="space-y-1">
                    {["Premier League", "Champions League", "Messi", "Real Madrid"].map((trend, index) => (
                      <button
                        key={trend}
                        onClick={() => handleSearch(trend)}
                        className={`w-full p-2 text-left text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors ${
                          recentSearches.length + index === selectedIndex ? 'bg-gray-800' : ''
                        }`}
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
