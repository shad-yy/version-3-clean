"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Users, Clock, Info, Shield, MapPin, Calendar, ExternalLink, Zap } from "lucide-react"

// ─── Design tokens ────────────────────────────────────────────────────────────
const CARD_BG = "bg-[var(--sl-raise)]"
const CARD_BG_50 = "bg-[var(--sl-raise)]/50"
const CARD_BG_30 = "bg-[var(--sl-raise)]/30"

// ─── Animation variants (hoisted to avoid re-creating on every render) ────────
const TAB_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}
const TAB_TRANSITION = { duration: 0.25 }

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineupPlayer {
  idPlayer: string
  idTeam: string
  strTeam: string
  strPlayer: string
  strPosition: string
  intSquadNumber: number
  strCutout?: string
  strThumb?: string
}

interface EventTimeline {
  idTimeline: string
  idEvent: string
  strTimeline?: string
  strTimelineDetail?: string
  strHome?: string
  strEvent: string
  strPlayer?: string
  strAssist?: string
  strTime?: string
  strTeam?: string
  strComment?: string
}

interface EventStat {
  idEvent: string
  idTeam?: string
  strStat: string
  intHome?: number
  intAway?: number
  strTeam: string
  intStat: number
}

interface MatchTabsProps {
  homeTeam: string
  awayTeam: string
  homeTeamBadge: string | null
  awayTeamBadge: string | null
  homeTeamId: string
  awayTeamId: string
  venue: string | null
  date: string
  time: string
  league: string
  lineup: LineupPlayer[]
  timeline: EventTimeline[]
  stats: EventStat[]
  watchHref: string
}

// ─── Sub-view types ───────────────────────────────────────────────────────────

interface InfoViewProps {
  date: string
  time: string
  venue: string | null
  league: string
}

interface StatsViewProps {
  displayStats: Record<string, { home?: number; away?: number }>
  homeTeam: string
  awayTeam: string
}

interface TimelineViewProps {
  timeline: EventTimeline[]
  homeTeam: string
  awayTeam: string
}

interface LineupViewProps {
  homeTeam: string
  awayTeam: string
  homeTeamBadge: string | null
  awayTeamBadge: string | null
  homeLineup: LineupPlayer[]
  awayLineup: LineupPlayer[]
}

// ─── Tab view components ──────────────────────────────────────────────────────

