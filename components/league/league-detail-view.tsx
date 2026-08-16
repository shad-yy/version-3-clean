"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ExternalLink, Info, MapPin, Trophy, Users } from "lucide-react"

// ─── Design tokens ────────────────────────────────────────────────────────────
const CARD_BG = "bg-[#181824]"
const CARD_BG_40 = "bg-[#181824]/40"
const CARD_BG_30 = "bg-[#181824]/30"

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
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#00e676]" />
          Standings Table
        </h3>
        {standings.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" /> CL / Promotion</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/40" /> EL Promotion</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/40" /> Relegation</span>
          </div>
        )}
      </div>

      {standings.length > 0 ? (
        <div className="overflow-x-auto border border-white/5 rounded-xl shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${CARD_BG} border-b border-[#2a2a3e] text-[11px] font-black uppercase text-gray-400 tracking-wider`}>
                <th className="py-4 px-4 text-center w-12">Pos</th>
                <th className="py-4 px-4">Team</th>
                <th className="py-4 px-3 text-center w-12">P</th>
                <th className="py-4 px-3 text-center w-12">W</th>
                <th className="py-4 px-3 text-center w-12">D</th>
                <th className="py-4 px-3 text-center w-12">L</th>
                <th className="py-4 px-3 text-center w-12 hidden md:table-cell">GF</th>
                <th className="py-4 px-3 text-center w-12 hidden md:table-cell">GA</th>
                <th className="py-4 px-3 text-center w-12">GD</th>
                <th className="py-4 px-4 text-center w-16 bg-[#1f1f2e]/40">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => {
                const pos = Number(team.position)

                let zoneClass = "border-b border-white/5 hover:bg-[#181824]/50 transition-colors"
                let posIndicator = "text-gray-400"

                if (pos <= 4 && standings.length > 10) {
                  zoneClass = "border-b border-white/5 hover:bg-emerald-500/5 bg-emerald-500/[0.01] transition-colors"
                  posIndicator = "text-[#00e676] bg-emerald-500/10 rounded-lg px-2 py-0.5"
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
                      <Link href={`/teams/${team.teamId}`} className="flex items-center space-x-3 group hover:text-[#00e676] transition-colors">
                        <div className={`w-6 h-6 rounded-full ${CARD_BG} border border-white/5 flex items-center justify-center p-0.5 flex-shrink-0`}>
                          {team.teamLogo ? (
                            <img src={team.teamLogo} alt={`${team.team} crest`} className="w-full h-full object-contain" loading="lazy" />
                          ) : (
                            <span className="text-[9px] font-bold text-gray-500">{team.team.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-bold text-sm text-white group-hover:text-[#00e676] transition-colors">{team.team}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-center text-sm font-semibold text-gray-300">{team.played}</td>
                    <td className="py-4 px-3 text-center text-sm text-gray-400">{team.won}</td>
                    <td className="py-4 px-3 text-center text-sm text-gray-400">{team.drawn}</td>
                    <td className="py-4 px-3 text-center text-sm text-gray-400">{team.lost}</td>
                    <td className="py-4 px-3 text-center text-sm text-gray-500 hidden md:table-cell">{team.goalsFor}</td>
                    <td className="py-4 px-3 text-center text-sm text-gray-500 hidden md:table-cell">{team.goalsAgainst}</td>
                    <td className="py-4 px-3 text-center text-sm font-semibold text-gray-400">{team.goalDifference}</td>
                    <td className="py-4 px-4 text-center text-sm font-black text-white bg-[#1f1f2e]/20">{team.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-gray-400 text-sm">No standings data currently available for this league.</p>
        </div>
      )}
    </div>
  )
}

function FixturesTab({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#00e676]" />
        Upcoming Fixtures
      </h3>

      {fixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className={`${CARD_BG_40} border border-[#2a2a3e] rounded-xl p-5 hover:border-[#00e676]/30 transition-all group relative overflow-hidden`}
            >
              {fixture.isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />}

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {[
                    { name: fixture.homeTeam, logo: fixture.homeLogo },
                    { name: fixture.awayTeam, logo: fixture.awayLogo },
                  ].map(({ name, logo }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1e1e2d] border border-white/5 flex items-center justify-center p-1.5">
                        {logo ? (
                          <img src={logo} alt="" className="w-full h-full object-contain" loading="lazy" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">{name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-white group-hover:text-[#00e676] transition-colors">{name}</span>
                    </div>
                  ))}
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    fixture.isLive
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-white/5 text-gray-400"
                  }`}>
                    {fixture.status || "Upcoming"}
                  </span>
                  <p className="text-xs text-gray-300 font-bold">{fixture.date}</p>
                  <p className="text-[10px] text-gray-500">{fixture.time}</p>
                </div>
              </div>

              {fixture.venue && (
                <p className="text-[10px] text-gray-500 mt-4 pt-3 border-t border-white/5">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />{fixture.venue}</span>
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <Link
                  href={fixture.isLive ? `/watch` : `/match/${fixture.id}`}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#00e676] hover:underline"
                >
                  Match Center &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-gray-400 text-sm">No upcoming fixtures scheduled.</p>
        </div>
      )}
    </div>
  )
}

function TeamsTab({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#00e676]" />
        Participating Teams
      </h3>

      {teams.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div className={`${CARD_BG_40} border border-[#2a2a3e] rounded-xl p-4 flex flex-col items-center text-center hover:border-[#00e676]/30 transition-all hover:scale-[1.03] group h-full justify-between`}>
                <div className="w-16 h-16 rounded-full bg-[#1e1e2d] border border-white/5 flex items-center justify-center p-2.5 mb-3 group-hover:scale-105 transition-transform">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="text-xl font-black text-gray-500">{team.name.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#00e676] transition-colors line-clamp-1">{team.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{team.country}</p>
                  {team.founded && <p className="text-[9px] text-gray-500 mt-1">Est. {team.founded}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-gray-400 text-sm">No team information available.</p>
        </div>
      )}
    </div>
  )
}

function InfoTab({ league }: { league: League }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-[#00e676]" />
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
              <span className="text-gray-400">{label}</span>
              <span className="font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        <div className={`md:col-span-2 ${CARD_BG_40} border border-white/5 rounded-xl p-5`}>
          <h4 className="font-bold text-white text-sm mb-3">About the Competition</h4>
          {league.description ? (
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{league.description}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">No descriptive information is available for this competition.</p>
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
      <div className="relative rounded-2xl overflow-hidden border border-[#1b1b2f] bg-[#0d0d14] p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[#1a1a28] to-[#12121d] border border-white/10 flex items-center justify-center p-3 shadow-xl flex-shrink-0 backdrop-blur-sm">
            {league.logo ? (
              <img src={league.logo} alt={league.name} className="w-full h-full object-contain" loading="lazy" />
            ) : (
              <div className="text-3xl font-black text-white">{league.name.charAt(0)}</div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs font-bold text-[#00e676] uppercase tracking-[0.25em] mb-1">
                {league.sport} &bull; {league.country}
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">{league.name}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00e676]">Official Stats</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{league.type || "League"}</span>
              {league.formedYear && (
                <span className="text-xs text-gray-400 font-semibold px-3 py-1 rounded-full bg-white/5">Est. {league.formedYear}</span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto self-center md:self-auto bg-gradient-to-br from-[#1a1a28] to-[#12121d] border border-[#2a2a3e] rounded-2xl p-5 md:min-w-[240px] text-center shadow-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Live Streaming</h4>
            <p className="text-xs text-gray-300 mb-4">Stream all matches in 4K UHD.</p>
            <Link
              href={watchHref}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#00e676] text-black font-extrabold text-xs py-3 px-4 rounded-xl hover:bg-[#00ff87] transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(0,230,118,0.2)]"
            >
              Watch League Live <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pill Tabs Selector */}
      <div className="flex bg-[#12121a]/95 border border-[#1a1a2a] p-1.5 rounded-xl overflow-x-auto scrollbar-none gap-1.5 max-w-xl mx-auto backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-1 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-[#00e676] text-black shadow-[0_0_15px_rgba(0,230,118,0.25)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
          className="bg-gradient-to-br from-[#12121a] via-[#12121a] to-[#0d0d14] border border-[#1b1b2f] rounded-2xl p-6 md:p-8 shadow-2xl relative"
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
