"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ExternalLink, Info, MapPin, Trophy, Users } from "lucide-react"
import { TeamBadge } from "@/components/sightline/team-badge"

// ─── Design tokens ────────────────────────────────────────────────────────────
const CARD_BG = "bg-[var(--sl-raise)]"
const CARD_BG_40 = "bg-[var(--sl-raise)]/40"
const CARD_BG_30 = "bg-[var(--sl-raise)]/30"

// ─── Animation variants (hoisted — stable object references across renders) ───
const TAB_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}
const TAB_TRANSITION = { duration: 0.2 }

// ─── Types ─────────────────────────────────────────────────────────────────────

interface League {
  id: string
  name: string
  country: string
  sport: string
  type: string
  logo: string | null
  description?: string | null
  formedYear?: string | null
}

interface Team {
  id: string
  name: string
  country: string
  logo: string | null
  founded?: string | null
}

interface Standing {
  teamId: string
  team: string
  teamLogo: string | null
  position: string
  played: string
  won: string
  drawn: string
  lost: string
  goalsFor: string
  goalsAgainst: string
  goalDifference: string
  points: string
}

interface Fixture {
  id: string
  homeTeam: string
  awayTeam: string
  homeLogo: string | null
  awayLogo: string | null
  date: string
  time: string
  status: string
  isLive: boolean
  venue?: string | null
}

interface LeagueDetailViewProps {
  league: League
  teams: Team[]
  standings: Standing[]
  fixtures: Fixture[]
}

// ─── Tab view sub-components ──────────────────────────────────────────────────

