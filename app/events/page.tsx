import type { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { unifiedSportsAPI, type UnifiedFixture } from "@/lib/api/unified-sports-api"
import { Card, CardContent } from "@/components/ui/card"
import { EventCard } from "@/components/events/event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Trophy, Zap, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MotionWrapper } from "@/components/ui/motion-wrapper"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sports Fixtures & Results Calendar | Smart Live TV",
  description:
    "Full fixture calendar and results archive across football, UFC and Formula 1, with kick-off times and official UK broadcast listings.",
  alternates: { canonical: `${ENV.BASE_URL}/events` },
}


interface EventsPageProps {
  searchParams: {
    league?: string
    team?: string
    date?: string
  }
}

function EventsFallback() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function EventsList({
  type,
  searchParams,
}: {
  type: "today" | "upcoming" | "recent"
  searchParams: EventsPageProps["searchParams"]
}) {
  let fixtures: UnifiedFixture[] = []
  let error = null

  try {
    switch (type) {
      case "today":
        const today = new Date().toISOString().split("T")[0]
        fixtures = await unifiedSportsAPI.getFixtures({
          date: today,
          leagueId: searchParams.league,
          teamId: searchParams.team,
        })
        break
      case "upcoming":
        // Use smart upcoming logic
        fixtures = await unifiedSportsAPI.getUpcomingFixtures({
          leagueId: searchParams.league,
          teamId: searchParams.team,
          limit: 20,
        })
        break
      case "recent":
        // Use getRecentResults for better coverage
        if (searchParams.league || searchParams.team) {
          fixtures = await unifiedSportsAPI.getFixtures({
            last: 20,
            leagueId: searchParams.league,
            teamId: searchParams.team,
          })
        } else {
          fixtures = await unifiedSportsAPI.getRecentResults()
        }
        break
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load events"
    fixtures = []
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Events</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button asChild variant="outline">
          <Link href="/events">Try Again</Link>
        </Button>
      </div>
    )
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
        <p className="text-gray-400">
          {type === "today" && "No matches scheduled for today"}
          {type === "upcoming" && "No upcoming matches available"}
          {type === "recent" && "No recent matches available"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {fixtures.map((fixture) => (
        <div key={fixture.id} className="h-full">
          <EventCard fixture={fixture} />
        </div>
      ))}
    </div>
  )
}

export default function EventsPage({ searchParams }: EventsPageProps) {
  const leagues = [
    { id: "all", name: "All Leagues", href: "/events" },
    { id: "39", name: "Premier League", href: "/events?league=4328" }, // Corrected ID for EPL
    { id: "140", name: "La Liga", href: "/events?league=4335" },
    { id: "78", name: "Bundesliga", href: "/events?league=4331" },
    { id: "135", name: "Serie A", href: "/events?league=4332" },
    { id: "61", name: "Ligue 1", href: "/events?league=4334" },
    { id: "ufc", name: "UFC", href: "/events?league=4460" }, // Added UFC
  ]

  const currentLeague = searchParams.league || "all"

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-32 pb-12 min-h-screen">
      {/* Header with Motion */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <MotionWrapper>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Sports Events</h1>
          <p className="text-lg text-muted-foreground">Live scores, upcoming fixtures, and match results</p>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <Button variant="outline" className="rounded-full px-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </MotionWrapper>
      </div>

      {/* Compact Horizontal Filter Scroll */}
      <MotionWrapper delay={0.2} className="mb-10">
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide mask-linear-fade">
            {leagues.map((league) => {
              const isActive = currentLeague === league.id || (league.id === "all" && !searchParams.league)
              return (
                <Link key={league.id} href={league.href}>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "px-6 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer hover:scale-105",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-background/50 hover:bg-muted border-border/50"
                    )}
                  >
                    {league.name}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </div>
      </MotionWrapper>

      {/* Events Tabs with Premium Styling */}
      <Tabs defaultValue="today" className="w-full space-y-8">
        <MotionWrapper delay={0.3}>
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-muted/30 p-1 rounded-full backdrop-blur-sm border border-border/50">
            <TabsTrigger value="today" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              Today
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300">
              Recent
            </TabsTrigger>
          </TabsList>
        </MotionWrapper>

        <TabsContent value="today" className="mt-0">
          <MotionWrapper delay={0.4}>
            <Suspense fallback={<EventsFallback />}>
              <EventsList type="today" searchParams={searchParams} />
            </Suspense>
          </MotionWrapper>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <MotionWrapper delay={0.4}>
            <Suspense fallback={<EventsFallback />}>
              <EventsList type="upcoming" searchParams={searchParams} />
            </Suspense>
          </MotionWrapper>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <MotionWrapper delay={0.4}>
            <Suspense fallback={<EventsFallback />}>
              <EventsList type="recent" searchParams={searchParams} />
            </Suspense>
          </MotionWrapper>
        </TabsContent>
      </Tabs>
    </div>
  )
}