function InfoView({ date, time, venue, league }: InfoViewProps) {
  return (
    <div className="relative z-10 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-sl-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--sl-amber)]" />
            Fixture Details
          </h3>
          <div className="space-y-4 text-sm text-sl-mid">
            <div className={`flex items-center gap-3 ${CARD_BG}/65 border border-white/5 p-3 rounded-xl`}>
              <Calendar className="w-4 h-4 text-[var(--sl-amber)]" />
              <span><strong>Date:</strong> {date}</span>
            </div>
            {time && (
              <div className={`flex items-center gap-3 ${CARD_BG}/65 border border-white/5 p-3 rounded-xl`}>
                <Clock className="w-4 h-4 text-[var(--sl-amber)]" />
                <span><strong>Time:</strong> {time.split("+")[0]} BST / Local</span>
              </div>
            )}
            {venue && (
              <div className={`flex items-center gap-3 ${CARD_BG}/65 border border-white/5 p-3 rounded-xl`}>
                <MapPin className="w-4 h-4 text-[var(--sl-amber)]" />
                <span><strong>Venue:</strong> {venue}</span>
              </div>
            )}
            <div className={`flex items-center gap-3 ${CARD_BG}/65 border border-white/5 p-3 rounded-xl`}>
              <Zap className="w-4 h-4 text-[var(--sl-amber)]" />
              <span><strong>League:</strong> {league}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--sl-raise)] to-[var(--sl-surface)] border border-[#2a2a3e] rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="text-sm font-extrabold text-sl-text uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Broadcast
            </h4>
            <p className="text-xs text-sl-mid leading-relaxed mb-6">
              Broadcast rights differ by country. We list the rights holder for each
              country we have verified, alongside confirmed kick-off times shown in
              your local time.
            </p>
          </div>
          <Link
            href="/scores"
            className="inline-flex items-center justify-center gap-2 bg-[var(--sl-amber)] text-black font-extrabold text-sm py-4 px-6 rounded-xl hover:bg-[var(--sl-amber-hover)] transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,230,118,0.2)]"
          >
            View Live Scores <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-[var(--sl-raise)] pt-6">
        <h4 className="font-bold text-sl-text text-sm mb-4">Why watch on Smart Live TV?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: "Multi-screen viewing",  d: "Watch up to 4 matches simultaneously in a single browser window." },
            { t: "No contract latency",   d: "Stream using low-latency feeds optimized for mobile and smart TVs." },
            { t: "Pre-match coverage",    d: "Access deep stats, lineups, and match facts beforehand." },
          ].map((item) => (
            <div key={item.t} className={`${CARD_BG_50} border border-[#2a2a3e] p-4 rounded-xl`}>
              <h5 className="text-xs font-bold text-[var(--sl-amber)] mb-1.5">{item.t}</h5>
              <p className="text-xs text-sl-mid leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatsView({ displayStats, homeTeam, awayTeam }: StatsViewProps) {
  const hasRealStats = Object.keys(displayStats).length > 0

  if (!hasRealStats) {
    return (
      <div className="relative z-10">
        <div className={`text-center py-16 ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[var(--sl-amber)] opacity-40" />
          <p className="text-sm text-sl-mute">Stats will be available after the match begins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 space-y-6">
      <h3 className="text-lg font-bold text-sl-text mb-6">
        Team Comparison — <span className="text-emerald-400">{homeTeam}</span> vs <span className="text-blue-400">{awayTeam}</span>
      </h3>
      <div className="space-y-6">
        {Object.entries(displayStats).map(([name, val]) => {
          const homeVal = val.home ?? 0
          const awayVal = val.away ?? 0
          const total = homeVal + awayVal || 1
          const homePct = (homeVal / total) * 100
          const awayPct = (awayVal / total) * 100

          return (
            <div key={name} className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                <span className="text-emerald-400">{homeVal}</span>
                <span className="text-sl-text text-center font-black tracking-widest">{name}</span>
                <span className="text-blue-400">{awayVal}</span>
              </div>
              <div className={`h-2.5 w-full ${CARD_BG} rounded-full overflow-hidden flex`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full"
                  style={{ width: `${homePct}%` }}
                />
                <div className="h-full bg-[var(--sl-surface)]" style={{ width: `${100 - homePct - awayPct}%` }} />
                <div
                  className="h-full bg-gradient-to-l from-blue-600 to-blue-400 rounded-r-full"
                  style={{ width: `${awayPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimelineView({ timeline, homeTeam, awayTeam }: TimelineViewProps) {
  return (
    <div className="relative z-10 space-y-6">
      <h3 className="text-lg font-bold text-sl-text mb-6">Match Events</h3>
      {timeline.length === 0 ? (
        <div className={`text-center py-10 text-sl-mute ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <Clock className="w-12 h-12 mx-auto mb-4 text-[var(--sl-amber)] opacity-60" />
          <p className="text-sm">Timeline events will appear as goals, bookings, and substitutions occur.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[var(--sl-raise)] ml-4 pl-6 space-y-8">
          {timeline.map((event, idx) => {
            const isHome = event.strHome === "yes" || event.strTeam === homeTeam
            return (
              <div key={event.idTimeline || idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[var(--sl-surface)] border-2 border-emerald-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className={`${CARD_BG_50} border border-white/5 rounded-xl p-4 flex justify-between items-center hover:border-[var(--sl-amber)]/30 transition-colors`}>
                  <div>
                    <span className="text-xs font-bold text-[var(--sl-amber)] mr-2">{event.strTime || "—"}&apos;</span>
                    <span className="text-sm font-bold text-sl-text">{event.strEvent}</span>
                    {event.strPlayer && (
                      <p className="text-xs text-sl-mute mt-1">
                        {event.strPlayer}
                        {event.strAssist && ` (Assist: ${event.strAssist})`}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-[var(--sl-raise)] text-sl-mid border border-white/5 max-w-[120px] truncate">
                    {event.strTeam || (isHome ? homeTeam : awayTeam)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TeamColumn({
  teamName,
  teamBadge,
  lineup,
  accentClass,
}: {
  teamName: string
  teamBadge: string | null
  lineup: LineupPlayer[]
  accentClass: string
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
        {teamBadge && <img src={teamBadge} alt={`${teamName ?? "Team"} crest`} className="w-8 h-8 object-contain" loading="lazy" />}
        <h3 className="font-bold text-sl-text text-base">{teamName}</h3>
      </div>

      {lineup.length === 0 ? (
        <div className={`p-6 text-center text-sl-mute ${CARD_BG_30} border border-white/5 rounded-2xl`}>
          <p className="text-xs italic">Starting eleven and substitutes will be updated 1 hour before kickoff.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lineup.map((player) => (
            <div
              key={player.idPlayer}
              className={`flex items-center gap-3 ${CARD_BG_50} p-2.5 rounded-lg border border-white/5 hover:border-[var(--sl-amber)]/20 transition-colors`}
            >
              <div className={`w-7 h-7 rounded-full ${accentClass} font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                {player.intSquadNumber || "—"}
              </div>
              <div>
                <p className="text-sm font-bold text-sl-text">{player.strPlayer}</p>
                <p className="text-[10px] text-sl-mute uppercase font-semibold">{player.strPosition || "Player"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LineupView({ homeTeam, awayTeam, homeTeamBadge, awayTeamBadge, homeLineup, awayLineup }: LineupViewProps) {
  return (
    <div className="relative z-10 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TeamColumn
          teamName={homeTeam}
          teamBadge={homeTeamBadge}
          lineup={homeLineup}
          accentClass="bg-emerald-500/20 text-emerald-400"
        />
        <TeamColumn
          teamName={awayTeam}
          teamBadge={awayTeamBadge}
          lineup={awayLineup}
          accentClass="bg-blue-500/20 text-blue-400"
        />
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function MatchTabs({
  homeTeam,
  awayTeam,
  homeTeamBadge,
  awayTeamBadge,
  homeTeamId,
  awayTeamId,
  venue,
  date,
  time,
  league,
  lineup,
  timeline,
  stats,
}: MatchTabsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "lineups" | "timeline">("info")

  const tabs = [
    { id: "info",     label: "Match Info",  icon: Info },
    { id: "stats",    label: "Match Stats", icon: BarChart3 },
    { id: "timeline", label: "Timeline",    icon: Clock },
    { id: "lineups",  label: "Lineups",     icon: Users },
  ] as const

  const homeLineup = lineup.filter((p) => p.idTeam === homeTeamId)
  const awayLineup = lineup.filter((p) => p.idTeam === awayTeamId)

  // Deduplicate stats per stat name, keyed by team
  const uniqueStats: Record<string, { home?: number; away?: number }> = {}
  for (const s of stats) {
    const key = s.strStat.toLowerCase()
    if (!uniqueStats[key]) uniqueStats[key] = {}
    if (s.idTeam === homeTeamId || s.strTeam === homeTeam) {
      uniqueStats[key].home = Number(s.intStat || s.intHome || 0)
    } else {
      uniqueStats[key].away = Number(s.intStat || s.intAway || 0)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Pill-style Tabs List */}
      <div className="flex bg-[var(--sl-surface)]/95 border border-[var(--sl-raise)] p-1.5 rounded-xl mb-8 overflow-x-auto scrollbar-none gap-1.5 max-w-xl mx-auto backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-1 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-[var(--sl-amber)] text-black shadow-[0_0_15px_rgba(0,230,118,0.25)]"
                  : "text-sl-mute hover:text-sl-text hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={TAB_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TAB_TRANSITION}
          className="bg-gradient-to-br from-[var(--sl-surface)] via-[var(--sl-surface)] to-[var(--sl-ground)] border border-[var(--sl-raise)] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient light inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {activeTab === "info"     && <InfoView date={date} time={time} venue={venue} league={league} />}
          {activeTab === "stats"    && <StatsView displayStats={uniqueStats} homeTeam={homeTeam} awayTeam={awayTeam} />}
          {activeTab === "timeline" && <TimelineView timeline={timeline} homeTeam={homeTeam} awayTeam={awayTeam} />}
          {activeTab === "lineups"  && (
            <LineupView
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeTeamBadge={homeTeamBadge}
              awayTeamBadge={awayTeamBadge}
              homeLineup={homeLineup}
              awayLineup={awayLineup}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
