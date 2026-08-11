"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

/* ------------------------------------------------------------------ */
/*  Shared fixture data — mirrors EventCountdown.tsx                  */
/*  During World Cup 2026 knockout stage these are the live fixtures.  */
/* ------------------------------------------------------------------ */

interface LiveFixture {
  name: string
  /** ISO date string */
  date: string
  /** BST channel label */
  channel: string
  href: string
}

const KNOCKOUT_FIXTURES: LiveFixture[] = [
  { name: "World Cup Third-Place Play-off", date: "2026-07-18T20:00:00+01:00", channel: "BBC One / ITV1", href: "/watch/world-cup-2026" },
  { name: "Spain vs Argentina (World Cup Final)", date: "2026-07-19T20:00:00+01:00", channel: "ITV1 & ITVX", href: "/watch/world-cup-2026" },
]

type MatchState = "pre" | "live" | null

interface ActiveMatch {
  fixture: LiveFixture
  state: MatchState
  minutesUntil: number
}

/** Find the most relevant match: live (within 2.5h of kickoff) or imminent (within 4h before). */
function getActiveMatch(): ActiveMatch | null {
  const now = Date.now()

  for (const fixture of KNOCKOUT_FIXTURES) {
    const kickoff = new Date(fixture.date).getTime()
    const diff = kickoff - now
    const minutesUntil = diff / 60_000

    // Currently live — within 150 min (2.5h) after kickoff to cover extra time + penalties
    if (minutesUntil <= 0 && minutesUntil > -150) {
      return { fixture, state: "live", minutesUntil }
    }

    // Pre-match — within 4 hours before kickoff
    if (minutesUntil > 0 && minutesUntil <= 240) {
      return { fixture, state: "pre", minutesUntil }
    }
  }

  return null
}

function formatCountdown(minutes: number): string {
  if (minutes < 1) return "Kick-off now"
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h > 0) return `${h}h ${m}m to kick-off`
  return `${m}m to kick-off`
}

export function LiveEventFloat() {
  // Hydration guard (.cursorrules §2): Framer Motion must not initialise until the
  // client has mounted, otherwise SSR and hydration disagree and React can throw
  // "Failed to execute 'removeChild' on 'Node'" in production (Trouble Registry Bug 5).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [match, setMatch] = useState<ActiveMatch | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check immediately
    setMatch(getActiveMatch())

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      setMatch(getActiveMatch())
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  // Don't render on pages where it would be redundant
  useEffect(() => {
    if (typeof window === "undefined") return
    const path = window.location.pathname
    // Hide on the World Cup hub page itself — users are already there
    if (path === "/watch/world-cup-2026") {
      setDismissed(true)
    }
  }, [])

  if (!mounted || !match || dismissed) return null

  const isLive = match.state === "live"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-40 max-w-[340px]"
        id="live-event-float"
      >
        <div
          className={`
            relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md
            ${isLive
              ? "bg-gradient-to-br from-red-950/90 to-[#0a0a0f]/95 border-red-800/50 shadow-red-900/30"
              : "bg-gradient-to-br from-[#0d1a0d]/90 to-[#0a0a0f]/95 border-[#00e676]/20 shadow-green-900/20"
            }
          `}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full
              bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300
              flex items-center justify-center text-xs transition-colors z-10"
            aria-label="Dismiss live event indicator"
          >
            ×
          </button>

          <div className="p-4 pr-10">
            {/* Live / Pre badge */}
            <div className="flex items-center gap-2 mb-2">
              {isLive ? (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-400">
                    Live Now
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e676]" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00e676]">
                    Coming Up
                  </span>
                </span>
              )}
              <span className="text-[10px] text-gray-600 font-medium">
                World Cup 2026
              </span>
            </div>

            {/* Match name */}
            <p className="text-white font-extrabold text-sm leading-tight mb-1">
              {match.fixture.name}
            </p>

            {/* Status line */}
            <p className="text-gray-400 text-xs mb-3">
              {isLive
                ? `Live on ${match.fixture.channel}`
                : `${formatCountdown(match.minutesUntil)} — ${match.fixture.channel}`}
            </p>

            {/* CTA */}
            <Link
              href={match.fixture.href}
              className={`
                block w-full text-center font-bold text-xs py-2.5 rounded-xl
                transition-all touch-manipulation
                ${isLive
                  ? "bg-red-500 hover:bg-red-400 text-white"
                  : "bg-[#00e676] hover:bg-[#00ff87] text-black"
                }
              `}
            >
              {isLive ? "View Live TV Broadcast Guide" : "View TV Broadcast Guide"}
            </Link>
          </div>

          {/* Subtle animated gradient sweep */}
          <div
            className={`absolute inset-0 pointer-events-none opacity-[0.04] ${
              isLive ? "animate-pulse" : ""
            }`}
            style={{
              background: isLive
                ? "linear-gradient(135deg, transparent 40%, #ff1744 100%)"
                : "linear-gradient(135deg, transparent 40%, #00e676 100%)",
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
