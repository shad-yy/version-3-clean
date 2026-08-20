import { cacheGet, cacheSet } from "@/lib/cache/redis"

/**
 * TMDB Watch Providers — per-country streaming availability for films and TV series.
 *
 * Powered by JustWatch. Two constraints that are not optional:
 *
 *  1. **Attribution is required.** Wherever this data is displayed, the source must be
 *     credited to JustWatch. See `JUSTWATCH_ATTRIBUTION` below.
 *  2. **There are no deep links.** TMDB returns which providers carry a title in a
 *     country, plus a TMDB landing link — not a play URL on the provider. Never render
 *     a provider logo as though it launches playback.
 *
 * Scope note: this covers **films and TV series only**. It does not carry sports
 * broadcast rights — those come from `lib/data/broadcast-rights.ts`, which is
 * hand-verified per competition. Do not use this module for fixtures.
 *
 * Docs: https://developer.themoviedb.org/reference/movie-watch-providers
 */

const TMDB_BASE = "https://api.themoviedb.org/3"

/**
 * Required attribution, rendered once site-wide in the footer.
 *
 * Two obligations, not one. JustWatch must be credited as the source of availability
 * data, and TMDB's terms separately require the "not endorsed or certified" wording — that
 * second half was missing entirely until this was consolidated, so the site was showing
 * the data without the notice TMDB asks for.
 *
 * It lives in the footer rather than beside every section on purpose: present on every
 * page, permanently, and unobtrusive. That satisfies both providers without repeating the
 * same sentence five times down a single page. **Do not remove it, and do not hide it
 * from assistive technology or with `display: none`** — a notice nobody can read is not a
 * notice, and the obligation is the reason the data can be used at all.
 */
export const DATA_ATTRIBUTION =
  "Streaming availability data provided by JustWatch. This product uses the TMDB API but is not endorsed or certified by TMDB."

/** @deprecated Use `DATA_ATTRIBUTION`, which also carries the notice TMDB requires. */
export const JUSTWATCH_ATTRIBUTION = "Streaming availability data provided by JustWatch"

/** Availability changes daily at most; a day is a safe floor. */
const TTL_AVAILABILITY = 21_600 // 6 hours
/** The provider and region lists barely move. */
const TTL_REFERENCE = 604_800 // 7 days

export type MediaType = "movie" | "tv"

export interface WatchProvider {
  providerId: number
  name: string
  /** TMDB-relative logo path, e.g. "/abc.jpg". Combine with an image base URL. */
  logoPath: string | null
  displayPriority: number
}

export interface CountryAvailability {
  /** ISO 3166-1 alpha-2. */
  country: string
  /** TMDB landing page for this title/country — NOT a provider deep link. */
  tmdbLink: string
  /** Included with a subscription. */
  flatrate: WatchProvider[]
  /** Available to rent. */
  rent: WatchProvider[]
  /** Available to buy. */
  buy: WatchProvider[]
  /** Free to watch, no advertising tier stated. */
  free: WatchProvider[]
  /**
   * Free but ad-supported. TMDB returns this as a separate `ads` bucket, and it is
   * NOT interchangeable with `free`.
   *
   * Verified against the live API: for Fight Club, the only free route in Great
   * Britain is ITVX and it arrives under `ads` — an earlier version of this file
   * mapped `free` alone, so that entry was silently dropped. Dropping a free option
   * is the worst possible direction to be wrong in, since it pushes a reader toward
   * paying for something they could watch for nothing.
   */
  ads: WatchProvider[]
}

interface TmdbProviderRaw {
  provider_id: number
  provider_name: string
  logo_path?: string | null
  display_priority?: number
}

function mapProviders(raw: TmdbProviderRaw[] | undefined): WatchProvider[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p) => ({
      providerId: p.provider_id,
      name: p.provider_name,
      logoPath: p.logo_path ?? null,
      displayPriority: p.display_priority ?? 999,
    }))
    .sort((a, b) => a.displayPriority - b.displayPriority)
}

/**
 * Server-side only. The key must never reach the browser, so this module must not be
 * imported from a client component.
 */
function apiKey(): string | null {
  return process.env.TMDB_API_KEY || null
}

/**
 * How long a "TMDB has nothing for this" answer is remembered.
 *
 * Negative caching matters more here than positive caching. Title pages render on
 * demand for any slug, so `/watch/title/movie-1-x`, `movie-2-x`, `movie-3-x`... would
 * each miss the cache and proxy straight through to TMDB. Without this, the route is
 * an open relay for enumerating their API on our key.
 *
 * Shorter than the positive TTL because a missing record can start existing.
 */
const TTL_NEGATIVE = 3600 // 1 hour

/**
 * Cache envelope.
 *
 * `cacheGet` returns null both for "not in cache" and for "cached the value null", so a
 * bare null cannot express a remembered negative. Wrapping the payload makes the two
 * distinguishable: a miss is `null`, a cached negative is `{ v: null }`.
 */
interface CacheEnvelope<T> {
  v: T | null
}

