import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TeamHeader } from "@/components/team/team-header"
import { TeamInfoCard } from "@/components/team/team-info-card"
import { TeamRoster } from "@/components/team/team-roster"
import { TeamSchedule } from "@/components/team/team-schedule"
import { Skeleton } from "@/components/ui/skeleton"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

interface TeamPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  try {
    const team = await unifiedSportsAPI.getTeam(params.id)
    if (!team) {
      return {
        title: "Team Not Found - Smart Live TV",
        description: "The requested team could not be found.",
      }
    }

    return {
      title: `${team.name} - Smart Live TV`,
      description: `Get the latest information about ${team.name}, including roster, schedule, and team statistics.`,
    }
  } catch (error) {
    return {
      title: "Team - Smart Live TV",
      description: "Team information and statistics.",
    }
  }
}

async function TeamContent({ teamId }: { teamId: string }) {
  try {
    const [team, players, fixtures] = await Promise.all([
      unifiedSportsAPI.getTeam(teamId),
      unifiedSportsAPI.getPlayers(teamId),
      unifiedSportsAPI.getFixtures({ teamId, next: 10 }),
    ])

    if (!team) {
      notFound()
    }

    return (
      <div className="space-y-8">
        <TeamHeader team={team} additionalInfo={null} />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TeamInfoCard team={team} additionalInfo={null} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <TeamRoster players={players} />
            <TeamSchedule fixtures={fixtures} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading team:", error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load team information. Please try again later.</p>
      </div>
    )
  }
}

function TeamLoading() {
  return (
    <div className="space-y-8">
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}

// Force dynamic rendering to ensure params are always fresh
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function TeamPage({ params }: TeamPageProps) {
  // Use params.id directly - ensure it's used as a key for React to detect changes
  const teamId = params.id
  
  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
      <Suspense fallback={<TeamLoading />}>
        <TeamContent key={teamId} teamId={teamId} />
      </Suspense>
    </div>
  )
}
