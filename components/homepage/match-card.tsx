"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"
import { MatchPopup } from "./match-popup"

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
    isYesterday?: boolean
}

const LEAGUE_COLORS: Record<string, string> = {
    'Premier League': 'border-l-[#3d195b]',
    'La Liga': 'border-l-[#ff4b44]',
    'Bundesliga': 'border-l-[#d20515]',
    'Serie A': 'border-l-[#1a56a0]',
    'Ligue 1': 'border-l-[#091c3e]',
    'Champions League': 'border-l-[#1a3a6b]',
}

function safeBadge(url: string | null | undefined): string | null {
    if (!url) return null
    if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
    return `${url}/tiny`
}

function safeParseSportsDBDate(date: string, time?: string): Date | null {
    if (!date) return null
    const parts = date.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return null
    const [year, month, day] = parts
    if (time) {
      const t = time.split('+')[0].split('-')[0]
      const [h, m] = t.split(':').map(Number)
      return new Date(Date.UTC(year, month - 1, day, h || 0, m || 0))
    }
    return new Date(Date.UTC(year, month - 1, day))
}

function formatMatchDate(dateStr: string | null | undefined): string {
    const d = safeParseSportsDBDate(dateStr || '')
    if (!d) return 'TBA'
    if (d.getFullYear() < 2024 || d.getFullYear() > 2030) return 'TBA'
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatMatchTime(dateStr?: string, timeStr?: string): string {
    if (!dateStr) return 'TBA'
    try {
        const parts = dateStr.split('-').map(Number)
        if (parts.length !== 3) return 'TBA'
        const [y, m, d] = parts
        if (y < 2024 || y > 2030) return 'TBA'

        let date: Date
        if (timeStr) {
            const timePart = timeStr.split('+')[0]
            date = new Date(`${dateStr}T${timePart}Z`)
        } else {
            date = new Date(Date.UTC(y, m - 1, d))
        }

        if (isNaN(date.getTime())) return 'TBA'

        // Show time if today, show date if tomorrow
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()

        // Timezone is the VISITOR's, not London's. `timeZone: undefined` lets Intl
        // use the runtime zone, which on the client is the viewer's own. Callers gate
        // this behind a mount check so the server render does not disagree.
        if (isToday) {
            return date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
        }

        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        })
    } catch {
        return 'TBA'
    }
}

function getTeamInitials(name: string) { return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() }
function getBgColor(name: string) {
    let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return `hsl(${Math.abs(hash) % 360}, 60%, 20%)`
}

const LEAGUE_BADGES_LOCAL: Record<string, string> = {
    "4328": "/leagues/premier-league.png",
    "4335": "/leagues/la-liga.png",
    "4331": "/leagues/bundesliga.png",
    "4332": "/leagues/serie-a.png",
    "4334": "/leagues/ligue-1.png",
    "4480": "/leagues/champions-league.png",
}

