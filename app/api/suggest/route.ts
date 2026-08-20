import { NextRequest, NextResponse } from "next/server"
import { buildTitleSlug, isTmdbConfigured, searchTitles } from "@/lib/api/tmdb"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

/**
 * Typeahead suggestions for the hero search.
 *
 * Separate from `/api/search`, which returns the full sport payload (teams, players,
 * events) and is far heavier than a dropdown needs. This returns a short, flat, already
 * shaped list so the client does no mapping and ships no formatting logic.
 *
 * Reads `request`, so it is dynamic by definition — no static caching to worry about.
 * The `s-maxage` header still lets a CDN serve repeat prefixes, which matters because
 * typeahead traffic is dominated by the same few hundred prefixes.
 *
 * Both upstreams are queried in parallel and neither can sink the other: a rejected
 * provider yields an empty list for its own section rather than failing the request. A
 * dropdown that disappears because one provider blipped is worse than a short dropdown.
 */

export const runtime = "nodejs"

export interface Suggestion {
  id: string
  label: string
  sub: string
  href: string
  kind: "sport" | "film-tv"
  /** TMDB poster path, film and TV only. */
  posterPath?: string | null
}

const MIN_QUERY = 2
const MAX_PER_KIND = 5

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? ""

  if (q.length < MIN_QUERY || q.length > 64) {
    return NextResponse.json({ suggestions: [] as Suggestion[] })
  }

  const [films, sport] = await Promise.allSettled([
    isTmdbConfigured() ? searchTitles(q, MAX_PER_KIND) : Promise.resolve([]),
    unifiedSportsAPI.searchAll(q),
  ])

  const suggestions: Suggestion[] = []

  if (films.status === "fulfilled") {
    for (const t of films.value.slice(0, MAX_PER_KIND)) {
      suggestions.push({
        id: `title-${t.tmdbId}`,
        label: t.name,
        sub: `${t.mediaType === "movie" ? "Film" : "Series"}${t.year ? ` · ${t.year}` : ""}`,
        href: `/watch/title/${buildTitleSlug(t.mediaType, t.tmdbId, t.name)}`,
        kind: "film-tv",
        posterPath: t.posterPath,
      })
    }
  }

  if (sport.status === "fulfilled") {
    const teams = (sport.value?.teams ?? []).slice(0, MAX_PER_KIND)
    for (const team of teams as { idTeam?: string; strTeam?: string; strLeague?: string }[]) {
      if (!team.strTeam || !team.idTeam) continue
      suggestions.push({
        id: `team-${team.idTeam}`,
        label: team.strTeam,
        sub: team.strLeague || "Team",
        href: `/teams/${team.idTeam}`,
        kind: "sport",
      })
    }
  }

  return NextResponse.json(
    { suggestions },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  )
}
