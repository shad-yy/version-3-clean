import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { EventDetailsTabs } from "@/components/events/event-details-tabs"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import type { SportsDbEvent } from "@/lib/types"
import { Calendar, Clock, MapPin, Trophy, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"

interface EventPageProps {
  params: {
    id: string
  }
}

async function getEventData(id: string) {
  try {
    const unifiedEvent = await unifiedSportsAPI.getFixture(id)
    return { unifiedEvent, sportsDbEvent: null as SportsDbEvent | null }
  } catch (error) {
    console.error("Error fetching event data:", error)
    return null
  }
}

function EventLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-sl-ground pt-20">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Skeleton className="h-4 w-24 mb-8 bg-white/5" />
        <div className="rounded-3xl border border-white/10 bg-white/3 p-8 mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-4 w-40 bg-white/8" />
            <Skeleton className="h-6 w-20 rounded-full bg-white/8" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full bg-white/8" />
              <Skeleton className="h-5 w-32 bg-white/8" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-12 w-28 bg-white/8" />
              <Skeleton className="h-4 w-16 rounded-full bg-white/8" />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full bg-white/8" />
              <Skeleton className="h-5 w-32 bg-white/8" />
            </div>
          </div>
        </div>
        <Skeleton className="h-96 rounded-3xl bg-white/3" />
      </div>
    </main>
  )
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusStyle(status: string, isLive: boolean) {
  if (isLive) return { bg: "bg-red-500/15 border-red-500/30 text-red-400", dot: "bg-red-400 animate-pulse" }
  const l = status.toLowerCase()
  if (l.includes("finish") || l === "ft") return { bg: "bg-white/8 border-white/10 text-white/50", dot: null }
  if (l.includes("schedul") || l === "ns") return { bg: "bg-blue-500/10 border-blue-500/20 text-blue-400", dot: null }
  return { bg: "bg-white/8 border-white/10 text-white/60", dot: null }
}

function formatEventDate(date: string, time: string) {
  try {
    const d = new Date(`${date}T${time || "00:00"}`)
    if (isNaN(d.getTime())) throw new Error()
    return {
      weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }
  } catch {
    return { weekday: "", date: date, time: time }
  }
}

// ─── Team panel ───────────────────────────────────────────────────────────────

