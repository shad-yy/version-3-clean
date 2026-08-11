"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { COMPETITION_RIGHTS, type CompetitionRights } from "@/lib/data/broadcast-rights"

/**
 * Homepage demo of the one question this site exists to answer:
 * "which channel, in my country, at what local time."
 *
 * Design constraints, deliberately:
 *
 *  1. NO VIDEO. A hero video is the most common way to blow the LCP ≤ 2.5s
 *     threshold, and generative football footage reads as fake to an audience
 *     that watches the real thing weekly. This is a few KB of DOM instead.
 *
 *  2. EVERY LISTING IS ALWAYS IN THE DOM. The cycling highlight is a purely
 *     visual emphasis layer — nothing is mounted or unmounted, nothing is
 *     hidden from crawlers or screen readers. That keeps the whole block
 *     server-rendered and indexable, which is the actual SEO value here.
 *
 *  3. NO FRAMER MOTION. CSS transitions only, so there is no hydration
 *     mismatch surface and no mount guard needed (.cursorrules §2).
 *
 *  4. REDUCED MOTION IS RESPECTED. Users who ask for less motion get the
 *     static list, which is the same information.
 *
 * Times are formatted from a FIXED ISO string with an explicit IANA timezone,
 * so server and client always produce the same output.
 */

const CYCLE_MS = 2600

function formatLocalKickoff(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
      hour12: false,
    }).format(new Date(iso))
  } catch {
    // Unknown timezone or bad date — show nothing rather than a wrong time.
    return ""
  }
}

function CompetitionCard({
  competition,
  activeIndex,
  animate,
}: {
  competition: CompetitionRights
  activeIndex: number
  animate: boolean
}) {
  return (
    <article className="flex-1 min-w-0 rounded-2xl border border-[#2a2a3a] bg-[#12121a] p-5 md:p-6">
      <header className="mb-5">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h3 className="text-lg font-bold text-white truncate">{competition.name}</h3>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-gray-500">
            {competition.sampleFixture}
          </span>
        </div>
        <p className="text-xs text-gray-500">Same match. Different country. Different channel.</p>
      </header>

      <ul className="space-y-2">
        {competition.listings.map((listing, i) => {
          const isActive = animate && i === activeIndex
          const localTime = formatLocalKickoff(competition.sampleKickoff, listing.timeZone)

          return (
            <li
              key={listing.country}
              aria-current={isActive ? "true" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-500 motion-reduce:transition-none",
                isActive
                  ? "border-[#00e676]/50 bg-[#00e676]/[0.07] shadow-[0_0_24px_-8px_rgba(0,230,118,0.5)]"
                  : "border-transparent bg-white/[0.02]",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-lg leading-none shrink-0">
                {listing.flag}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white truncate">
                  {listing.broadcaster}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {listing.countryName}
                  {listing.streamingOn ? ` · ${listing.streamingOn}` : ""}
                </span>
              </span>

              {localTime && (
                <span
                  className={[
                    "shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs tabular-nums transition-colors duration-500 motion-reduce:transition-none",
                    isActive ? "bg-[#00e676] text-black font-bold" : "bg-white/5 text-gray-400",
                  ].join(" ")}
                >
                  {localTime}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <Link
        href={competition.href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00e676] hover:text-[#00ff87] transition-colors"
      >
        {competition.name} TV guide
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

export function BroadcastResolver({
  competitions = COMPETITION_RIGHTS,
}: {
  competitions?: CompetitionRights[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Only animate once mounted, and only if the user has not asked for reduced motion.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (query.matches) return

    setAnimate(true)

    const longest = competitions.reduce((n, c) => Math.max(n, c.listings.length), 0)
    if (longest < 2) return

    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % longest)
    }, CYCLE_MS)

    return () => clearInterval(id)
  }, [competitions])

  if (competitions.length === 0) return null

  return (
    <section
      aria-labelledby="broadcast-resolver-heading"
      className="py-16 md:py-20 border-t border-[#1a1a2a] bg-[#0a0a0f]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e676] mb-3">
            Where to watch
          </p>
          <h2
            id="broadcast-resolver-heading"
            className="text-3xl md:text-4xl font-extrabold text-white mb-3"
          >
            The match is on. But on what channel, where you are?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Scores are everywhere. The harder question is which broadcaster holds the rights in
            your country, and what time it actually kicks off locally. That is what we publish —
            for every competition we cover.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              activeIndex={activeIndex}
              animate={animate}
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-600">
          Broadcast rights shown at competition level and checked against the rights holders.
          Individual fixtures can move — always confirm with the broadcaster before kick-off.
        </p>
      </div>
    </section>
  )
}
