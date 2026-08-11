"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI, type UnifiedStanding } from "@/lib/api/unified-sports-api"
import { Trophy, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"

interface StandingsWidgetProps {
  leagueId: string
  leagueName: string
  season?: number
  maxResults?: number
}

export const StandingsWidget = memo(function StandingsWidget({
  leagueId,
  leagueName,
  season,
  maxResults = 10,
}: StandingsWidgetProps) {
  const [standings, setStandings] = useState<UnifiedStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await unifiedSportsAPI.getStandings(leagueId, season)
      setStandings(data.slice(0, maxResults))
    } catch (err) {
      if (err instanceof Error && err.message.includes("Rate limit")) {
        setError("Data temporarily unavailable, please refresh later.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to load standings")
      }
      setStandings([])
    } finally {
      setLoading(false)
    }
  }, [leagueId, season, maxResults])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  const getPositionColor = useCallback((position: number) => {
    if (position <= 4) return "text-green-400" // Champions League
    if (position <= 6) return "text-blue-400" // Europa League
    if (position >= 18) return "text-red-400" // Relegation
    return "text-gray-400"
  }, [])

  const getFormIcon = useCallback((form?: string, index?: number) => {
    if (!form || index === undefined) return <Minus className="w-3 h-3 text-gray-500" />

    const result = form[index]
    const normalize = (r: string) => {
      if (r === 'ف') return 'W'
      if (r === 'س') return 'D'
      if (r === 'خ') return 'L'
      return r
    }

    switch (normalize(result)) {
      case "W":
        return <TrendingUp className="w-3 h-3 text-green-400" />
      case "L":
        return <TrendingDown className="w-3 h-3 text-red-400" />
      case "D":
        return <Minus className="w-3 h-3 text-yellow-400" />
      default:
        return <Minus className="w-3 h-3 text-gray-500" />
    }
  }, [])

  const processedStandings = useMemo(() => {
    return standings.slice(0, maxResults)
  }, [standings, maxResults])

  const topTeamsForm = useMemo(() => {
    return processedStandings.slice(0, 5).filter((team) => team.form)
  }, [processedStandings])

  const loadingSkeleton = useMemo(
    () => (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            {leagueName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStandings}
            disabled={loading}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Failed to load standings</div>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchStandings} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : processedStandings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Data temporarily unavailable, please refresh later.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium mb-3 px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Team</div>
              <div className="col-span-1 text-center">P</div>
              <div className="col-span-1 text-center">W</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">L</div>
              <div className="col-span-1 text-center">GD</div>
              <div className="col-span-1 text-center">Pts</div>
            </div>

            {/* Standings */}
            <div className="space-y-1">
              {processedStandings.map((team) => (
                <Link
                  key={team.teamId}
                  href={`/teams/${team.teamId}`}
                  className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <div className={`col-span-1 text-sm font-bold ${getPositionColor(team.position)}`}>
                    {team.position}
                  </div>

                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <OptimizedImage
                      src={team.teamLogo}
                      alt={team.team}
                      width={20}
                      height={20}
                      className="rounded-full bg-white p-0.5 flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-white truncate">{team.team}</span>
                  </div>

                  <div className="col-span-1 text-center text-sm text-gray-300">{team.played}</div>

                  <div className="col-span-1 text-center text-sm text-green-400">{team.won}</div>

                  <div className="col-span-1 text-center text-sm text-yellow-400">{team.drawn}</div>

                  <div className="col-span-1 text-center text-sm text-red-400">{team.lost}</div>

                  <div
                    className={`col-span-1 text-center text-sm ${team.goalDifference > 0
                        ? "text-green-400"
                        : team.goalDifference < 0
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                  >
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference}
                  </div>

                  <div className="col-span-1 text-center text-sm font-bold text-white">{team.points}</div>
                </Link>
              ))}
            </div>

            {/* Form indicators */}
            {topTeamsForm.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h4 className="text-xs text-gray-400 mb-2">Recent Form (Last 5 games)</h4>
                <div className="space-y-2">
                  {topTeamsForm.map((team) => (
                    <div key={team.teamId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OptimizedImage
                          src={team.teamLogo}
                          alt={team.team}
                          width={16}
                          height={16}
                          className="rounded-full bg-white p-0.5"
                        />
                        <span className="text-xs text-gray-300 truncate max-w-20">{team.team}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {team.form
                          ?.slice(-5)
                          .split("")
                          .map((result, index) => (
                            <div key={index}>{getFormIcon(team.form, team.form!.length - 5 + index)}</div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/leagues/${leagueId}`}>View Full Table</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
})