function TeamPanel({
  name,
  logo,
  side,
  isWinner,
}: {
  name: string
  logo?: string | null
  side: "home" | "away"
  isWinner?: boolean
}) {
  const align = side === "home" ? "items-start md:items-end text-left md:text-right" : "items-end md:items-start text-right md:text-left"
  return (
    <div className={`flex flex-col gap-3 ${align}`}>
      {logo ? (
        <div className={`relative ${side === "away" ? "md:order-first" : ""}`}>
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${isWinner ? "bg-emerald-400" : "bg-white/10"}`} />
          <OptimizedImage
            src={logo}
            alt={`${name} logo`}
            width={80}
            height={80}
            className="relative w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
          />
        </div>
      ) : (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-white/20" />
        </div>
      )}
      <div>
        <h2 className={`text-lg md:text-xl font-bold leading-tight ${isWinner ? "text-white" : "text-white/80"}`}>
          {name}
        </h2>
        <p className="text-xs text-white/30">{side === "home" ? "Home" : "Away"}</p>
      </div>
    </div>
  )
}

// ─── Score display ────────────────────────────────────────────────────────────

function ScoreDisplay({
  homeScore,
  awayScore,
  status,
  isLive,
  date,
  time,
}: {
  homeScore: number | null
  awayScore: number | null
  status: string
  isLive: boolean
  date: string
  time: string
}) {
  const { bg, dot } = getStatusStyle(status, isLive)
  const formatted = formatEventDate(date, time)

  if (homeScore !== null && awayScore !== null) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Status badge */}
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${bg}`}>
          {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
          {isLive ? "LIVE" : status.toUpperCase()}
        </span>

        {/* Score */}
        <div className="flex items-center gap-3">
          <span className="text-5xl md:text-6xl font-black tabular-nums text-white">{homeScore}</span>
          <span className="text-2xl text-white/20 font-light pb-1">—</span>
          <span className="text-5xl md:text-6xl font-black tabular-nums text-white">{awayScore}</span>
        </div>

        {formatted.date && (
          <p className="text-xs text-white/30 text-center">{formatted.weekday}, {formatted.date}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${bg}`}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
        {status.toUpperCase()}
      </span>
      <div className="text-center">
        <p className="text-3xl font-light text-white/20 mb-1">vs</p>
        {formatted.time && (
          <div className="flex items-center gap-1.5 justify-center text-white/60 text-sm font-semibold">
            <Clock className="w-3.5 h-3.5" />
            {formatted.time}
          </div>
        )}
        {formatted.date && (
          <p className="text-xs text-white/25 mt-1">{formatted.weekday}, {formatted.date}</p>
        )}
      </div>
    </div>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function EventPage({ params }: EventPageProps) {
  const eventData = await getEventData(params.id)

  if (!eventData?.unifiedEvent) {
    notFound()
  }

  const { unifiedEvent, sportsDbEvent } = eventData
  const { bg } = getStatusStyle(unifiedEvent.status, unifiedEvent.isLive)

  // Determine winner
  const homeWins =
    unifiedEvent.homeScore !== null &&
    unifiedEvent.awayScore !== null &&
    unifiedEvent.homeScore > unifiedEvent.awayScore
  const awayWins =
    unifiedEvent.homeScore !== null &&
    unifiedEvent.awayScore !== null &&
    unifiedEvent.awayScore > unifiedEvent.homeScore

  const formattedDate = formatEventDate(unifiedEvent.date, unifiedEvent.time)

  return (
    <main className="min-h-screen bg-sl-ground pt-20">
      {/* The fixture was only ever expressed as two separate h2s, so the document had
          no h1 and nothing named its subject. Hidden visually because the scoreboard
          below presents it far more clearly than a line of text would. */}
      <h1 className="sr-only">
        {unifiedEvent.homeTeam} v {unifiedEvent.awayTeam}
        {unifiedEvent.league ? ` — ${unifiedEvent.league}` : ""}
      </h1>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[500px] bg-blue-500/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pb-16 max-w-4xl">

        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 py-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Events
          </Link>
          <span className="text-white/15">/</span>
          <span className="text-sm text-white/30 truncate max-w-[200px]">
            {unifiedEvent.homeTeam} vs {unifiedEvent.awayTeam}
          </span>
        </div>

        {/* ── Event hero card ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm mb-6">
          {/* Live gradient overlay */}
          {unifiedEvent.isLive && (
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
          )}

          <div className="p-6 md:p-10">
            {/* League + date header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white/30" />
                <span className="text-sm font-medium text-white/50">{unifiedEvent.league}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${bg}`}>
                  {unifiedEvent.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                  {unifiedEvent.isLive ? "LIVE" : unifiedEvent.status}
                </span>
              </div>
            </div>

            {/* Teams + score */}
            <div className="grid grid-cols-3 items-center gap-4 md:gap-8">
              <TeamPanel
                name={unifiedEvent.homeTeam}
                logo={unifiedEvent.homeLogo}
                side="home"
                isWinner={homeWins}
              />

              <ScoreDisplay
                homeScore={unifiedEvent.homeScore}
                awayScore={unifiedEvent.awayScore}
                status={unifiedEvent.status}
                isLive={unifiedEvent.isLive}
                date={unifiedEvent.date}
                time={unifiedEvent.time}
              />

              <TeamPanel
                name={unifiedEvent.awayTeam}
                logo={unifiedEvent.awayLogo}
                side="away"
                isWinner={awayWins}
              />
            </div>

            {/* Meta row: venue + date */}
            {(unifiedEvent.venue || formattedDate.date) && (
              <div className="mt-8 pt-5 border-t border-white/8 flex flex-wrap items-center justify-center gap-5 text-sm text-white/35">
                {unifiedEvent.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {unifiedEvent.venue}
                  </span>
                )}
                {formattedDate.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate.date}
                    {formattedDate.time && ` · ${formattedDate.time}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stream CTA ────────────────────────────────────────────────── */}
        {(unifiedEvent.isLive || unifiedEvent.status.toLowerCase().includes("schedul")) && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <div>
              <p className="font-semibold text-emerald-400 text-sm">
                {unifiedEvent.isLive ? "This match is live now!" : "Upcoming match"}
              </p>
              <p className="text-white/40 text-xs">Live score, lineups and official broadcast listing</p>
            </div>
            <Link
              href="/scores"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all"
            >
              <Zap className="w-4 h-4" /> Live Scores
            </Link>
          </div>
        )}

        {/* ── Details tabs ──────────────────────────────────────────────── */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl bg-white/3" />}>
          <EventDetailsTabs
            event={{
              id: params.id,
              homeTeam: unifiedEvent.homeTeam,
              awayTeam: unifiedEvent.awayTeam,
              homeLogo: unifiedEvent.homeLogo ?? undefined,
              awayLogo: unifiedEvent.awayLogo ?? undefined,
            }}
            additionalInfo={sportsDbEvent}
          />
        </Suspense>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: EventPageProps) {
  const eventData = await getEventData(params.id)

  if (!eventData?.unifiedEvent) {
    return {
      title: "Event Not Found - Sightline",
      description: "The requested event could not be found.",
    }
  }

  const { unifiedEvent } = eventData

  return {
    title: `${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam} – ${unifiedEvent.league} | Sightline`,
    description: `Live coverage and match details for ${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam} in ${unifiedEvent.league}. Watch live on Sightline.`,
    openGraph: {
      title: `${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam}`,
      description: `${unifiedEvent.league} match details and live coverage`,
      images: unifiedEvent.homeLogo ? [unifiedEvent.homeLogo] : undefined,
    },
  }
}
