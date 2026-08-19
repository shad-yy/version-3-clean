"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI, type UnifiedFixture } from "@/lib/api/unified-sports-api"
import { Zap, RefreshCw, Calendar, Clock, Trophy } from "lucide-react"
import Link from "next/link"

interface ScoresWidgetProps {
  leagueId?: string
  maxResults?: number
}

export const ScoresWidget = memo(function ScoresWidget({ leagueId, maxResults = 6 }: ScoresWidgetProps) {
  const [fixtures, setFixtures] = useState<UnifiedFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"today" | "recent" | "upcoming">("today")

  const fetchFixtures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let data: UnifiedFixture[] = []

      switch (activeTab) {
        case "today":
          const res = await fetch("/api/scores/today")
          if (!res.ok) throw new Error("Failed to load today's matches")
          const json = await res.json()

          if (json.matches) {
            data = json.matches
          } else {
            data = []
          }
          break
        case "recent":
          data = await unifiedSportsAPI.getFixtures({
            leagueId,
            last: maxResults,
          })
          break
        case "upcoming":
          data = await unifiedSportsAPI.getFixtures({
            leagueId,
            next: maxResults,
          })
          break
      }

      setFixtures(data.slice(0, maxResults))
    } catch (err) {
      if (err instanceof Error && err.message.includes("Rate limit")) {
        setError("Data temporarily unavailable, please refresh later.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to load fixtures")
      }
      setFixtures([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, leagueId, maxResults])

  useEffect(() => {
    fetchFixtures()
  }, [fetchFixtures])

  const getStatusColor = useCallback((status: string) => {
    if (status.includes("Finished") || status.includes("Full Time")) return "bg-green-500 text-sl-text"
    if (status.includes("Scheduled") || status.includes("Not Started")) return "bg-blue-500 text-sl-text"
    return "bg-gray-500 text-sl-text"
  }, [])

  const formatScore = useCallback((homeScore: number | null, awayScore: number | null) => {
    if (homeScore === null || awayScore === null) return "vs"
    return `${homeScore} - ${awayScore}`
  }, [])

  const processedFixtures = useMemo(() => {
    return fixtures.slice(0, maxResults)
  }, [fixtures, maxResults])

  const loadingSkeleton = useMemo(
    () => (
      <Card className="bg-sl-surface/50 border-sl-line">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    [],
  )

  if (loading) {
    return loadingSkeleton
  }

  return (
    <Card className="bg-sl-surface/50 border-sl-line">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            Scores & Fixtures
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFixtures}
            disabled={loading}
            className="text-sl-mute hover:text-sl-text"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === "today" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("today")}
            className="flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" />
            Today
          </Button>
          <Button
            variant={activeTab === "recent" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("recent")}
            className="flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            Recent
          </Button>
          <Button
            variant={activeTab === "upcoming" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("upcoming")}
            className="flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            Upcoming
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Failed to load fixtures</div>
            <p className="text-sm text-sl-mute mb-4">{error}</p>
            <Button onClick={fetchFixtures} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : processedFixtures.length === 0 ? (
          <div className="text-center py-8 text-sl-mute">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{activeTab === "today" ? "No matches today" : `No ${activeTab} matches found`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedFixtures.map((fixture) => (
              <Link
                key={fixture.id}
                href={`/events/${fixture.id}`}
                className="block hover:bg-sl-raise/50 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Teams */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {fixture.homeLogo && (
                        <OptimizedImage
                          src={fixture.homeLogo}
                          alt={fixture.homeTeam}
                          width={24}
                          height={24}
                          className="rounded-full bg-white p-0.5"
                        />
                      )}
                      <span className="font-medium text-sl-text truncate">{fixture.homeTeam}</span>
                    </div>
                  </div>

                  {/* Score/Time */}
                  <div className="flex items-center gap-3 px-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-sl-text">
                        {formatScore(fixture.homeScore, fixture.awayScore)}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(fixture.status)}`}>
                        {fixture.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className="font-medium text-sl-text truncate text-right">{fixture.awayTeam}</span>
                      {fixture.awayLogo && (
                        <OptimizedImage
                          src={fixture.awayLogo}
                          alt={fixture.awayTeam}
                          width={24}
                          height={24}
                          className="rounded-full bg-white p-0.5"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Info */}
                <div className="flex items-center justify-between mt-2 text-xs text-sl-mute">
                  <span>{fixture.league}</span>
                  <div className="flex items-center gap-2">
                    {fixture.venue && (
                      <>
                        <span>{fixture.venue}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>
                      {fixture.date} {fixture.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {processedFixtures.length > 0 && (
          <div className="mt-4 text-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/scores">View All Scores</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
