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

/** Must be rendered wherever availability data appears. */
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
  /** Free, ad-supported or otherwise. */
  free: WatchProvider[]
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

async function tmdbFetch<T>(path: string, ttl: number): Promise<T | null> {
  const key = apiKey()
  if (!key) {
    console.warn("[TMDB] TMDB_API_KEY not set — availability data unavailable")
    return null
  }

  const cacheKey = `tmdb:${path}`
  const cached = await cacheGet<T>(cacheKey)
  if (cached) return cached

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
    if (!res.ok) throw new Error(`TMDB responded ${res.status}`)
    const data = (await res.json()) as T
    await cacheSet(cacheKey, data, ttl)
    return data
  } catch (err) {
    // Log the real cause. A swallowed error here is indistinguishable from "no data",
    // and "no data" is a legitimate answer we must not confuse with a fault.
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error(`[TMDB] ${path} failed — ${reason}`)
    return null
  } finally {
    clearTimeout(timer)
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
    }))
    .filter((c) => c.flatrate.length || c.rent.length || c.buy.length || c.free.length)
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
