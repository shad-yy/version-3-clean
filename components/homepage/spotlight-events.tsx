"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Clock, Zap, ArrowRight } from "lucide-react"

interface SpotlightEvent {
  idEvent: string
  strEvent: string
  strHomeTeam: string | null
  strAwayTeam: string | null
  strHomeTeamBadge: string | null
  strAwayTeamBadge: string | null
  intHomeScore: string | null
  intAwayScore: string | null
  strLeague: string
  idLeague: string | null
  strSport: string
  strDate: string
  strTime: string
  strVenue: string | null
  strThumb: string | null
  strPoster: string | null
  strBanner: string | null
  strFanart: string | null
  importanceScore: number
  eventStatus: 'live' | 'upcoming' | 'tonight' | 'tomorrow'
  countdown: string
}

const LEAGUE_BADGES: Record<string, string> = {
  "4328": "/leagues/premier-league.png",
  "4335": "/leagues/la-liga.png",
  "4331": "/leagues/bundesliga.png",
  "4332": "/leagues/serie-a.png",
  "4334": "/leagues/ligue-1.png",
  "4480": "/leagues/champions-league.png",
}

function safeBadge(url: string | null | undefined): string | null {
  if (!url) return null
  if (/\/(tiny|small|medium|large|preview)$/.test(url)) return url
  return `${url}/small`
}

function getEventImage(event: SpotlightEvent): string | null {
  return event.strBanner || event.strThumb || event.strFanart || event.strPoster || null
}

function getStatusConfig(status: SpotlightEvent['eventStatus']) {
  switch (status) {
    case 'live':
      return {
        label: 'LIVE',
        dotColor: 'bg-red-500',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/40',
        pulse: true,
      }
    case 'upcoming':
      return {
        label: 'STARTING SOON',
        dotColor: 'bg-emerald-400',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/40',
        pulse: true,
      }
    case 'tonight':
      return {
        label: 'TONIGHT',
        dotColor: 'bg-amber-400',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/40',
        pulse: false,
      }
    case 'tomorrow':
      return {
        label: 'TOMORROW',
        dotColor: 'bg-blue-400',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/40',
        pulse: false,
      }
  }
}

function getTeamInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
}
function getBgColor(name: string | null) {
  if (!name) return 'hsl(220, 20%, 20%)'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash) % 360}, 50%, 25%)`
}

function formatTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return 'TBD'
  try {
    const timePart = timeStr.split('+')[0].split('-')[0]
    const date = new Date(`${dateStr}T${timePart}Z`)
    if (isNaN(date.getTime())) return 'TBD'
    // Visitor's timezone, not London's — see components/homepage/match-card.tsx.
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return 'TBD'
  }
}

// Skeleton loading card
function SpotlightSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-[#1a1a2a] bg-[#12121a] ${
        featured ? 'md:col-span-2 md:row-span-2 min-h-[320px] md:min-h-[400px]' : 'min-h-[200px] md:min-h-[200px]'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
      <div className="absolute inset-0 animate-pulse">
        <div className="absolute top-4 left-4 w-20 h-6 rounded-full bg-gray-800" />
        <div className="absolute top-4 right-4 w-6 h-6 rounded bg-gray-800" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-800" />
            <div className="w-8 h-4 rounded bg-gray-800" />
            <div className="w-12 h-12 rounded-full bg-gray-800" />
          </div>
          <div className="h-4 w-48 mx-auto rounded bg-gray-800 mb-2" />
          <div className="h-3 w-32 mx-auto rounded bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

// Individual spotlight card
function SpotlightCard({
  event,
  featured = false,
  index = 0,
}: {
  event: SpotlightEvent
  featured?: boolean
  index?: number
}) {
  const statusConfig = getStatusConfig(event.eventStatus)
  const eventImage = getEventImage(event)
  const homeBadge = safeBadge(event.strHomeTeamBadge)
  const awayBadge = safeBadge(event.strAwayTeamBadge)
  const leagueBadge = event.idLeague ? LEAGUE_BADGES[event.idLeague] : null
  const kickoffTime = formatTime(event.strDate, event.strTime)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`spotlight-card group relative rounded-2xl overflow-hidden border border-[#1a1a2a] cursor-pointer transition-all duration-500 ${
        featured
          ? 'md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[380px]'
          : 'min-h-[180px] md:min-h-[200px]'
      }`}
    >
      <Link href="/watch/premier-league" className="absolute inset-0 z-20" aria-label={`Broadcast guide for ${event.strEvent}`} />

      {/* Background Image or Gradient */}
      {eventImage ? (
        <>
          <img
            src={eventImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#12121a] via-[#1a1a24] to-[#0a0a0f]">
          {/* Abstract pattern for cards without images */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>
      )}

      {/* Cinematic light leak for featured card */}
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-5">
        {/* Top Row: League badge + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {leagueBadge && (
              <img
                src={leagueBadge}
                alt={event.strLeague}
                className="w-5 h-5 object-contain"
                loading="lazy"
              />
            )}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[120px]">
              {event.strLeague}
            </span>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor} backdrop-blur-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${statusConfig.pulse ? 'animate-pulse shadow-[0_0_6px_currentColor]' : ''}`} />
            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${statusConfig.textColor}`}>
              {event.eventStatus === 'upcoming' && event.countdown
                ? event.countdown
                : statusConfig.label}
            </span>
          </div>
        </div>

        {/* Bottom: Teams + CTA */}
        <div>
          {/* Teams */}
          <div className={`flex items-center justify-center ${featured ? 'gap-6 md:gap-8 mb-4' : 'gap-4 mb-3'}`}>
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <div
                className={`${featured ? 'w-14 h-14 md:w-16 md:h-16' : 'w-10 h-10'} rounded-full bg-[#1a1a24]/80 border border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm`}
                style={{ backgroundColor: !homeBadge ? getBgColor(event.strHomeTeam) : undefined }}
              >
                {homeBadge ? (
                  <img
                    src={homeBadge}
                    alt={event.strHomeTeam || ""}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      if (t.parentElement) {
                        t.parentElement.innerHTML = `<span class="text-[10px] font-bold text-white">${getTeamInitials(event.strHomeTeam)}</span>`
                        t.parentElement.style.backgroundColor = getBgColor(event.strHomeTeam)
                      }
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white">{getTeamInitials(event.strHomeTeam)}</span>
                )}
              </div>
              <span className={`${featured ? 'text-xs md:text-sm' : 'text-[10px]'} text-white font-bold mt-1.5 text-center max-w-[80px] md:max-w-[100px] truncate`}>
                {event.strHomeTeam}
              </span>
            </div>

            {/* VS / Score */}
            <div className="flex flex-col items-center">
              {event.eventStatus === 'live' && event.intHomeScore !== null ? (
                <div className="flex items-center gap-2">
                  <span className={`${featured ? 'text-2xl md:text-3xl' : 'text-xl'} font-black text-white`}>{event.intHomeScore}</span>
                  <span className="text-gray-500 font-bold">-</span>
                  <span className={`${featured ? 'text-2xl md:text-3xl' : 'text-xl'} font-black text-white`}>{event.intAwayScore}</span>
                </div>
              ) : (
                <span className={`${featured ? 'text-sm md:text-base' : 'text-xs'} text-gray-500 font-bold`}>VS</span>
              )}
              <span className="text-[10px] text-gray-500 mt-0.5">{kickoffTime}</span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center">
              <div
                className={`${featured ? 'w-14 h-14 md:w-16 md:h-16' : 'w-10 h-10'} rounded-full bg-[#1a1a24]/80 border border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm`}
                style={{ backgroundColor: !awayBadge ? getBgColor(event.strAwayTeam) : undefined }}
              >
                {awayBadge ? (
                  <img
                    src={awayBadge}
                    alt={event.strAwayTeam || ""}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      if (t.parentElement) {
                        t.parentElement.innerHTML = `<span class="text-[10px] font-bold text-white">${getTeamInitials(event.strAwayTeam)}</span>`
                        t.parentElement.style.backgroundColor = getBgColor(event.strAwayTeam)
                      }
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white">{getTeamInitials(event.strAwayTeam)}</span>
                )}
              </div>
              <span className={`${featured ? 'text-xs md:text-sm' : 'text-[10px]'} text-white font-bold mt-1.5 text-center max-w-[80px] md:max-w-[100px] truncate`}>
                {event.strAwayTeam}
              </span>
            </div>
          </div>

          {/* Venue */}
          {featured && event.strVenue && (
            <p className="text-center text-[10px] text-gray-500 mb-3 truncate">
              📍 {event.strVenue}
            </p>
          )}

          {/* Watch CTA */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 ${featured ? 'px-5 py-2' : 'px-3 py-1.5'} rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300`}>
              {event.eventStatus === 'live' ? (
                <>
                  <Zap className="w-3 h-3" />
                  Live Guide
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  Where to Watch
                </>
              )}
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SpotlightEvents() {
  const [events, setEvents] = useState<SpotlightEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpotlight() {
      try {
        const res = await fetch('/api/spotlight')
        if (res.ok) {
          const data = await res.json()
          setEvents(data.spotlight || [])
        }
      } catch (error) {
        console.error('Failed to load spotlight events', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpotlight()
  }, [])

  if (!loading && events.length === 0) return null

  const featured = events[0]
  const secondary = events.slice(1, 3)

  return (
    <section className="relative py-12 md:py-16 bg-[#0a0a0f] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400">
                Spotlight
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              What&apos;s Hot Right Now
            </h2>
          </div>
          <Link
            href="/scores"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            All Fixtures
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
            <SpotlightSkeleton featured />
            <SpotlightSkeleton />
            <SpotlightSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
            {/* Featured Card (large, left) */}
            {featured && (
              <SpotlightCard event={featured} featured index={0} />
            )}

            {/* Secondary Cards (right column, stacked) */}
            {secondary.map((event, i) => (
              <SpotlightCard key={event.idEvent} event={event} index={i + 1} />
            ))}
          </div>
        )}

        {/* Mobile "See All" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/scores"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            See All Fixtures
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