function StandingsTab({ standings }: { standings: Standing[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-sl-text flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--sl-amber)]" />
          Standings Table
        </h3>
        {standings.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-sl-mute">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sl-amber/20 border border-sl-amber/40" /> CL / Promotion</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/40" /> EL Promotion</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/40" /> Relegation</span>
          </div>
        )}
      </div>

      {standings.length > 0 ? (
        <div className="overflow-x-auto border border-white/5 rounded-xl shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${CARD_BG} border-b border-[var(--sl-line)] text-[11px] font-black uppercase text-sl-mute tracking-wider`}>
                <th className="py-4 px-4 text-center w-12">Pos</th>
                <th className="py-4 px-4">Team</th>
                <th className="py-4 px-3 text-center w-12">P</th>
                <th className="py-4 px-3 text-center w-12">W</th>
                <th className="py-4 px-3 text-center w-12">D</th>
                <th className="py-4 px-3 text-center w-12">L</th>
                <th className="py-4 px-3 text-center w-12 hidden md:table-cell">GF</th>
                <th className="py-4 px-3 text-center w-12 hidden md:table-cell">GA</th>
                <th className="py-4 px-3 text-center w-12">GD</th>
                <th className="py-4 px-4 text-center w-16 bg-[var(--sl-raise)]/40">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => {
                const pos = Number(team.position)

                let zoneClass = "border-b border-white/5 hover:bg-[var(--sl-raise)]/50 transition-colors"
                let posIndicator = "text-sl-mute"

                if (pos <= 4 && standings.length > 10) {
                  zoneClass = "border-b border-white/5 hover:bg-sl-amber/5 bg-sl-amber/[0.02] transition-colors"
                  posIndicator = "text-[var(--sl-amber)] bg-sl-amber/10 rounded-lg px-2 py-0.5"
                } else if ((pos === 5 || pos === 6) && standings.length > 10) {
                  zoneClass = "border-b border-white/5 hover:bg-blue-500/5 bg-blue-500/[0.01] transition-colors"
                  posIndicator = "text-blue-400 bg-blue-500/10 rounded-lg px-2 py-0.5"
                } else if (pos >= standings.length - 2 && standings.length > 10) {
                  zoneClass = "border-b border-white/5 hover:bg-red-500/5 bg-red-500/[0.01] transition-colors"
                  posIndicator = "text-red-400 bg-red-500/10 rounded-lg px-2 py-0.5"
                }

                // Stable key: prefer teamId, fall back to team name
                const rowKey = team.teamId || team.team

                return (
                  <tr key={rowKey} className={zoneClass}>
                    <td className="py-4 px-4 text-center font-bold text-sm">
                      <span className={posIndicator}>{team.position}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/teams/${team.teamId}`} className="flex items-center space-x-3 group hover:text-[var(--sl-amber)] transition-colors">
                        <div className={`w-6 h-6 rounded-full ${CARD_BG} border border-white/5 flex items-center justify-center p-0.5 flex-shrink-0`}>
                          {team.teamLogo ? (
                            <img src={team.teamLogo} alt={`${team.team} crest`} className="w-full h-full object-contain" loading="lazy" />
                          ) : (
                            <span className="text-[9px] font-bold text-sl-mute">{team.team.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-sl-text group-hover:text-[var(--sl-amber)] transition-colors">{team.team}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-center text-sm font-semibold text-sl-mid">{team.played}</td>
                    <td className="py-4 px-3 text-center text-sm text-sl-mute">{team.won}</td>
                    <td className="py-4 px-3 text-center text-sm text-sl-mute">{team.drawn}</td>
                    <td className="py-4 px-3 text-center text-sm text-sl-mute">{team.lost}</td>
                    <td className="py-4 px-3 text-center text-sm text-sl-mute hidden md:table-cell">{team.goalsFor}</td>
                    <td className="py-4 px-3 text-center text-sm text-sl-mute hidden md:table-cell">{team.goalsAgainst}</td>
                    <td className="py-4 px-3 text-center text-sm font-semibold text-sl-mute">{team.goalDifference}</td>
                    <td className="py-4 px-4 text-center text-sm font-black text-sl-text bg-[var(--sl-raise)]/20">{team.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-sl-mute text-sm">No standings data currently available for this league.</p>
        </div>
      )}
    </div>
  )
}

function FixturesTab({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-sl-text mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[var(--sl-amber)]" />
        Upcoming Fixtures
      </h3>

      {fixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className={`${CARD_BG_40} border border-[var(--sl-line)] rounded-xl p-5 hover:border-[var(--sl-amber)]/30 transition-all group relative overflow-hidden`}
            >
              {fixture.isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />}

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {[
                    { name: fixture.homeTeam, logo: fixture.homeLogo },
                    { name: fixture.awayTeam, logo: fixture.awayLogo },
                  ].map(({ name, logo }) => (
                    <div key={name} className="flex items-center gap-3">
                      {/*
                        Was a raw <img>, which bypasses the image pipeline entirely: no
                        webp/avif conversion, no srcset, and none of the 30-day optimised
                        cache the rest of the site's artwork gets.
                      */}
                      <div className="w-8 h-8 rounded-full bg-[var(--sl-raise)] border border-white/5 flex items-center justify-center p-1.5">
                        <TeamBadge src={logo} team={name} size="md" />
                      </div>
                      <span className="font-bold text-sm text-sl-text group-hover:text-[var(--sl-amber)] transition-colors">{name}</span>
                    </div>
                  ))}
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    fixture.isLive
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-white/5 text-sl-mute"
                  }`}>
                    {fixture.status || "Upcoming"}
                  </span>
                  <p className="text-xs text-sl-mid font-bold">{fixture.date}</p>
                  <p className="text-[10px] text-sl-mute">{fixture.time}</p>
                </div>
              </div>

              {fixture.venue && (
                <p className="text-[10px] text-sl-mute mt-4 pt-3 border-t border-white/5">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />{fixture.venue}</span>
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <Link
                  href={fixture.isLive ? `/watch` : `/match/${fixture.id}`}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[var(--sl-amber)] hover:underline"
                >
                  Match Center &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-sl-mute text-sm">No upcoming fixtures scheduled.</p>
        </div>
      )}
    </div>
  )
}

function TeamsTab({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-sl-text mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-[var(--sl-amber)]" />
        Participating Teams
      </h3>

      {teams.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div className={`${CARD_BG_40} border border-[var(--sl-line)] rounded-xl p-4 flex flex-col items-center text-center hover:border-[var(--sl-amber)]/30 transition-all hover:scale-[1.03] group h-full justify-between`}>
                <div className="w-16 h-16 rounded-full bg-[var(--sl-raise)] border border-white/5 flex items-center justify-center p-2.5 mb-3 group-hover:scale-105 transition-transform">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="text-xl font-black text-sl-mute">{team.name.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-sl-text group-hover:text-[var(--sl-amber)] transition-colors line-clamp-1">{team.name}</h4>
                  <p className="text-[10px] text-sl-mute mt-0.5">{team.country}</p>
                  {team.founded && <p className="text-[9px] text-sl-mute mt-1">Est. {team.founded}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-sl-mute text-sm">No team information available.</p>
        </div>
      )}
    </div>
  )
}

function InfoTab({ league }: { league: League }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-sl-text mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-[var(--sl-amber)]" />
        League Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-1 ${CARD_BG_40} border border-white/5 rounded-xl p-5 space-y-4 text-sm`}>
          {[
            { label: "Name",    value: league.name },
            { label: "Country", value: league.country },
            { label: "Sport",   value: league.sport },
            { label: "Format",  value: league.type },
            ...(league.formedYear ? [{ label: "Founded", value: league.formedYear }] : []),
          ].map(({ label, value }, i, arr) => (
            <div key={label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
              <span className="text-sl-mute">{label}</span>
              <span className="font-bold text-sl-text">{value}</span>
            </div>
          ))}
        </div>

        <div className={`md:col-span-2 ${CARD_BG_40} border border-white/5 rounded-xl p-5`}>
          <h4 className="font-bold text-sl-text text-sm mb-3">About the Competition</h4>
          {league.description ? (
            <p className="text-xs text-sl-mid leading-relaxed whitespace-pre-line">{league.description}</p>
          ) : (
            <p className="text-xs text-sl-mute italic">No descriptive information is available for this competition.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function LeagueDetailView({ league, teams, standings, fixtures }: LeagueDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "teams" | "info">("standings")

  const tabs = [
    { id: "standings", label: "Standings", icon: Trophy },
    { id: "fixtures",  label: "Fixtures",  icon: Calendar },
    { id: "teams",     label: "Teams",     icon: Users },
    { id: "info",      label: "Info",      icon: Info },
  ] as const

  const leagueWatchMap: Record<string, string> = {
    "English Premier League": "/watch/premier-league",
    "Spanish La Liga":        "/watch/la-liga",
    "German Bundesliga":      "/watch/bundesliga",
    "Italian Serie A":        "/watch/serie-a",
    "French Ligue 1":         "/watch/ligue-1",
    "UEFA Champions League":  "/watch/champions-league",
    "UEFA Europa League":     "/watch/europa-league",
  }
  // Falls back to the competition index, not a commercial route.
  const watchHref = leagueWatchMap[league.name] ?? "/watch"

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* League Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--sl-raise)] bg-[var(--sl-ground)] p-6 md:p-10 shadow-2xl">
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[var(--sl-raise)] to-[var(--sl-surface)] border border-white/10 flex items-center justify-center p-3 shadow-xl flex-shrink-0 backdrop-blur-sm">
            {league.logo ? (
              <img src={league.logo} alt={league.name} className="w-full h-full object-contain" loading="lazy" />
            ) : (
              <div className="text-3xl font-black text-sl-text">{league.name.charAt(0)}</div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs font-bold text-[var(--sl-amber)] uppercase tracking-[0.25em] mb-1">
                {league.sport} &bull; {league.country}
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-sl-text">{league.name}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sl-amber/10 border border-sl-amber/20 text-[var(--sl-amber)]">Official Stats</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{league.type || "League"}</span>
              {league.formedYear && (
                <span className="text-xs text-sl-mute font-semibold px-3 py-1 rounded-full bg-white/5">Est. {league.formedYear}</span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto self-center md:self-auto bg-gradient-to-br from-[var(--sl-raise)] to-[var(--sl-surface)] border border-[var(--sl-line)] rounded-2xl p-5 md:min-w-[240px] text-center shadow-lg">
            <h4 className="text-xs font-bold text-sl-mute uppercase tracking-widest mb-2">Live Streaming</h4>
            <p className="text-xs text-sl-mid mb-4">Stream all matches in 4K UHD.</p>
            <Link
              href={watchHref}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[var(--sl-amber)] text-black font-extrabold text-xs py-3 px-4 rounded-xl hover:bg-[var(--sl-amber-hover)] transition-all hover:scale-[1.02]"
            >
              Watch League Live <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pill Tabs Selector */}
      <div className="flex bg-[var(--sl-surface)]/95 border border-[var(--sl-raise)] p-1.5 rounded-xl overflow-x-auto scrollbar-none gap-1.5 max-w-xl mx-auto backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-1 ${
                isActive
                  ? "bg-sl-amber text-black"
                  : "text-sl-mute hover:text-sl-text hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={TAB_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TAB_TRANSITION}
          className="bg-gradient-to-br from-[var(--sl-surface)] via-[var(--sl-surface)] to-[var(--sl-ground)] border border-[var(--sl-raise)] rounded-2xl p-6 md:p-8 shadow-2xl relative"
        >
          {activeTab === "standings" && <StandingsTab standings={standings} />}
          {activeTab === "fixtures"  && <FixturesTab  fixtures={fixtures} />}
          {activeTab === "teams"     && <TeamsTab     teams={teams} />}
          {activeTab === "info"      && <InfoTab      league={league} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
