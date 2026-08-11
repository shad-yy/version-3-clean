"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Info, Globe, Calendar, MapPin } from "lucide-react"
import type { UnifiedTeam } from "@/lib/api/unified-sports-api"

interface TeamInfoCardProps {
  team: UnifiedTeam
  additionalInfo?: any
}

export function TeamInfoCard({ team, additionalInfo }: TeamInfoCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Team Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Full Name</span>
            <span className="text-white font-medium">{team.name}</span>
          </div>

          {team.country && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Country</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-white">{team.country}</span>
              </div>
            </div>
          )}

          {team.founded && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Founded</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-white">{team.founded}</span>
              </div>
            </div>
          )}

          {team.league && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">League</span>
              <Badge variant="secondary">{team.league}</Badge>
            </div>
          )}
        </div>

        {/* Additional Info from TheSportsDB */}
        {additionalInfo && (
          <>
            <hr className="border-gray-700" />
            <div className="space-y-3">
              {additionalInfo.strStadium && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stadium</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{additionalInfo.strStadium}</span>
                  </div>
                </div>
              )}

              {additionalInfo.intStadiumCapacity && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white">
                    {Number.parseInt(additionalInfo.intStadiumCapacity).toLocaleString()}
                  </span>
                </div>
              )}

              {additionalInfo.strManager && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Manager</span>
                  <span className="text-white">{additionalInfo.strManager}</span>
                </div>
              )}

              {additionalInfo.strWebsite && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Website</span>
                  <a
                    href={`https://${additionalInfo.strWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {additionalInfo.strWebsite}
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {/* Team Colors */}
        {additionalInfo?.strTeamJersey && (
          <>
            <hr className="border-gray-700" />
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Team Kit</h4>
              <OptimizedImage
                src={additionalInfo.strTeamJersey}
                alt={`${team.name} kit`}
                width={200}
                height={200}
                className="w-full max-w-48 mx-auto"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
