"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI, type UnifiedFixture } from "@/lib/api/unified-sports-api"
import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react"
import Link from "next/link"

interface EventsListProps {
  title?: string
  leagueId?: string
  teamId?: string
  maxResults?: number
  showUpcoming?: boolean
  date?: string
  sport?: string
}

export function EventsList({
  title = "Upcoming Events",
  leagueId,
  teamId,
  maxResults = 8,
  showUpcoming = true,
  date,
  sport = "Soccer",
}: EventsListProps) {
  const [events, setEvents] = useState<UnifiedFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await unifiedSportsAPI.getFixtures({
        leagueId,
        teamId,
        date,
        sport,
        next: showUpcoming ? maxResults : undefined,
        last: !showUpcoming ? maxResults : undefined,
      })

      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [leagueId, teamId, maxResults, showUpcoming, date, sport])

  const formatDateTime = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`)
    const now = new Date()
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

    return eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: eventDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  if (loading) {
    return (
      <Card className="bg-sl-surface/50 border-sl-line">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-sl-surface/50 border-sl-line">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            className="text-sl-mute hover:text-sl-text"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Failed to load events</div>
            <p className="text-sm text-sl-mute mb-4">
              {error.includes("Rate limit")
                ? "Data temporarily unavailable, please refresh later."
                : error}
            </p>
            <Button onClick={fetchEvents} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-sl-mute">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Data temporarily unavailable, please refresh later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block hover:bg-sl-raise/50 rounded-lg p-4 transition-colors border border-sl-line/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {event.league}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-sl-mute">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(event.date, event.time)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 flex-1">
                    {event.homeLogo && (
                      <OptimizedImage
                        src={event.homeLogo}
                        alt={event.homeTeam}
                        width={32}
                        height={32}
                        className="rounded-full bg-white p-1"
                      />
                    )}
                    <div>
                      <div className="font-medium text-sl-text">{event.homeTeam}</div>
                      <div className="text-xs text-sl-mute">Home</div>
                    </div>
                  </div>

                  {/* Score/Status */}
                  <div className="text-center px-4">
                    {event.homeScore !== null && event.awayScore !== null ? (
                      <div className="text-lg font-bold text-sl-text">
                        {event.homeScore} - {event.awayScore}
                      </div>
                    ) : (
                      <div className="text-sm text-sl-mute">{event.time}</div>
                    )}
                    <div className="text-xs text-sl-mute mt-1">{event.status}</div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <div className="font-medium text-sl-text">{event.awayTeam}</div>
                      <div className="text-xs text-sl-mute">Away</div>
                    </div>
                    {event.awayLogo && (
                      <OptimizedImage
                        src={event.awayLogo}
                        alt={event.awayTeam}
                        width={32}
                        height={32}
                        className="rounded-full bg-white p-1"
                      />
                    )}
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-sl-mute">
                    <MapPin className="w-3 h-3" />
                    {event.venue}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-4 text-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
