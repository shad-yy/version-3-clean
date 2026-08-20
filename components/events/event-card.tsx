"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Clock, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { UnifiedFixture } from "@/lib/api/unified-sports-api"

interface EventCardProps {
    fixture: UnifiedFixture
}

export function EventCard({ fixture }: EventCardProps) {
    const getStatusColor = (status: string) => {
        if (status.includes("Finished") || status.includes("FT")) return "bg-sl-surface text-sl-mid border-sl-line"
        if (status.includes("Scheduled") || status.includes("Not Started")) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        if (status.includes("Live") || status.includes("In Play")) return "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
        return "bg-sl-mute/20 text-sl-mute border-sl-outline/30"
    }

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
        })
    }

    return (
        <Link href={`/events/${fixture.id}`}>
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="p-5">
                    {/* Header: League & Status */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-border/50 text-xs font-normal text-muted-foreground">
                                {fixture.league}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateTime(fixture.date, fixture.time)}
                            </div>
                        </div>
                        <Badge className={cn("text-[10px] font-semibold border px-2 py-0.5", getStatusColor(fixture.status))}>
                            {fixture.status}
                        </Badge>
                    </div>

                    {/* Teams & Score */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                            <div className="relative w-12 h-12 md:w-16 md:h-16 p-2 bg-background/50 rounded-full shadow-sm">
                                {fixture.homeLogo ? (
                                    <OptimizedImage
                                        src={fixture.homeLogo}
                                        alt={fixture.homeTeam}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-full">
                                        <span className="text-xs font-bold text-muted-foreground">{fixture.homeTeam.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-sm md:text-base leading-tight">{fixture.homeTeam}</span>
                        </div>

                        {/* Score / VS */}
                        <div className="flex flex-col items-center justify-center min-w-[80px]">
                            <div className="text-2xl md:text-3xl font-black tracking-tight">
                                {fixture.homeScore !== null && fixture.awayScore !== null ? (
                                    <span className="flex gap-2">
                                        <span>{fixture.homeScore}</span>
                                        <span className="text-muted-foreground/50">-</span>
                                        <span>{fixture.awayScore}</span>
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground/30 text-xl">VS</span>
                                )}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                {fixture.time.slice(0, 5)}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3 group-hover:-translate-x-1 transition-transform duration-300">
                            <div className="relative w-12 h-12 md:w-16 md:h-16 p-2 bg-background/50 rounded-full shadow-sm">
                                {fixture.awayLogo ? (
                                    <OptimizedImage
                                        src={fixture.awayLogo}
                                        alt={fixture.awayTeam}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-full">
                                        <span className="text-xs font-bold text-muted-foreground">{fixture.awayTeam.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-sm md:text-base leading-tight">{fixture.awayTeam}</span>
                        </div>
                    </div>

                    {/* Footer: Venue */}
                    {fixture.venue && (
                        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            {fixture.venue}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
