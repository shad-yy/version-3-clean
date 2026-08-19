"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { LEAGUES } from "@/lib/constants/leagues"

const FEATURED_LEAGUES = [
    { id: "4328", name: "Premier League", badgeUrl: Object.values(LEAGUES).find(l => l.id === "4328")?.badgeUrl, localBadge: Object.values(LEAGUES).find(l => l.id === "4328")?.localBadge },
    { id: "4335", name: "La Liga", badgeUrl: Object.values(LEAGUES).find(l => l.id === "4335")?.badgeUrl, localBadge: Object.values(LEAGUES).find(l => l.id === "4335")?.localBadge },
    { id: "4331", name: "Bundesliga", badgeUrl: Object.values(LEAGUES).find(l => l.id === "4331")?.badgeUrl, localBadge: Object.values(LEAGUES).find(l => l.id === "4331")?.localBadge },
    { id: "4332", name: "Serie A", badgeUrl: Object.values(LEAGUES).find(l => l.id === "4332")?.badgeUrl, localBadge: Object.values(LEAGUES).find(l => l.id === "4332")?.localBadge },
    { id: "4334", name: "Ligue 1", badgeUrl: Object.values(LEAGUES).find(l => l.id === "4334")?.badgeUrl, localBadge: Object.values(LEAGUES).find(l => l.id === "4334")?.localBadge },
]

// ── TeamBadge ──────────────────────────────────────────────────────────────
// The badge URL comes pre-normalised from the API (safeBadgeUrl already added
// /tiny exactly once). We render it verbatim — no /tiny appending here.

const getTeamInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()

const getBgColor = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return `hsl(${Math.abs(hash) % 360}, 60%, 20%)`
}

function TeamBadge({ logoUrl, teamName }: { logoUrl?: string | null; teamName: string }) {
    const [imgOk, setImgOk] = useState(true)
    const hasSrc = !!logoUrl

    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: (!hasSrc || !imgOk) ? getBgColor(teamName) : 'transparent' }}
        >
            {hasSrc && imgOk ? (
                <img
                    src={logoUrl!}
                    alt={teamName}
                    width={32}
                    height={32}
                    className="max-h-8 max-w-8 object-contain"
                    loading="lazy"
                    onError={() => setImgOk(false)}
                />
            ) : (
                <span className="text-[10px] font-bold text-sl-text">{getTeamInitials(teamName)}</span>
            )}
        </div>
    )
}

