"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import type { UnifiedFixture } from "@/lib/api/unified-sports-api"

interface TeamScheduleProps {
  fixtures: UnifiedFixture[]
}

export function TeamSchedule({ fixtures }: TeamScheduleProps) {
  if (fixtures.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming fixtures available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Fixtures ({fixtures.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fixtures.map((fixture) => (
            <Link
              key={fixture.id}
              href={`/events/${fixture.id}`}
              className="block hover:bg-gray-800/50 rounded-lg p-4 transition-colors border border-gray-800/50"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {fixture.league}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {fixture.date} at {fixture.time}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex items-center gap-3 flex-1">
                  {fixture.homeLogo && (
                    <OptimizedImage
                      src={fixture.homeLogo}
                      alt={fixture.homeTeam}
                      width={32}
                      height={32}
                      className="rounded-full bg-white p-1"
                    />
                  )}
                  <div>
                    <div className="font-medium text-white">{fixture.homeTeam}</div>
                    <div className="text-xs text-gray-400">Home</div>
                  </div>
                </div>

                {/* Score/Status */}
                <div className="text-center px-4">
                  {fixture.homeScore !== null && fixture.awayScore !== null ? (
                    <div className="text-lg font-bold text-white">
                      {fixture.homeScore} - {fixture.awayScore}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">{fixture.time}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{fixture.status}</div>
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-medium text-white">{fixture.awayTeam}</div>
                    <div className="text-xs text-gray-400">Away</div>
                  </div>
                  {fixture.awayLogo && (
                    <OptimizedImage
                      src={fixture.awayLogo}
                      alt={fixture.awayTeam}
                      width={32}
                      height={32}
                      className="rounded-full bg-white p-1"
                    />
                  )}
                </div>
              </div>

              {fixture.venue && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {fixture.venue}
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
