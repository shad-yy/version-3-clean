"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Descriptive only. Do not add unverifiable quantitative claims here — any number
// shown to users must be derived from live data, not hardcoded.
const STATS = [
  "Live scores across Europe's major football leagues",
  "Real-time scores: Premier League · Champions League · UFC · F1",
  "Official UK TV listings for every televised fixture",
  "Instant lineups and head-to-head records",
  "Broadcast schedules sourced from the official rights holders",
  "Football, UFC and Formula 1 — fixtures, results and standings",
]

export function LiveStats() {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % STATS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [mounted])

  return (
    <div className="flex items-center justify-center gap-2
      bg-[var(--sl-surface)] border border-[var(--sl-line)] rounded-full
      px-4 py-2 overflow-hidden max-w-sm mx-auto">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--sl-amber)]
        flex-shrink-0 animate-pulse" />
      <div className="h-4 overflow-hidden relative flex-1">
        {mounted ? (
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-sl-mid text-center
              font-medium whitespace-nowrap"
            >
              {STATS[index]}
            </motion.p>
          </AnimatePresence>
        ) : (
          <p className="text-[11px] text-sl-mid text-center font-medium whitespace-nowrap">
            {STATS[0]}
          </p>
        )}
      </div>
    </div>
  )
}