const LEAGUE_BADGES_REMOTE: Record<string, string> = {
    "4328": "https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png",
    "4335": "https://r2.thesportsdb.com/images/media/league/badge/qjwhxc1617300664.png",
    "4331": "https://r2.thesportsdb.com/images/media/league/badge/bpct641566986627.png",
    "4332": "https://r2.thesportsdb.com/images/media/league/badge/wrjgpz1576432802.png",
    "4334": "https://r2.thesportsdb.com/images/media/league/badge/ligue1badge.png",
    "4480": "https://r2.thesportsdb.com/images/media/league/badge/ucl.png",
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

export function MatchCard() {
    const [matches, setMatches] = useState<MatchData[]>([])
    const [results, setResults] = useState<MatchData[]>([])
    const [loading, setLoading] = useState(true)
    const [dayLabel, setDayLabel] = useState<string>("today")
    const [tab, setTab] = useState<"upcoming" | "results">("upcoming")
    const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null)
    // Kick-off times render in the visitor's timezone, which the server cannot know.
    // Gate them on mount so SSR and hydration agree.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    useEffect(() => {
        async function fetchFixtures() {
            try {
                const res = await fetch("/api/fixtures/today")
                if (res.ok) {
                    const json = await res.json()
                    setMatches(json.upcoming || json.events || [])
                    setResults(json.results || [])
                    setDayLabel(json.label || "today")
                }
            } catch (error) {
                console.error("Failed to load matches", error)
            } finally {
                setLoading(false)
            }
        }
        fetchFixtures()
    }, [])

    const upcomingLabel = dayLabel === "today" ? "Tonight" : dayLabel === "tomorrow" ? "Tomorrow" : "Upcoming"

    const getLeagueColor = (leagueName: string) => {
        for (const [key, val] of Object.entries(LEAGUE_COLORS)) { if (leagueName.includes(key)) return val }
        return 'border-l-accent-primary'
    }

    const currentList = tab === "upcoming" ? matches : results

    return (
        <section id="fixtures" className="py-20 bg-background relative border-t border-border">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header + Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        {tab === "upcoming" ? `${upcomingLabel}'s Matches — Watch Live` : "Today's Results"}
                    </h2>
                    <div className="flex rounded-lg border border-border overflow-hidden self-start sm:self-auto">
                        <button
                            onClick={() => setTab("upcoming")}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === "upcoming" ? "bg-accent-primary text-black" : "bg-surface text-text-secondary hover:bg-surface-elevated"}`}
                        >
                            {upcomingLabel}
                        </button>
                        <button
                            onClick={() => setTab("results")}
                            className={`px-4 py-2 text-sm font-semibold transition-colors border-l border-border ${tab === "results" ? "bg-accent-primary text-black" : "bg-surface text-text-secondary hover:bg-surface-elevated"}`}
                        >
                            Results
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[120px] w-full rounded-xl bg-surface-elevated border border-border" />
                        ))}
                    </div>
                ) : currentList.length > 0 ? (
                    <>
                        {tab === "results" && currentList.some(m => m.isYesterday) && !currentList.some(m => !m.isYesterday) && (
                            <p className="text-xs text-sl-mute mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
                                Yesterday's Results
                            </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentList.map((match) => {
                            const isLive = ['Live', 'HT', '1H', '2H', 'IN PLAY', 'In Progress'].includes(match.strStatus)
                            const isFinished = ['match finished', 'ft', 'aet', 'pen', 'fulltime', 'full time', 'finished'].includes((match.strStatus || '').toLowerCase().trim())
                            // Empty until mounted: the server has no way to know the
                            // viewer's timezone, so rendering a time server-side would
                            // guarantee a hydration mismatch.
                            const formattedTime = mounted ? formatMatchTime(match.strDate, match.strTime) : ''
                            const formattedDate = formatMatchDate(match.strDate)
                            const borderClass = getLeagueColor(match.strLeague)
                            const homeBadge = safeBadge(match.strHomeTeamBadge)
                            const awayBadge = safeBadge(match.strAwayTeamBadge)
                            const leagueBadgeUrl = getLeagueBadgeUrl(match)

                            return (
                                <button
                                    key={match.idEvent}
                                    onClick={() => setSelectedMatch(match)}
                                    className={`bg-surface border-y border-r border-border rounded-lg flex flex-col hover:bg-surface-elevated transition-colors group relative overflow-hidden h-auto min-h-[120px] shadow-sm border-l-[4px] ${borderClass} text-left w-full`}
                                >
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 bg-background/50">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {leagueBadgeUrl ? (
                                                <img
                                                    src={leagueBadgeUrl}
                                                    alt={match.strLeague}
                                                    width={24}
                                                    height={24}
                                                    loading="lazy"
                                                    className="object-contain rounded-sm shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none'
                                                    }}
                                                />
                                            ) : null}
                                            <span className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-wider truncate max-w-[150px] sm:max-w-[250px]">
                                                {match.strLeague}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-text-muted shrink-0">
                                            {formattedDate} {formattedTime}
                                        </div>
                                    </div>

                                    {/* Teams and Score Row */}
                                    <div className="px-4 py-3 flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-center gap-3">
                                            {/* Row 1 (mobile): teams + score */}
                                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:contents">
                                                {/* Home team */}
                                                <div className="flex flex-col items-center text-center md:items-center">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-surface-elevated overflow-hidden"
                                                        style={{ backgroundColor: !homeBadge ? getBgColor(match.strHomeTeam) : '' }}
                                                    >
                                                        {homeBadge ? (
                                                            <img
                                                                src={homeBadge}
                                                                alt={match.strHomeTeam}
                                                                className="max-h-8 max-w-8 object-contain"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const t = e.target as HTMLImageElement; t.style.display = 'none'
                                                                    if (t.parentElement) { t.parentElement.innerHTML = `<span class="text-[8px] font-bold text-sl-text">${getTeamInitials(match.strHomeTeam)}</span>`; t.parentElement.style.backgroundColor = getBgColor(match.strHomeTeam) }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-[8px] font-bold text-sl-text">{getTeamInitials(match.strHomeTeam)}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs mt-1 line-clamp-2 max-w-[80px] sm:max-w-[120px] md:max-w-none leading-tight text-text-primary font-semibold">
                                                        {match.strHomeTeam}
                                                    </span>
                                                </div>

                                                {/* VS + time / score */}
                                                <div className="flex flex-col items-center px-2">
                                                    {(isFinished || isLive || (match.intHomeScore !== null && match.intAwayScore !== null)) ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span className="text-lg font-black text-text-primary">{match.intHomeScore ?? '-'}</span>
                                                            <span className="text-text-muted font-bold">-</span>
                                                            <span className="text-lg font-black text-text-primary">{match.intAwayScore ?? '-'}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-sl-mute">VS</span>
                                                    )}
                                                    <span className="text-xs text-sl-mute">{formattedTime}</span>
                                                    {isLive && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <div className="w-1.5 h-1.5 bg-live-red rounded-full animate-pulse shadow-[0_0_8px_var(--sl-amber)]" />
                                                            <span className="text-[9px] uppercase font-bold text-live-red">Live</span>
                                                        </div>
                                                    )}
                                                    {isFinished && <span className="text-[9px] uppercase font-bold text-text-muted mt-0.5">FT</span>}
                                                    {!isLive && !isFinished && <Clock className="w-3 h-3 text-accent-primary mt-1" />}
                                                </div>

                                                {/* Away team */}
                                                <div className="flex flex-col items-center text-center md:items-center">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-surface-elevated overflow-hidden"
                                                        style={{ backgroundColor: !awayBadge ? getBgColor(match.strAwayTeam) : '' }}
                                                    >
                                                        {awayBadge ? (
                                                            <img
                                                                src={awayBadge}
                                                                alt={match.strAwayTeam}
                                                                className="max-h-8 max-w-8 object-contain"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const t = e.target as HTMLImageElement; t.style.display = 'none'
                                                                    if (t.parentElement) { t.parentElement.innerHTML = `<span class="text-[8px] font-bold text-sl-text">${getTeamInitials(match.strAwayTeam)}</span>`; t.parentElement.style.backgroundColor = getBgColor(match.strAwayTeam) }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-[8px] font-bold text-sl-text">{getTeamInitials(match.strAwayTeam)}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs mt-1 line-clamp-2 max-w-[80px] sm:max-w-[120px] md:max-w-none leading-tight text-text-primary font-semibold">
                                                        {match.strAwayTeam}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Row 2 (mobile): button full width */}
                                            <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                <Link
                                                    href={`/match/${match.idEvent}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full shrink-0 bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap text-center"
                                                >
                                                    {isFinished ? "Match Guide →" : "Broadcast Guide →"}
                                                </Link>
                                                <Link href={`/match/${match.idEvent}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs text-sl-mute hover:text-[var(--sl-amber)] transition-colors block text-center"
                                                >
                                                    Match preview & how to watch
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Other Live Sport */}
                    <div className="mt-6 pt-6 border-t border-[var(--sl-line)]">
                      <h3 className="text-sm font-bold text-sl-mute uppercase tracking-widest mb-4">
                        More Live Sport
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            sport: 'UFC / MMA',
                            icon: '/leagues/ufc.png',
                            href: '/ufc',
                            desc: 'All events included',
                          },
                          {
                            sport: 'Formula 1',
                            icon: '/leagues/formula-1.png',
                            href: '/watch/formula-1',
                            desc: 'Every race live',
                          },
                        ].map(s => (
                          <Link key={s.sport} href={s.href}
                            className="flex items-center gap-3 bg-[var(--sl-surface)] border border-[var(--sl-line)] hover:border-[var(--sl-amber)]/30 rounded-xl p-3 transition-all group">
                            <Image src={s.icon} alt={s.sport}
                              width={32} height={32}
                              className="w-8 h-8 object-contain" loading="lazy" />
                            <div>
                              <p className="text-sl-text font-bold text-xs group-hover:text-[var(--sl-amber)] transition-colors">
                                {s.sport}
                              </p>
                              <p className="text-sl-dim text-[10px]">
                                {s.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                        <p className="text-text-secondary text-lg">
                            {tab === "results" ? "No results yet today. Check back after kick-off." : "No matches found."}
                        </p>
                    </div>
                )}
            </div>

            {/* Match Popup */}
            {selectedMatch && (
                <MatchPopup
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </section>
    )
}
