import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PlayerPageClient } from "./PlayerPageClient"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

interface PlayerPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  try {
    const { id } = params
    const player = await unifiedSportsAPI.getPlayer(id)
    if (!player) {
      return {
        title: "Player Not Found - Sightline",
        description: "The requested player could not be found.",
      }
    }
    return {
      title: `${player.name} - Sightline`,
      description: `Get the latest information about ${player.name}, including stats, team information, and career highlights.`,
    }
  } catch {
    return {
      title: "Player - Sightline",
      description: "Player information and statistics.",
    }
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = params
  const player = await unifiedSportsAPI.getPlayer(id)
  if (!player) notFound()

  let recentMatches: Awaited<ReturnType<typeof unifiedSportsAPI.getFixtures>> = []
  if (player.team) {
    try {
      recentMatches = await unifiedSportsAPI.getFixtures({ teamId: player.team, last: 10 })
    } catch {
      // ignore
    }
  }
  const recent = recentMatches.slice(0, 5)

  return <PlayerPageClient player={player} recentMatches={recent} />
}