/**
 * In-flight request map, keyed by path.
 *
 * On a cold cache a popular title can be requested by many visitors at once, and
 * without this each one issues its own identical upstream call. Sharing the promise
 * collapses them into one. Entries are removed as soon as they settle, so this never
 * acts as a second, unbounded cache.
 */
const inFlight = new Map<string, Promise<unknown>>()

async function tmdbFetch<T>(path: string, ttl: number): Promise<T | null> {
  const key = apiKey()
  if (!key) {
    console.warn("[TMDB] TMDB_API_KEY not set — availability data unavailable")
    return null
  }

  const cacheKey = `tmdb:${path}`

  const cached = await cacheGet<CacheEnvelope<T>>(cacheKey)
  if (cached && typeof cached === "object" && "v" in cached) {
    return cached.v
  }

  const existing = inFlight.get(cacheKey)
  if (existing) return existing as Promise<T | null>

  const request = (async (): Promise<T | null> => {
    const separator = path.includes("?") ? "&" : "?"
    const url = `${TMDB_BASE}${path}${separator}api_key=${key}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      })

      // Transient by definition — never cached, or we would lock in a failure for an
      // hour. TMDB does not ban IPs for this; it answers 429 and expects a back-off.
      if (res.status === 429) {
        console.warn(`[TMDB] 429 rate limited on ${path} — backing off, not caching`)
        return null
      }

      // The record does not exist. Remember that, so repeated requests for a bad id
      // stop reaching TMDB at all.
      if (res.status === 404) {
        await cacheSet<CacheEnvelope<T>>(cacheKey, { v: null }, TTL_NEGATIVE)
        return null
      }

      if (!res.ok) throw new Error(`TMDB responded ${res.status}`)

      const data = (await res.json()) as T
      await cacheSet<CacheEnvelope<T>>(cacheKey, { v: data }, ttl)
      return data
    } catch (err) {
      // Log the real cause. A swallowed error here is indistinguishable from "no data",
      // and "no data" is a legitimate answer we must not confuse with a fault.
      //
      // Not cached: a timeout or network fault says nothing about whether the record
      // exists, and caching it would turn a blip into an hour of wrong answers.
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
      console.error(`[TMDB] ${path} failed — ${reason}`)
      return null
    } finally {
      clearTimeout(timer)
    }
  })()

  inFlight.set(cacheKey, request)
  try {
    return await request
  } finally {
    inFlight.delete(cacheKey)
  }
}

/**
 * Where a title can be watched, by country.
 *
 * Returns an empty array when TMDB has no data — which is a real and common answer,
 * not an error. Never substitute a guess for an empty result.
 */
export async function getWatchProviders(
  mediaType: MediaType,
  tmdbId: number,
): Promise<CountryAvailability[]> {
  const data = await tmdbFetch<{ results?: Record<string, Record<string, unknown>> }>(
    `/${mediaType}/${tmdbId}/watch/providers`,
    TTL_AVAILABILITY,
  )
  if (!data?.results) return []

  return Object.entries(data.results)
    .map(([country, entry]) => ({
      country,
      tmdbLink: typeof entry.link === "string" ? entry.link : "",
      flatrate: mapProviders(entry.flatrate as TmdbProviderRaw[]),
      rent: mapProviders(entry.rent as TmdbProviderRaw[]),
      buy: mapProviders(entry.buy as TmdbProviderRaw[]),
      free: mapProviders(entry.free as TmdbProviderRaw[]),
      ads: mapProviders(entry.ads as TmdbProviderRaw[]),
    }))
    .filter(
      (c) => c.flatrate.length || c.rent.length || c.buy.length || c.free.length || c.ads.length,
    )
    .sort((a, b) => a.country.localeCompare(b.country))
}

/** Availability for one country, or null when TMDB has none for it. */
export async function getWatchProvidersForCountry(
  mediaType: MediaType,
  tmdbId: number,
  country: string,
): Promise<CountryAvailability | null> {
  const all = await getWatchProviders(mediaType, tmdbId)
  return all.find((c) => c.country === country.toUpperCase()) ?? null
}

/** ISO 3166-1 alpha-2 codes TMDB has provider data for. */
export async function getAvailableRegions(): Promise<string[]> {
  const data = await tmdbFetch<{ results?: Array<{ iso_3166_1: string }> }>(
    "/watch/providers/regions",
    TTL_REFERENCE,
  )
  if (!data?.results) return []
  return data.results.map((r) => r.iso_3166_1).sort()
}

/** Every provider available in a country, for building a directory. */
export async function getProvidersForRegion(
  mediaType: MediaType,
  country: string,
): Promise<WatchProvider[]> {
  const data = await tmdbFetch<{ results?: TmdbProviderRaw[] }>(
    `/watch/providers/${mediaType}?watch_region=${encodeURIComponent(country.toUpperCase())}`,
    TTL_REFERENCE,
  )
  return mapProviders(data?.results)
}

/** Whether the integration is configured. Use to hide the vertical rather than 500. */
export function isTmdbConfigured(): boolean {
  return apiKey() !== null
}

/* -------------------------------------------------------------------------- titles */

/**
 * A film or series, normalised.
 *
 * TMDB uses different field names for the same concept depending on media type —
 * `title`/`release_date` for films, `name`/`first_air_date` for series. Callers should
 * not have to care, so the difference is absorbed here.
 */
export interface TitleDetails {
  mediaType: MediaType
  tmdbId: number
  name: string
  /** Four-digit year, or "" when TMDB has no date (unreleased titles are common). */
  year: string
  overview: string
  posterPath: string | null
  genres: string[]
  /** Minutes for a film; undefined for a series. */
  runtime?: number
  /** Season count for a series; undefined for a film. */
  seasons?: number
}

interface TmdbTitleRaw {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  overview?: string
  poster_path?: string | null
  runtime?: number
  number_of_seasons?: number
  genres?: Array<{ name: string }>
  media_type?: string
}

function mapTitle(raw: TmdbTitleRaw, mediaType: MediaType): TitleDetails {
  const date = raw.release_date || raw.first_air_date || ""
  return {
    mediaType,
    tmdbId: raw.id,
    name: raw.title || raw.name || "",
    year: date.slice(0, 4),
    overview: raw.overview || "",
    posterPath: raw.poster_path ?? null,
    genres: (raw.genres || []).map((g) => g.name),
    runtime: raw.runtime,
    seasons: raw.number_of_seasons,
  }
}

/** Details for one film or series. Null when TMDB has no such id. */
export async function getTitleDetails(
  mediaType: MediaType,
  tmdbId: number,
): Promise<TitleDetails | null> {
  const raw = await tmdbFetch<TmdbTitleRaw>(`/${mediaType}/${tmdbId}`, TTL_REFERENCE)
  return raw ? mapTitle(raw, mediaType) : null
}

/**
 * Trending films and series for the week.
 *
 * Used to decide which title pages to pre-render. Deliberately cached for a day rather
 * than the reference TTL: the list genuinely moves, and a stale trending list produces
 * pages nobody is looking for.
 */
/**
 * Build a TMDB artwork URL at a named width.
 *
 * TMDB serves fixed rendition widths; requesting an arbitrary size returns nothing, so the
 * width is a union rather than a number. `w342` is the right default for the 136x202
 * poster slot the design specifies -- roughly 2.5x for high-density screens, and the next
 * size down (w185) visibly softens on retina.
 *
 * Returns null when there is no artwork, which is common enough that callers must handle
 * it: TMDB has no poster for plenty of unreleased or minor titles, and a broken image is
 * worse than a designed empty slot.
 */
export type TmdbImageWidth = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original"

export function tmdbImage(path: string | null, width: TmdbImageWidth = "w342"): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${width}${path}`
}

export async function getTrendingTitles(limit = 20): Promise<TitleDetails[]> {
  const data = await tmdbFetch<{ results?: TmdbTitleRaw[] }>(
    "/trending/all/week",
    TTL_AVAILABILITY,
  )
  if (!data?.results) return []

  return data.results
    // TMDB mixes people into "all" trending; only films and series have availability.
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => mapTitle(r, r.media_type as MediaType))
    .filter((t) => t.name)
    .slice(0, limit)
}

/**
 * Search films and series by name.
 *
 * Uses `/search/multi`, which also returns people — filtered out here, because a person
 * has no availability and would be an unanswerable row in a "where can I watch this"
 * result list.
 *
 * Cached on the availability TTL rather than the reference TTL: a search for a title
 * released this week should start returning it quickly.
 */
export async function searchTitles(query: string, limit = 10): Promise<TitleDetails[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const data = await tmdbFetch<{ results?: TmdbTitleRaw[] }>(
    `/search/multi?query=${encodeURIComponent(trimmed)}&include_adult=false`,
    TTL_AVAILABILITY,
  )
  if (!data?.results) return []

  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => mapTitle(r, r.media_type as MediaType))
    .filter((t) => t.name)
    .slice(0, limit)
}

/* --------------------------------------------------------------------------- slugs */

/**
 * URL slug for a title, e.g. `movie-550-fight-club`.
 *
 * The media type and TMDB id are carried in the slug itself so a page can be resolved
 * without a lookup table — there is no local database of titles, and inventing one
 * would mean a second source of truth that can drift from TMDB. The human-readable
 * name trails behind for legibility and search.
 */
export function buildTitleSlug(mediaType: MediaType, tmdbId: number, name: string): string {
  const readable = name
    .toLowerCase()
    .normalize("NFKD")
    // Strip combining marks left by NFKD so "Amélie" becomes "amelie", not "ame-lie".
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return readable ? `${mediaType}-${tmdbId}-${readable}` : `${mediaType}-${tmdbId}`
}

/** Reverse of buildTitleSlug. Null when the slug is not a valid title reference. */
export function parseTitleSlug(slug: string): { mediaType: MediaType; tmdbId: number } | null {
  const match = /^(movie|tv)-(\d+)(?:-|$)/.exec(slug)
  if (!match) return null
  const tmdbId = Number(match[2])
  return Number.isSafeInteger(tmdbId) && tmdbId > 0
    ? { mediaType: match[1] as MediaType, tmdbId }
    : null
}
