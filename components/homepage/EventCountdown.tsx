"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

interface CountdownEvent {
  name: string
  date: Date
  href: string
  sport: string
  badge: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Knockout fixtures during World Cup 2026 — used when live APIs have no near-term event. */
const WORLD_CUP_KNOCKOUT: CountdownEvent[] = [
  {
    name: 'Canada vs Morocco — Round of 16',
    date: new Date('2026-07-04T18:00:00+01:00'),
    href: '/blog/watch-morocco-canada-world-cup-2026-uk',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'France vs Paraguay — Round of 16',
    date: new Date('2026-07-04T22:00:00+01:00'),
    href: '/blog/watch-france-paraguay-world-cup-2026-uk',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'Brazil vs Norway — Round of 16',
    date: new Date('2026-07-05T21:00:00+01:00'),
    href: '/blog/watch-brazil-norway-world-cup-2026-uk',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'Mexico vs England — Round of 16',
    date: new Date('2026-07-06T01:00:00+01:00'),
    href: '/blog/watch-england-mexico-world-cup-2026-uk',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'Portugal vs Spain — Round of 16',
    date: new Date('2026-07-06T20:00:00+01:00'),
    href: '/blog/watch-portugal-spain-world-cup-2026-uk',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'USA vs Belgium — Round of 16',
    date: new Date('2026-07-07T01:00:00+01:00'),
    href: '/watch/world-cup-2026',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'Argentina vs Egypt — Round of 16',
    date: new Date('2026-07-07T17:00:00+01:00'),
    href: '/watch/world-cup-2026',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
  {
    name: 'Switzerland vs Colombia — Round of 16',
    date: new Date('2026-07-07T21:00:00+01:00'),
    href: '/watch/world-cup-2026',
    sport: 'World Cup',
    badge: '/leagues/world-cup.png',
  },
]

function nextWorldCupKnockout(): CountdownEvent | null {
  const now = Date.now()
  const upcoming = WORLD_CUP_KNOCKOUT.find(e => e.date.getTime() > now)
  return upcoming ?? null
}

export function EventCountdown() {
  const [upcomingEvent, setUpcomingEvent] = useState<CountdownEvent | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch upcoming events from our API
  useEffect(() => {
    const loadEvent = async () => {
      // World Cup knockout stage takes priority during live tournament
      const wcEvent = nextWorldCupKnockout()
      if (wcEvent) {
        setUpcomingEvent(wcEvent)
        setLoading(false)
        return
      }

      try {
        // Try UFC first
        const ufcRes = await fetch('/api/espn/mma/ufc/scoreboard', {
          cache: 'no-store',
        }).catch(() => null)

        if (ufcRes?.ok) {
          const data = await ufcRes.json()
          const events = data?.events || []
          const upcoming = events.find((e: any) => {
            if (e.status?.type?.completed) return false
            if (!e.date) return false
            const d = new Date(e.date)
            // Only show if within 14 days
            const daysAway = (d.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
            return daysAway > 0 && daysAway <= 14
          })

          if (upcoming) {
            setUpcomingEvent({
              name: upcoming.name || upcoming.shortName || 'UFC Event',
              date: new Date(upcoming.date),
              href: '/ufc',
              sport: 'UFC',
              badge: '/leagues/ufc.png',
            })
            setLoading(false)
            return
          }
        }

        // Try F1 next
        const f1Res = await fetch('/api/espn/racing/f1/scoreboard', {
          cache: 'no-store',
        }).catch(() => null)

        if (f1Res?.ok) {
          const data = await f1Res.json()
          const events = data?.events || []
          const upcoming = events.find((e: any) => {
            if (e.status?.type?.completed) return false
            if (!e.date) return false
            const d = new Date(e.date)
            const daysAway = (d.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
            return daysAway > 0 && daysAway <= 14
          })

          if (upcoming) {
            setUpcomingEvent({
              name: upcoming.shortName || upcoming.name || 'F1 Race',
              date: new Date(upcoming.date),
              href: '/watch/formula-1',
              sport: 'F1',
              badge: '/leagues/formula-1.png',
            })
            setLoading(false)
            return
          }
        }
      } catch {
        // No live API event found
      }
      setLoading(false)
    }

    loadEvent()
  }, [])

  // Countdown ticker
  useEffect(() => {
    if (!upcomingEvent) return
    const tick = () => setTimeLeft(getTimeLeft(upcomingEvent.date))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [upcomingEvent])

  // Don't render if no upcoming event within 14 days
  if (loading || !upcomingEvent || !timeLeft) return null

  return (
    <div className="bg-gradient-to-r from-[#1a0000] 
      via-[#0d0d14] to-[#001a00] border-y border-[#2a2a3a] 
      py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between 
          gap-4 flex-wrap">
          
          {/* Event info */}
          <div className="flex items-center gap-3">
            <img
              src={upcomingEvent.badge}
              alt={upcomingEvent.sport}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-[10px] font-bold text-gray-500 
                uppercase tracking-widest">
                {upcomingEvent.sport} — Coming Soon
              </p>
              <p className="text-white font-extrabold text-sm">
                {upcomingEvent.name}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Sec' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="bg-[#12121a] border 
                  border-[#2a2a3a] rounded-xl px-3 py-1.5 
                  min-w-[48px]">
                  <span className="text-white font-extrabold 
                    text-xl tabular-nums">
                    {pad(value)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-600 
                  font-medium mt-0.5 block">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link href={upcomingEvent.href}
            className="flex-shrink-0 bg-[#00e676] 
              text-black font-bold text-xs px-5 py-2.5 
              rounded-xl hover:bg-[#00ff87] transition-all 
              touch-manipulation hidden sm:block">
            TV Guide →
          </Link>
        </div>
      </div>
    </div>
  )
}
