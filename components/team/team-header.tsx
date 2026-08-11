"use client"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Calendar, Globe } from "lucide-react"
import type { UnifiedTeam } from "@/lib/api/unified-sports-api"

interface TeamHeaderProps {
  team: UnifiedTeam
  additionalInfo?: any
}

export function TeamHeader({ team, additionalInfo }: TeamHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/20">
            {team.logo ? (
              <OptimizedImage src={team.logo} alt={team.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                {team.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
            <div className="flex items-center space-x-4">
              {team.country && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{team.country}</span>
                </div>
              )}
              {team.founded && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {team.founded}</span>
                </div>
              )}
              {team.league && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {team.league}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {additionalInfo?.strDescriptionEN && (
          <div className="mt-6 max-w-3xl">
            <p className="text-white/90 line-clamp-3">{additionalInfo.strDescriptionEN}</p>
          </div>
        )}
      </div>
    </div>
  )
}
