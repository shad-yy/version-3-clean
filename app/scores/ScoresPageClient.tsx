"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Calendar, Trophy, Clock, RefreshCw, MapPin, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { UnifiedFixture } from "@/lib/api/unified-sports-api"

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function StatusPill({ status, isLive }: { status: string; isLive: boolean }) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> LIVE
      </span>
    )
  }
  const lower = status.toLowerCase()
  if (lower.includes("finish") || lower.includes("ft")) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
        FT
      </span>
    )
  }
  if (lower.includes("schedul") || lower.includes("ns")) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {status}
      </span>
    )
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
      {status}
    </span>
  )
}

function TeamLogo({ src, alt }: { src?: string | null; alt: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        <Trophy className="w-4 h-4 text-white/20" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-9 h-9 object-contain rounded-full flex-shrink-0 bg-white/5"
      onError={() => setErr(true)}
    />
  )
}

// ─── Single match card ────────────────────────────────────────────────────────

function MatchCard({ fixture }: { fixture: UnifiedFixture }) {
  const hasScore = fixture.homeScore !== null && fixture.awayScore !== null
  const isFinished = fixture.status.toLowerCase().includes("finish") || fixture.status.toLowerCase() === "ft"

  return (
    <Link
      href={`/events/${fixture.id}`}
      className="group relative flex items-center gap-4 px-5 py-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-200 overflow-hidden"
    >
      {/* Live glow */}
      {fixture.isLive && (
        <div className="absolute inset-0 rounded-xl bg-red-500/5 pointer-events-none" />
      )}

      {/* Home team */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <TeamLogo src={fixture.homeLogo} alt={fixture.homeTeam} />
        <span className={`font-semibold text-sm truncate ${hasScore && fixture.homeScore! > fixture.awayScore! ? "text-white" : "text-white/70"}`}>
          {fixture.homeTeam}
        </span>
      </div>

      {/* Score / Time */}
      <div className="flex flex-col items-center gap-1 px-4 flex-shrink-0 text-center min-w-[80px]">
        {hasScore ? (
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-extrabold tabular-nums ${isFinished ? "text-white/90" : "text-white"}`}>
              {fixture.homeScore}
            </span>
            <span className="text-white/20 text-lg font-bold">—</span>
            <span className={`text-2xl font-extrabold tabular-nums ${isFinished ? "text-white/90" : "text-white"}`}>
              {fixture.awayScore}
            </span>
          </div>
        ) : (
          <span className="text-white/40 text-sm font-medium">{fixture.time || "TBD"}</span>
        )}
        <StatusPill status={fixture.status} isLive={fixture.isLive} />
      </div>

      {/* Away team */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <span className={`font-semibold text-sm truncate text-right ${hasScore && fixture.awayScore! > fixture.homeScore! ? "text-white" : "text-white/70"}`}>
          {fixture.awayTeam}
        </span>
        <TeamLogo src={fixture.awayLogo} alt={fixture.awayTeam} />
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
    </Link>
  )
}

// ─── League group ─────────────────────────────────────────────────────────────

function LeagueGroup({ league, fixtures }: { league: string; fixtures: UnifiedFixture[] }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Trophy className="w-3.5 h-3.5 text-white/30" />
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{league}</span>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-white/25">{fixtures.length}</span>
      </div>
      <div className="space-y-2">
        {fixtures.map((f) => <MatchCard key={f.id} fixture={f} />)}
      </div>
    </div>
  )
}

// ─── Matches list with grouping ───────────────────────────────────────────────

function MatchesList({ fixtures }: { fixtures: UnifiedFixture[] }) {
  if (fixtures.length === 0) return null

  // Group by league
  const grouped = new Map<string, UnifiedFixture[]>()
  for (const f of fixtures) {
    const league = f.league || "Other"
    const bucket = grouped.get(league) ?? []
    bucket.push(f)
    grouped.set(league, bucket)
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([league, fxs]) => (
        <LeagueGroup key={league} league={league} fixtures={fxs} />
      ))}
    </div>
  )
}

// ─── Data fetching hook ───────────────────────────────────────────────────────

type Tab = "today" | "results"

function useScoresData(tab: Tab) {
  const [fixtures, setFixtures] = useState<UnifiedFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  // Cache per tab to avoid re-fetching on tab switch
  const cache = useRef<Partial<Record<Tab, UnifiedFixture[]>>>({})

  const fetchData = async (force = false) => {
    if (!force && cache.current[tab]) {
      setFixtures(cache.current[tab]!)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const url = tab === "today" ? "/api/scores/today" : "/api/scores/recent"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      const data: UnifiedFixture[] = Array.isArray(json.matches)
        ? json.matches
        : Array.isArray(json.data)
        ? json.data
        : []
      cache.current[tab] = data
      setFixtures(data)
      setLastFetched(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on tab change
  useEffect(() => { fetchData() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  return { fixtures, loading, error, lastFetched, refetch: () => fetchData(true) }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/8 bg-white/3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-white/8 flex-shrink-0" />
      <div className="flex-1 h-4 rounded-lg bg-white/8" />
      <div className="flex flex-col items-center gap-2 px-4 flex-shrink-0">
        <div className="w-16 h-6 rounded-lg bg-white/8" />
        <div className="w-10 h-4 rounded-full bg-white/8" />
      </div>
      <div className="flex-1 h-4 rounded-lg bg-white/8" />
      <div className="w-9 h-9 rounded-full bg-white/8 flex-shrink-0" />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScoresPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("today")
  const { fixtures, loading, error, lastFetched, refetch } = useScoresData(activeTab)

  const liveCount = fixtures.filter((f) => f.isLive).length

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "today",   label: "Today's Matches", icon: Calendar },
    { id: "results", label: "Recent Results",  icon: Trophy },
  ]

  return (
    <main className="min-h-screen bg-[var(--sl-ground)] pt-20">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-blue-500/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-500/4 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pb-16 max-w-3xl">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              {liveCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {liveCount} Live Now
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Scores &amp;{" "}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Results
                </span>
              </h1>
              <p className="text-white/40 mt-2 text-base">
                Real-time football scores, live match updates, and recent results.
              </p>
            </div>

            {/* Refresh + last updated */}
            <div className="flex items-center gap-3">
              {lastFetched && (
                <span className="text-xs text-white/25 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {lastFetched.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-white/10 text-white shadow-lg border border-white/15"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
            <p className="text-white/60 font-medium mb-1">Data temporarily unavailable</p>
            <p className="text-white/30 text-sm mb-6">Please try refreshing in a moment.</p>
            <button
              onClick={refetch}
              className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              Try Again
            </button>
          </div>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-20">
            {activeTab === "today" ? (
              <Calendar className="w-12 h-12 mx-auto mb-4 text-white/15" />
            ) : (
              <Trophy className="w-12 h-12 mx-auto mb-4 text-white/15" />
            )}
            <p className="text-white/50 font-medium mb-1">
              {activeTab === "today" ? "No matches scheduled today" : "No recent results available"}
            </p>
            <p className="text-white/25 text-sm">Check back later or explore upcoming events.</p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium"
            >
              <Zap className="w-4 h-4" /> Browse Events
            </Link>
          </div>
        ) : (
          <MatchesList fixtures={fixtures} />
        )}

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-white/20 mt-8">
          Data provided by TheSportsDB · Refreshes automatically every 30 seconds during live matches
        </p>
      </div>
    </main>
  )
}
