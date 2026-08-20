"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

const ALWAYS_ON = [
  {
    title: "Premier League",
    sub: "Fixtures, table & TV listings",
    href: "/watch/premier-league",
    badge: "/leagues/premier-league.png",
    color: "#3d0099",
  },
  {
    title: "Champions League",
    sub: "League phase & knockout guide",
    href: "/watch/champions-league",
    badge: "/leagues/champions-league.png",
    color: "#001489",
  },
  {
    title: "UFC Fight Nights",
    sub: "Fight cards & UK start times",
    href: "/ufc",
    badge: "/leagues/ufc.png",
    color: "#cc0000",
  },
  {
    title: "Formula 1 2026",
    sub: "Every race, no ad breaks",
    href: "/watch/formula-1",
    badge: "/leagues/formula-1.png",
    color: "#e10600",
  },
  {
    title: "World Cup 2026",
    sub: "Live now — all 104 matches",
    href: "/watch/world-cup-2026",
    badge: "/leagues/world-cup.png",
    color: "#004d00",
  },
]

export function LiveNowBanner() {
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % ALWAYS_ON.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [mounted])

  return (
    <div className="bg-gradient-to-r from-[var(--sl-ground)] via-[var(--sl-panel)] to-[var(--sl-ground)] border-y border-[var(--sl-raise)] 
      py-4 overflow-hidden relative">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--sl-amber)]/3 via-transparent to-[var(--sl-amber)]/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Live indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex 
                h-full w-full rounded-full bg-[var(--sl-amber)] opacity-75"/>
              <span className="relative inline-flex rounded-full 
                h-2.5 w-2.5 bg-[var(--sl-amber)]"/>
            </span>
            <span className="text-[var(--sl-amber)] font-extrabold 
              text-xs uppercase tracking-widest">
              Live
            </span>
          </div>

          <div className="h-5 w-px bg-[var(--sl-line)]" />

          {/* Rotating content */}
          <div className="flex-1 overflow-hidden h-7 relative">
            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 absolute inset-0"
                >
                  <img
                    src={ALWAYS_ON[current].badge}
                    alt={ALWAYS_ON[current].title}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                  <Link
                    href={ALWAYS_ON[current].href}
                    className="text-sl-text font-bold text-sm 
                      hover:text-[var(--sl-amber)] transition-colors"
                  >
                    {ALWAYS_ON[current].title}
                  </Link>
                  <span className="text-sl-mute text-xs hidden sm:block">
                    — {ALWAYS_ON[current].sub}
                  </span>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center gap-3 absolute inset-0">
                <img
                  src={ALWAYS_ON[0].badge}
                  alt={ALWAYS_ON[0].title}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain flex-shrink-0"
                />
                <Link
                  href={ALWAYS_ON[0].href}
                  className="text-sl-text font-bold text-sm hover:text-[var(--sl-amber)] transition-colors"
                >
                  {ALWAYS_ON[0].title}
                </Link>
                <span className="text-sl-mute text-xs hidden sm:block">
                  — {ALWAYS_ON[0].sub}
                </span>
              </div>
            )}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {ALWAYS_ON.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300
                  ${i === current 
                    ? 'bg-[var(--sl-amber)] w-4' 
                    : 'bg-[var(--sl-line)] w-1.5 hover:bg-[var(--sl-line)]'
                  }`}
                aria-label={`Show ${ALWAYS_ON[i].title}`}
              />
            ))}
          </div>

          {/* CTA */}
          <Link href="/watch/premier-league"
            className="hidden sm:flex flex-shrink-0 items-center 
              gap-1.5 bg-[var(--sl-amber)] text-black font-bold text-xs 
              px-5 py-2 rounded-lg hover:bg-[var(--sl-amber-hover)] 
              transition-all duration-300 touch-manipulation">
            TV Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
