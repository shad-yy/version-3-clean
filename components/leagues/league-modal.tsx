"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Trophy, Calendar, ExternalLink } from "lucide-react"
import { unifiedSportsAPI, type UnifiedLeague } from "@/lib/api/unified-sports-api"
import Link from "next/link"

interface LeagueModalProps {
  league: UnifiedLeague | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeagueModal({ league, open, onOpenChange }: LeagueModalProps) {
  if (!league) return null

  const currentSeason = unifiedSportsAPI.getSeasonString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-32 h-32 relative mb-4 p-4 bg-muted/20 rounded-full">
              {league.logo ? (
                <OptimizedImage
                  src={league.logo}
                  alt={league.name}
                  width={128}
                  height={128}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-full">
                  <span className="text-3xl font-bold text-muted-foreground">{league.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <DialogTitle className="text-3xl font-bold mb-2">{league.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-lg">
              <Globe className="w-4 h-4" /> {league.country} • {league.sport}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {league.description && (
            <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed text-muted-foreground max-h-[200px] overflow-y-auto">
              {league.description}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border/50 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-sm text-muted-foreground">First Held</div>
              <div className="font-bold">{league.formedYear || "Unknown"}</div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/50 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">Current Season</div>
              <div className="font-bold">{currentSeason}</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/leagues/${league.id}`}>
                View Full Details
              </Link>
            </Button>
            {league.website && (
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a href={`https://${league.website}`} target="_blank" rel="noopener noreferrer">
                  Official Website <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