export function LeagueTables() {
    const [activeTab, setActiveTab] = useState(FEATURED_LEAGUES[0])
    const [standings, setStandings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // A table is only "live" while matches are still to be played. Every top-five
    // European league plays 34 or 38 rounds, so once every side has played its full
    // allocation the table is final and must not be labelled live.
    const maxPlayed = standings.reduce(
        (acc: number, team: any) => Math.max(acc, Number(team?.played) || 0),
        0,
    )
    const roundsInSeason = standings.length > 0 ? (standings.length - 1) * 2 : 0
    const seasonComplete =
        standings.length > 0 && roundsInSeason > 0 && maxPlayed >= roundsInSeason

    useEffect(() => {
        async function fetchStandings() {
            setLoading(true)
            try {
                const res = await fetch(`/api/standings/${activeTab.id}`)
                if (res.ok) {
                    const json = await res.json()
                    setStandings(json.data || [])
                }
            } catch (error) {
                console.error(`Failed to load standings for ${activeTab.name}`, error)
            } finally {
                setLoading(false)
            }
        }

        fetchStandings()
    }, [activeTab.id]) // Re-fetch when tab changes


    const FormPill = ({ result }: { result: string }) => {
        const colors: Record<string, string> = {
            W: "bg-green-500 text-black",
            D: "bg-gray-500 text-sl-text",
            L: "bg-red-500 text-sl-text",
        }
        return (
            <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[result] || "bg-gray-700 text-sl-text"
                    }`}
            >
                {result}
            </span>
        )
    }

    const renderFormPills = (formStr?: string) => {
        if (!formStr) return null
        const results = formStr.replace(/[^WDL]/g, "").split("").slice(-5)
        if (results.length === 0) return null
        return (
            <div className="flex items-center gap-1 justify-center">
                {results.map((r, idx) => (
                    <FormPill key={`${r}-${idx}`} result={r} />
                ))}
            </div>
        )
    }

    const getDescriptionBorder = (desc?: string) => {
        if (!desc) return ""
        if (desc.includes("Champions League")) return "border-l-2 border-blue-500"
        if (desc.includes("Europa League")) return "border-l-2 border-orange-500"
        if (desc.includes("Relegation")) return "border-l-2 border-red-500"
        return ""
    }

    return (
        <section className="py-20 bg-background border-t border-border relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                        {seasonComplete ? 'Final Standings' : 'League Standings'}{' '}
                        <span className="text-accent-primary">
                            {seasonComplete ? '— Season Complete' : '— Updated Live'}
                        </span>
                    </h2>
                    <p className="text-text-secondary">
                        {seasonComplete
                            ? `Final table after ${maxPlayed} matches. The new season table appears once it kicks off.`
                            : `Current table after ${maxPlayed} ${maxPlayed === 1 ? 'match' : 'matches'} played.`}
                    </p>
                </div>

                {/* Swipeable Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-4 border-b border-border">
                    {FEATURED_LEAGUES.map((league) => (
                        <button
                            key={league.id}
                            onClick={() => setActiveTab(league)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab.id === league.id
                                    ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                                    : 'bg-surface-elevated text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <img 
                                    src={league.localBadge || league.badgeUrl}
                                    alt={league.name}
                                    width={20}
                                    height={20}
                                    loading="lazy"
                                    className="w-5 h-5 object-contain flex-shrink-0"
                                    onError={(e) => {
                                        const t = e.target as HTMLImageElement
                                        if (league.badgeUrl && t.src !== league.badgeUrl) {
                                            t.src = league.badgeUrl
                                        } else {
                                            t.src = '/leagues/placeholder.svg'
                                        }
                                    }}
                                />
                                <span>{league.name}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Table Content */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-8 shadow-xl relative">
                    {!loading && standings.length > 0 && (
                        <div className="md:hidden absolute right-3 top-3 bg-black/80 backdrop-blur-sm border border-[var(--sl-line)] text-[10px] font-bold text-[var(--sl-amber)] px-2.5 py-1 rounded-full animate-pulse z-20 pointer-events-none flex items-center gap-1">
                            Swipe Table <span>→</span>
                        </div>
                    )}
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-10 w-full bg-surface-elevated rounded-lg" />
                            ))}
                        </div>
                    ) : standings.length > 0 ? (
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-surface-elevated z-10">
                                    <tr className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">
                                        <th className="py-3 px-3 text-center w-10">#</th>
                                        <th className="py-3 px-3 text-left">Team</th>
                                        <th className="py-3 px-3 text-center w-10">P</th>
                                        <th className="py-3 px-3 text-center w-10">W</th>
                                        <th className="py-3 px-3 text-center w-10">D</th>
                                        <th className="py-3 px-3 text-center w-10">L</th>
                                        <th className="py-3 px-3 text-center w-10 hidden md:table-cell">GF</th>
                                        <th className="py-3 px-3 text-center w-10 hidden md:table-cell">GA</th>
                                        <th className="py-3 px-3 text-center w-10 hidden md:table-cell">GD</th>
                                        <th className="py-3 px-3 text-center">Form</th>
                                        <th className="py-3 px-3 text-center w-12 text-text-primary">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((team, index) => (
                                        <tr
                                            key={team.teamId || index}
                                            className={[
                                                "border-b border-border/50 hover:bg-surface-elevated transition-colors",
                                                "even:bg-white/[0.02]",
                                            ].join(" ")}
                                        >
                                            <td className="py-3 px-3 text-center text-text-secondary">{team.position}</td>
                                            <td className="py-3 px-3">
                                                <div className={`flex items-center gap-3 pl-2 ${getDescriptionBorder(team.description)}`}>
                                                    <TeamBadge logoUrl={team.teamLogo} teamName={team.team} />
                                                    <span className="font-bold text-text-primary line-clamp-1">{team.team}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center text-text-secondary">{team.played}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary">{team.won}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary">{team.drawn}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary">{team.lost}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary hidden md:table-cell">{team.goalsFor}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary hidden md:table-cell">{team.goalsAgainst}</td>
                                            <td className="py-3 px-3 text-center text-text-secondary hidden md:table-cell">{team.goalDifference}</td>
                                            <td className="py-3 px-3 text-center">{renderFormPills(team.form)}</td>
                                            <td className="py-3 px-3 text-center font-bold text-accent-primary">{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-text-secondary">
                            Data temporarily unavailable.
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link
                        href={`/watch/${activeTab.name.toLowerCase().replace(/ /g, '-')}`}
                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-accent-primary text-accent-primary font-bold rounded-lg transition-all hover:bg-accent-primary hover:text-black"
                    >
                        Watch {activeTab.name} Live →
                    </Link>
                </div>
            </div>
        </section>
    )
}
