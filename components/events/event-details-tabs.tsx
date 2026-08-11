"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import type { SportsDbEvent, SportsDbEventStat, SportsDbLineupPlayer, SportsDbEventTimeline } from "@/lib/types"

interface EventDetailsTabsProps {
  event: {
    id: string
    homeTeam: string
    awayTeam: string
    homeLogo?: string
    awayLogo?: string
  }
  additionalInfo: SportsDbEvent | null
}

export function EventDetailsTabs({ event, additionalInfo }: EventDetailsTabsProps) {
  const [stats, setStats] = useState<SportsDbEventStat[] | null>(null)
  const [lineup, setLineup] = useState<SportsDbLineupPlayer[] | null>(null)
  const [timeline, setTimeline] = useState<SportsDbEventTimeline[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsRes, lineupRes, timelineRes] = await Promise.all([
          fetch(`/api/events/${event.id}/stats`),
          fetch(`/api/events/${event.id}/lineups`),
          fetch(`/api/events/${event.id}/timeline`),
        ])
        const [statsJson, lineupJson, timelineJson] = await Promise.all([
          statsRes.json(),
          lineupRes.json(),
          timelineRes.json(),
        ])
        setStats(Array.isArray(statsJson.data) ? statsJson.data : null)
        setLineup(Array.isArray(lineupJson.data) ? lineupJson.data : null)
        setTimeline(Array.isArray(timelineJson.data) ? timelineJson.data : null)
      } catch (error) {
        console.error("Failed to fetch event details:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [event.id])

  const renderStatRow = (statName: string) => {
    const homeStat = stats?.find((s) => s.strStat === statName && s.strTeam === event.homeTeam)
    const awayStat = stats?.find((s) => s.strStat === statName && s.strTeam === event.awayTeam)

    return (
      <div
        key={statName}
        className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-b-0"
      >
        <span className="font-medium text-right w-16">{homeStat?.intStat ?? 0}</span>
        <span className="text-muted-foreground text-center flex-1">{statName}</span>
        <span className="font-medium text-left w-16">{awayStat?.intStat ?? 0}</span>
      </div>
    )
  }

  const homeLineup = lineup?.filter((p) => p.strTeam === event.homeTeam) || []
  const awayLineup = lineup?.filter((p) => p.strTeam === event.awayTeam) || []

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
        <TabsTrigger value="lineups">Lineups</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Match Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : additionalInfo?.strDescriptionEN ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{additionalInfo.strDescriptionEN}</p>
                {Array.isArray(timeline) && timeline.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Key Events</h4>
                    <div className="space-y-3">
                      {timeline.slice(0, 5).map((item) => (
                        <div key={item.idTimeline} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                          <div className="w-12 text-center font-mono text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1">
                            {item.strTime}'
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.strEvent}</p>
                            {item.strPlayer && (
                              <p className="text-xs text-muted-foreground">
                                {item.strPlayer} ({item.strTeam})
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No match summary available.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check other tabs for detailed statistics and information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Match Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : stats && stats.length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold pb-3 border-b-2">
                  <span className="w-16 text-center">{event.homeTeam}</span>
                  <span className="flex-1 text-center">Statistics</span>
                  <span className="w-16 text-center">{event.awayTeam}</span>
                </div>
                {renderStatRow("Shots")}
                {renderStatRow("Shots on Target")}
                {renderStatRow("Possession")}
                {renderStatRow("Fouls")}
                {renderStatRow("Corners")}
                {renderStatRow("Offsides")}
                {renderStatRow("Yellow Cards")}
                {renderStatRow("Red Cards")}
                {renderStatRow("Saves")}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No match statistics available.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Statistics will be available during or after the match.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="lineups" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {event.homeLogo && (
                  <img
                    src={event.homeLogo || "/generic-team-logo.png"}
                    alt={`${event.homeTeam} team logo`}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                {event.homeTeam}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : homeLineup.length > 0 ? (
                <div className="space-y-3">
                  {homeLineup.map((player) => (
                    <div
                      key={player.idPlayer}
                      className="flex items-center gap-3 text-sm p-2 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {player.intSquadNumber || "?"}
                      </span>
                      <span className="flex-1 font-medium">{player.strPlayer}</span>
                      <Badge variant="outline" className="text-xs">
                        {player.strPosition || "N/A"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Lineup not available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {event.awayLogo && (
                  <img
                    src={event.awayLogo || "/generic-team-logo.png"}
                    alt={`${event.awayTeam} team logo`}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                {event.awayTeam}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : awayLineup.length > 0 ? (
                <div className="space-y-3">
                  {awayLineup.map((player) => (
                    <div
                      key={player.idPlayer}
                      className="flex items-center gap-3 text-sm p-2 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {player.intSquadNumber || "?"}
                      </span>
                      <span className="flex-1 font-medium">{player.strPlayer}</span>
                      <Badge variant="outline" className="text-xs">
                        {player.strPosition || "N/A"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Lineup not available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Match Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : timeline && timeline.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={item.idTimeline} className="relative flex items-start gap-6">
                      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {item.strTime}'
                      </div>
                      <div className="flex-1 min-w-0 pb-6">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="font-semibold text-sm">{item.strEvent}</p>
                          {item.strPlayer && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">{item.strPlayer}</span>
                              {item.strTeam && <span> ({item.strTeam})</span>}
                            </p>
                          )}
                          {item.strComment && (
                            <p className="text-xs text-muted-foreground mt-2 italic">{item.strComment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No match timeline available.</p>
                <p className="text-sm text-muted-foreground mt-2">Timeline events will appear here during the match.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
