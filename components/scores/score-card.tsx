"use client"

import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Tv } from "lucide-react"
import Link from "next/link"
import type { UnifiedFixture } from "@/lib/api/unified-sports-api"
import { memo, useMemo } from "react"

interface ScoreCardProps {
  fixture: UnifiedFixture
}

export const ScoreCard = memo(function ScoreCard({ fixture }: ScoreCardProps) {
  const statusInfo = useMemo(() => {
    const isFinished = fixture.status === "Full Time" || fixture.status === "Final"
    const isScheduled = fixture.status === "Scheduled"
    return { isFinished, isScheduled }
  }, [fixture.status])

  const scoreDisplay = useMemo(() => {
    const { isFinished } = statusInfo
    return {
      homeScoreClass: `font-bold text-lg ${isFinished && fixture.homeScore! > fixture.awayScore! ? "text-white" : "text-gray-300"}`,
      awayScoreClass: `font-bold text-lg ${isFinished && fixture.awayScore! > fixture.homeScore! ? "text-white" : "text-gray-300"}`,
    }
  }, [statusInfo, fixture.homeScore, fixture.awayScore])

  return (
    <Link href={`/events/${fixture.id}`} className="block group">
      <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col group-hover:border-blue-500/50 transition-colors duration-200">
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          {/* Header */}
          <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Tv className="w-3 h-3" />
              <span>{fixture.league}</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={statusInfo.isFinished ? "secondary" : "outline"}>{fixture.status}</Badge>
            </div>
          </div>

          {/* Teams & Score */}
          <div className="space-y-3 mb-4">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {fixture.homeLogo && (
                  <OptimizedImage
                    src={fixture.homeLogo}
                    alt={`${fixture.homeTeam} logo`}
                    width={24}
                    height={24}
                    className="bg-white rounded-full object-contain"
                  />
                )}
                <span className="font-medium text-white">{fixture.homeTeam}</span>
              </div>
              <span className={scoreDisplay.homeScoreClass}>{fixture.homeScore ?? "-"}</span>
            </div>
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {fixture.awayLogo && (
                  <OptimizedImage
                    src={fixture.awayLogo}
                    alt={`${fixture.awayTeam} logo`}
                    width={24}
                    height={24}
                    className="bg-white rounded-full object-contain"
                  />
                )}
                <span className="font-medium text-white">{fixture.awayTeam}</span>
              </div>
              <span className={scoreDisplay.awayScoreClass}>{fixture.awayScore ?? "-"}</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-800 pt-3 text-xs text-gray-400 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{fixture.venue || "TBD"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {fixture.date} {fixture.time}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
