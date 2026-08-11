"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Globe, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UnifiedLeague } from "@/lib/api/unified-sports-api"

interface LeagueCardProps {
  league: UnifiedLeague
  onClick: () => void
  themeClasses?: { card: string; badge: string }
  isTop?: boolean
}

export function LeagueCard({ league, onClick, themeClasses, isTop = false }: LeagueCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm",
        themeClasses?.card
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="text-center pb-4 relative z-10">
        <div className="relative w-20 h-20 mx-auto mb-4 p-2 bg-background/50 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
          {league.logo ? (
            <OptimizedImage
              src={league.logo}
              alt={`${league.name} logo`}
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-full">
              <span className="text-xl font-bold text-muted-foreground">{league.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
          {league.name}
        </CardTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span>{league.country}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-2">
          {isTop && (
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
              <Trophy className="w-3 h-3 mr-1" /> Top League
            </Badge>
          )}
          <Badge variant="outline" className="bg-background/50">
            {league.sport}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
