"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Users, User } from "lucide-react"
import Link from "next/link"
import type { UnifiedPlayer } from "@/lib/api/unified-sports-api"

interface TeamRosterProps {
  players: UnifiedPlayer[]
}

export function TeamRoster({ players }: TeamRosterProps) {
  const groupedPlayers = players.reduce(
    (acc, player) => {
      const position = player.position || "Unknown"
      if (!acc[position]) {
        acc[position] = []
      }
      acc[position].push(player)
      return acc
    },
    {} as Record<string, UnifiedPlayer[]>,
  )

  if (players.length === 0) {
    return (
      <Card className="bg-sl-surface/50 border-sl-line">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sl-mute">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No roster information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-sl-surface/50 border-sl-line">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Roster ({players.length} players)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
            <div key={position}>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Badge variant="outline" className="border-sl-line">
                  {position}
                </Badge>
                <span className="text-sm text-sl-mute">({positionPlayers.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {positionPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center gap-3 p-3 bg-sl-raise/50 rounded-lg hover:bg-sl-raise transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-sl-raise">
                      {player.photo ? (
                        <OptimizedImage src={player.photo} alt={player.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-sl-mute" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{player.name}</div>
                      <div className="text-sm text-sl-mute">
                        {player.nationality && <span>{player.nationality}</span>}
                        {player.age && <span className="ml-2">Age {player.age}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
