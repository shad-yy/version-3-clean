import { NextRequest, NextResponse } from "next/server"
import {
  buildTitleSlug,
  getWatchProvidersForCountry,
  isTmdbConfigured,
  searchTitles,
} from "@/lib/api/tmdb"
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
  /**
   * Where it is shown in the viewer's country — the right-hand column of the dropdown.
   * Absent when we hold nothing, which the panel renders as such rather than hiding.
   */
  where?: string | null
}

const MIN_QUERY = 2
const MAX_PER_KIND = 5

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? ""

  if (q.length < MIN_QUERY || q.length > 64) {
    return NextResponse.json({ suggestions: [] as Suggestion[] })
  }

  // The viewer's country decides the "where" column. Absent is fine and common.
  const country = new URL(request.url).searchParams.get("country")

  const [films, sport] = await Promise.allSettled([
    isTmdbConfigured() ? searchTitles(q, MAX_PER_KIND) : Promise.resolve([]),
    unifiedSportsAPI.searchAll(q),
  ])

  const suggestions: Suggestion[] = []

  if (films.status === "fulfilled") {
    const picks = films.value.slice(0, MAX_PER_KIND)

    /*
     * One availability lookup per suggestion, in parallel, only when a country is known.
     * Cached for six hours and shared, so a repeated prefix costs nothing. A failure
     * yields no "where" rather than failing the suggestion — a title the reader can still
     * open is better than a dropdown that lost a row.
     */
    const wheres = await Promise.all(
      picks.map(async (t) => {
        if (!country) return null
        try {
          const a = await getWatchProvidersForCountry(t.mediaType, t.tmdbId, country)
          if (!a) return null
          const names = [...a.free, ...a.ads, ...a.flatrate, ...a.rent, ...a.buy].map(
            (p) => p.name,
          )
          const unique = [...new Set(names)]
          if (unique.length === 0) return null
          return unique.length > 1 ? `${unique[0]} +${unique.length - 1}` : unique[0]
        } catch {
          return null
        }
      }),
    )

    picks.forEach((t, i) => {
      suggestions.push({
        id: `title-${t.tmdbId}`,
        label: t.name,
        sub: `${t.mediaType === "movie" ? "Film" : "Series"}${t.year ? ` · ${t.year}` : ""}`,
        href: `/watch/title/${buildTitleSlug(t.mediaType, t.tmdbId, t.name)}`,
        kind: "film-tv",
        posterPath: t.posterPath,
        where: wheres[i],
      })
    })
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
