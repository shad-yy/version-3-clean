import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Trophy, Globe, Users, Calendar, Star, TrendingUp, Zap, ArrowRight, Shield } from "lucide-react"
import { unifiedSportsAPI, type UnifiedLeague } from "@/lib/api/unified-sports-api"
import { OptimizedImage } from "@/components/ui/optimized-image"

export const metadata: Metadata = {
  title: "Football Leagues – Live Standings & Fixtures | Sightline",
  description:
    "Explore the world's top football leagues: Premier League, La Liga, Bundesliga, Serie A, Ligue 1. Live standings, fixtures, and full match coverage.",
}

// ISR: revalidate every 24 hours — league metadata rarely changes
export const revalidate = 86400

// ─── Sport colour palette ────────────────────────────────────────────────────

const SPORT_GRADIENTS: Record<string, { card: string; glow: string; badge: string; accent: string }> = {
  Soccer: {
    card:   "from-emerald-950/60 to-emerald-900/30 border-emerald-500/20 hover:border-emerald-400/50",
    glow:   "bg-emerald-500/10",
    badge:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    accent: "text-emerald-400",
  },
  Basketball: {
    card:   "from-orange-950/60 to-orange-900/30 border-orange-500/20 hover:border-orange-400/50",
    glow:   "bg-orange-500/10",
    badge:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
    accent: "text-orange-400",
  },
  default: {
    card:   "from-blue-950/60 to-blue-900/30 border-blue-500/20 hover:border-blue-400/50",
    glow:   "bg-blue-500/10",
    badge:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
    accent: "text-blue-400",
  },
}

function getSportStyle(sport: string) {
  return SPORT_GRADIENTS[sport] ?? SPORT_GRADIENTS.default
}

// ─── Hero stat cards ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  colorClass: string
}) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-sm p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl ${colorClass}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/3 rounded-2xl" />
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  )
}

// ─── League card ─────────────────────────────────────────────────────────────

function LeagueCard({ league, featured }: { league: UnifiedLeague; featured?: boolean }) {
  const style = getSportStyle(league.sport)
  return (
    <Link
      href={`/leagues/${league.id}`}
      className={`group relative flex flex-col items-center text-center rounded-2xl border bg-gradient-to-br backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${style.card}`}
    >
      {/* Glow blob */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${style.glow}`} />

      {/* Featured ribbon */}
      {featured && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          <Star className="w-3 h-3" /> Top
        </span>
      )}

      {/* Logo */}
      <div className="relative w-20 h-20 mb-4 drop-shadow-lg">
        {league.logo ? (
          <OptimizedImage
            src={`${league.logo}/small`}
            alt={`${league.name} logo`}
            width={80}
            height={80}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-white/10 border border-white/10">
            <Shield className="w-8 h-8 text-white/50" />
          </div>
        )}
      </div>

      {/* Name & Country */}
      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight mb-1">
        {league.name}
      </h3>
      <div className={`flex items-center justify-center gap-1.5 text-sm mb-4 ${style.accent}`}>
        <Globe className="w-3.5 h-3.5" />
        <span>{league.country}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${style.badge}`}>{league.sport}</span>
        {league.formedYear && (
          <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/50">
            Est. {league.formedYear}
          </span>
        )}
      </div>

      {/* CTA arrow */}
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400">
        View Details <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
  count,
  accentClass = "text-blue-400",
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count?: number
  accentClass?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${accentClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      {count !== undefined && (
        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs text-white/60 font-medium">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
    </div>
  )
}

// ─── Main content (server component) ─────────────────────────────────────────

async function LeaguesContent() {
  let leagues: UnifiedLeague[] = []
  let error: string | null = null

  try {
    leagues = await unifiedSportsAPI.getLeagues()
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load leagues"
  }

  // Current season — calculated server-side so it's always correct
  const currentSeason = unifiedSportsAPI.getSeasonString()

  if (error) {
    return (
      <div className="text-center py-24">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-red-400/50" />
        <p className="text-red-400 font-semibold mb-2">Failed to load leagues</p>
        <p className="text-white/40 text-sm">{error}</p>
        <Link
          href="/leagues"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
        >
          Try Again
        </Link>
      </div>
    )
  }

  // Group by sport
  const leaguesBySport = new Map<string, UnifiedLeague[]>()
  for (const l of leagues) {
    const sport = l.sport || "Unknown"
    const bucket = leaguesBySport.get(sport) ?? []
    bucket.push(l)
    leaguesBySport.set(sport, bucket)
  }

  return (
    <div className="container mx-auto px-4 pb-16">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative text-center py-16 md:py-20 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-[300px] h-[200px] bg-blue-500/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" /> Live Season {currentSeason}
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Football
            </span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Leagues
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Explore the world's top football leagues — from Europe's elite competitions to emerging leagues worldwide.
            Live standings, fixtures, and full match coverage.
          </p>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <StatCard
          icon={Trophy}
          value={leagues.length}
          label="Leagues Covered"
          colorClass="from-blue-950/80 to-blue-900/40 border-blue-500/20 text-blue-300"
        />
        <StatCard
          icon={Globe}
          value={leaguesBySport.size}
          label="Sports Categories"
          colorClass="from-emerald-950/80 to-emerald-900/40 border-emerald-500/20 text-emerald-300"
        />
        <StatCard
          icon={Users}
          value="1000+"
          label="Teams Tracked"
          colorClass="from-purple-950/80 to-purple-900/40 border-purple-500/20 text-purple-300"
        />
        <StatCard
          icon={Calendar}
          value={currentSeason}
          label="Current Season"
          colorClass="from-orange-950/80 to-orange-900/40 border-orange-500/20 text-orange-300"
        />
      </div>

      {/* ── Featured / Top Leagues ────────────────────────────────────────── */}
      <section className="mb-16">
        <SectionHeading icon={Star} title="Top Leagues" count={leagues.length} accentClass="text-yellow-400" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} featured />
          ))}
        </div>
      </section>

      {/* ── Leagues by Sport ─────────────────────────────────────────────── */}
      {Array.from(leaguesBySport.entries()).map(([sport, sportLeagues]) => (
        <section key={sport} className="mb-16">
          <SectionHeading
            icon={TrendingUp}
            title={`${sport} Leagues`}
            count={sportLeagues.length}
            accentClass="text-blue-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sportLeagues.slice(0, 12).map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Browse More CTA ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm p-10 text-center mt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl" />
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Explore More Sports</h3>
          <p className="text-white/50 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Discover teams, players, and live scores from leagues around the world — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Users className="w-4 h-4" /> Browse Teams
            </Link>
            <Link
              href="/scores"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all text-sm font-medium"
            >
              <Trophy className="w-4 h-4" /> Live Scores
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all text-sm"
            >
              <Calendar className="w-4 h-4" /> Fixture Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeaguesSkeleton() {
  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="py-20 text-center">
        <div className="h-4 w-36 rounded-full bg-white/5 mx-auto mb-8 animate-pulse" />
        <div className="h-14 w-80 rounded-2xl bg-white/5 mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-60 rounded-xl bg-white/5 mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaguesPage() {
  return (
    <main className="min-h-screen bg-[#070710] pt-20">
      {/* Fixed ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-emerald-500/4 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <Suspense fallback={<LeaguesSkeleton />}>
        <LeaguesContent />
      </Suspense>
    </main>
  )
}
