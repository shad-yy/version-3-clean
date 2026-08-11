"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { MapPin, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import type { UnifiedTeam } from "@/lib/api/unified-sports-api"

interface TeamCardProps {
    team: UnifiedTeam
    compact?: boolean
}

export function TeamCard({ team, compact = false }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.id}`}>
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                {/* Stadium Background (if available) */}
                {team.stadiumThumb && !compact && (
                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                        <OptimizedImage
                            src={team.stadiumThumb}
                            alt={`${team.name} stadium`}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    </div>
                )}

                <CardHeader className="relative z-10 flex flex-col items-center text-center pb-2">
                    <div className={cn(
                        "relative mx-auto mb-4 bg-background/50 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 p-4 flex items-center justify-center",
                        compact ? "w-20 h-20" : "w-32 h-32"
                    )}>
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-full z-0">
                            <span className="text-2xl font-bold text-muted-foreground">{team.name.charAt(0)}</span>
                        </div>
                        {team.logo && (
                            <img
                                src={`${team.logo}/small`}
                                alt={`${team.name} logo`}
                                className="w-full h-full object-contain relative z-10"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                        )}
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {team.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{team.country}</span>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 text-center space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-muted/50">
                            {team.sport}
                        </Badge>
                        {team.league && (
                            <Badge variant="outline" className="border-primary/20 text-primary">
                                {team.league}
                            </Badge>
                        )}
                    </div>

                    {!compact && team.stadium && (
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                            Home: <span className="font-medium text-foreground">{team.stadium}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
