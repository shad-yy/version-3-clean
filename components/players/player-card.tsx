"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { User, Shirt, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Define a minimal interface for Player if not imported
interface Player {
    id: string
    name: string
    thumb?: string
    cutout?: string
    photo?: string
    position?: string
    team?: string
    nationality?: string
    sport?: string
    number?: string
}

interface PlayerCardProps {
    player: Player
    compact?: boolean
}

export function PlayerCard({ player, compact = false }: PlayerCardProps) {
    // Use API images only - prefer cutout for clean look, fallback to thumb
    const imageSrc = player.photo || player.cutout || player.thumb

    return (
        <Link href={`/players/${player.id}`}>
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                <div className={cn(
                    "relative w-full bg-gradient-to-b from-muted/30 to-background overflow-hidden flex items-end justify-center",
                    compact ? "h-40" : "h-64"
                )}>
                    {imageSrc ? (
                        <OptimizedImage
                            src={imageSrc}
                            alt={player.name}
                            width={300}
                            height={300}
                            className="object-contain h-full w-auto transition-transform duration-500 group-hover:scale-110 origin-bottom"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-muted-foreground">{player.name.charAt(0)}</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                    {/* Number Badge */}
                    {player.number && (
                        <div className="absolute top-4 right-4 font-black text-4xl text-foreground/5 group-hover:text-primary/10 transition-colors">
                            {player.number}
                        </div>
                    )}
                </div>

                <CardContent className="relative z-10 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                {player.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                        {player.nationality && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                {player.nationality.slice(0, 3).toUpperCase()}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {player.position && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                {player.position}
                            </Badge>
                        )}
                        {player.sport && (
                            <Badge variant="outline" className="text-xs">
                                {player.sport}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
