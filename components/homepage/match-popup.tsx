"use client"

import { useEffect, useRef } from "react"
import { X, Clock, Calendar } from "lucide-react"

interface MatchData {
    idLeague?: string | null
    idEvent: string
    strEvent: string
    strHomeTeam: string
    strAwayTeam: string
    strHomeTeamBadge: string | null
    strAwayTeamBadge: string | null
    intHomeScore: string | null
    intAwayScore: string | null
    strTime: string
    strDate: string
    strLeague: string
    strLeagueBadge?: string | null
    strStatus: string
}

interface MatchPopupProps {
    match: MatchData
    onClose: () => void
}

function safeBadge(url: string | null | undefined): string | null {
    if (!url) return null
    if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
    return `${url}/tiny`
}

const LEAGUE_BADGES_LOCAL: Record<string, string> = {
    "4328": "/leagues/premier-league.png",
    "4335": "/leagues/la-liga.png",
    "4331": "/leagues/bundesliga.png",
    "4332": "/leagues/serie-a.png",
    "4334": "/leagues/ligue-1.png",
    "4480": "/leagues/champions-league.png",
}

function getLeagueBadgeUrl(match: MatchData): string | null {
    const id = match.idLeague ? String(match.idLeague) : ""
    if (id && LEAGUE_BADGES_LOCAL[id]) return LEAGUE_BADGES_LOCAL[id]

    const name = (match.strLeague || "").toLowerCase()
    if (name.includes("premier")) return LEAGUE_BADGES_LOCAL["4328"]
    if (name.includes("la liga")) return LEAGUE_BADGES_LOCAL["4335"]
    if (name.includes("bundesliga")) return LEAGUE_BADGES_LOCAL["4331"]
    if (name.includes("serie a")) return LEAGUE_BADGES_LOCAL["4332"]
    if (name.includes("ligue 1") || name.includes("ligue1")) return LEAGUE_BADGES_LOCAL["4334"]
    if (name.includes("champions")) return LEAGUE_BADGES_LOCAL["4480"]
    return null
}

function getBgColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return `hsl(${Math.abs(hash) % 360}, 60%, 20%)`
}

function getTeamInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
}

export function MatchPopup({ match, onClose }: MatchPopupProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const isLive = ['Live', 'HT', '1H', '2H', 'IN PLAY', 'In Progress'].includes(match.strStatus)
    const isFinished = match.strStatus === 'Match Finished' || match.strStatus === 'FT'
    const formattedDate = match.strDate
        ? new Date(match.strDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
        : ''
    const homeBadge = safeBadge(match.strHomeTeamBadge)
    const awayBadge = safeBadge(match.strAwayTeamBadge)
    const leagueBadgeUrl = getLeagueBadgeUrl(match)

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
            role="dialog"
            aria-modal="true"
            aria-label={`Match details: ${match.strHomeTeam} vs ${match.strAwayTeam}`}
        >
            <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/60">
                    <div className="flex items-center gap-2">
                        {leagueBadgeUrl ? (
                            <img
                                src={leagueBadgeUrl}
                                alt={match.strLeague}
                                width={24}
                                height={24}
                                className="object-contain rounded-sm"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        ) : null}
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{match.strLeague}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
                        aria-label="Close match details"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Date / Status */}
                <div className="flex items-center justify-center gap-3 px-5 pt-4 pb-2">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                    </div>
                    {match.strTime && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Clock className="w-3 h-3" />
                            <span>{match.strTime.substring(0, 5)}</span>
                        </div>
                    )}
                </div>

                {/* Teams + Score */}
                <div className="flex items-stretch justify-between gap-4 px-6 py-6">
                    {/* Home */}
                    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-16 h-16 rounded-full border-2 border-border bg-surface-elevated flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: !homeBadge ? getBgColor(match.strHomeTeam) : undefined }}
                        >
                            {homeBadge ? (
                                <img
                                    src={homeBadge}
                                    alt={match.strHomeTeam}
                                    className="max-h-14 max-w-14 object-contain"
                                    loading="lazy"
                                    onError={(e) => {
                                        const el = e.target as HTMLImageElement
                                        el.style.display = 'none'
                                        if (el.parentElement) {
                                            el.parentElement.innerHTML = `<span class="text-sm font-bold text-white">${getTeamInitials(match.strHomeTeam)}</span>`
                                            el.parentElement.style.backgroundColor = getBgColor(match.strHomeTeam)
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-sm font-bold text-white">{getTeamInitials(match.strHomeTeam)}</span>
                            )}
                        </div>
                        <span className="text-sm font-bold text-text-primary text-center line-clamp-2">{match.strHomeTeam}</span>
                        <span className="text-xs text-text-muted">Home</span>
                    </div>

                    {/* Score / VS */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] gap-2">
                        {(isFinished || isLive || (match.intHomeScore !== null && match.intAwayScore !== null)) ? (
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-text-primary">{match.intHomeScore ?? '-'}</span>
                                <span className="text-xl font-bold text-text-muted">:</span>
                                <span className="text-3xl font-black text-text-primary">{match.intAwayScore ?? '-'}</span>
                            </div>
                        ) : (
                            <span className="text-2xl font-black text-text-muted">VS</span>
                        )}
                        {isLive && (
                            <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
                                <div className="w-1.5 h-1.5 bg-live-red rounded-full animate-pulse shadow-[0_0_8px_#ff1744]" />
                                <span className="text-[10px] uppercase font-bold text-live-red">Live</span>
                            </div>
                        )}
                        {isFinished && (
                            <span className="text-[10px] uppercase font-bold text-text-muted bg-surface-elevated rounded-full px-2 py-0.5 border border-border">FT</span>
                        )}
                        {!isLive && !isFinished && (
                            <span className="text-[10px] text-text-muted">Upcoming</span>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-16 h-16 rounded-full border-2 border-border bg-surface-elevated flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: !awayBadge ? getBgColor(match.strAwayTeam) : undefined }}
                        >
                            {awayBadge ? (
                                <img
                                    src={awayBadge}
                                    alt={match.strAwayTeam}
                                    className="max-h-14 max-w-14 object-contain"
                                    loading="lazy"
                                    onError={(e) => {
                                        const el = e.target as HTMLImageElement
                                        el.style.display = 'none'
                                        if (el.parentElement) {
                                            el.parentElement.innerHTML = `<span class="text-sm font-bold text-white">${getTeamInitials(match.strAwayTeam)}</span>`
                                            el.parentElement.style.backgroundColor = getBgColor(match.strAwayTeam)
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-sm font-bold text-white">{getTeamInitials(match.strAwayTeam)}</span>
                            )}
                        </div>
                        <span className="text-sm font-bold text-text-primary text-center line-clamp-2">{match.strAwayTeam}</span>
                        <span className="text-xs text-text-muted">Away</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                    <a
                        href={`/match/${match.idEvent}`}
                        className="block w-full py-3 text-center bg-accent-primary text-black font-bold text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
                        onClick={onClose}
                    >
                        View TV Broadcast Guide & Channels
                    </a>
                </div>
            </div>
        </div>
    )
}
