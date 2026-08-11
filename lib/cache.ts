/**
 * Unified caching utility for client and server-side caching
 * Security: RISK-012 - Implement caching to reduce redundant requests
 * Expanded with Upstash Redis, Stale-While-Revalidate (SWR), exponential backoff, and 429 pausing
 */

import { Redis } from "@upstash/redis"

// ─── Named constants ────────────────────────────────────────────────────────
const RATE_LIMIT_PAUSE_MS = 30_000       // 30 seconds pause after hitting 429
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000  // 24-hour stale-while-revalidate window
const GRACE_PERIOD_REDIS_TTL_EXTRA = 24 * 60 * 60 // 24 hours in seconds
const FETCH_RETRY_INITIAL_DELAY_MS = 1_000
const FETCH_RETRY_COUNT = 3

interface MemoryCacheEntry {
  data: unknown
  expires: number
}

// Global in-memory cache map
const globalForCache = global as unknown as { __appCache: Map<string, unknown> }
export const cache = globalForCache.__appCache || new Map<string, unknown>()

if (process.env.NODE_ENV !== "production") {
  globalForCache.__appCache = cache
}

// Initialize Upstash Redis safely
let redisClient: Redis | null = null
let redisHealthy = true

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    // Avoid connecting if placeholders are detected
    if (url.includes("your-db") || token.includes("your-token") || token.includes("rotated")) {
      console.warn("[Cache] Upstash Redis credentials look like placeholders, disabling Redis cache")
      redisHealthy = false
    } else {
      redisClient = new Redis({ url, token })
    }
  } catch (err) {
    console.warn("[Cache] Failed to initialize Upstash Redis:", err)
    redisHealthy = false
  }
} else {
  redisHealthy = false
}

// 429 Rate limit pause tracking
let rateLimitPausedUntil = 0

// ─── Redis helpers ───────────────────────────────────────────────────────────

async function safeRedisGet<T>(key: string): Promise<T | null> {
  if (!redisClient || !redisHealthy) return null
  try {
    const data = await redisClient.get(key)
    if (!data) return null
    if (typeof data === "string") {
      return JSON.parse(data) as T
    }
    return data as T
  } catch (err) {
    console.warn(`[Cache] Redis GET error for key ${key}:`, err)
    redisHealthy = false // Mark as unhealthy on first error
    return null
  }
}

async function safeRedisSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!redisClient || !redisHealthy) return
  try {
    await redisClient.set(key, JSON.stringify(value), { ex: ttlSeconds })
  } catch (err) {
    console.warn(`[Cache] Redis SET error for key ${key}:`, err)
    redisHealthy = false
  }
}

// ─── Legacy simple caching functions (synchronous, memory-only) ──────────────

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key) as MemoryCacheEntry | undefined
  if (!entry) return null

  const expires = entry.expires
  const data = entry.data

  if (expires && Date.now() > expires) {
    cache.delete(key)
    return null
  }
  return data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  const entry: MemoryCacheEntry = {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  }
  cache.set(key, entry)

  // Write to Redis asynchronously; safeRedisSet handles errors internally
  if (redisClient && redisHealthy) {
    safeRedisSet(key, entry, ttlSeconds).catch((err) => {
      console.warn(`[Cache] Background Redis write failed for ${key}:`, err)
    })
  }
}

// ─── SWR Cache Types ──────────────────────────────────────────────────────────

interface SwrPayload<T> {
  data: T
  expiresAt: number
  staleUntil: number
}

// ─── SWR helpers (split from swrGet to reduce complexity) ────────────────────

async function readSwrPayload<T>(cacheKey: string): Promise<SwrPayload<T> | null> {
  if (redisClient && redisHealthy) {
    const redisPayload = await safeRedisGet<SwrPayload<T>>(cacheKey)
    if (redisPayload) return redisPayload
  }
  const memoryEntry = cache.get(cacheKey)
  return memoryEntry ? (memoryEntry as SwrPayload<T>) : null
}

async function revalidateInBackground<T>(
  key: string,
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<void> {
  try {
    const freshData = await fetchWithRetry(fetcher)
    await swrSet(cacheKey, freshData, ttlSeconds)
  } catch (err: unknown) {
    const isRateLimit =
      (err instanceof Error && (err.name === "RateLimitError" || err.message.includes("Rate limit") || err.message.includes("429")))
    if (isRateLimit) {
      console.warn(`[Cache SWR] Background revalidation hit rate limit. Pausing queue for ${RATE_LIMIT_PAUSE_MS / 1000}s.`)
      rateLimitPausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS
    } else {
      console.error(`[Cache SWR] Background revalidation failed for ${key}:`, err)
    }
  }
}

// ─── Main SWR caching entry point ────────────────────────────────────────────

export async function swrGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const now = Date.now()
  const cacheKey = `swr:${key}`
  const isRateLimited = now < rateLimitPausedUntil

  const payload = await readSwrPayload<T>(cacheKey)

  if (payload) {
    const isFresh = now < payload.expiresAt
    // Serve stale beyond staleUntil if we are still rate-limited
    const isWithinGrace = now < payload.staleUntil || isRateLimited

    if (isFresh) return payload.data

    if (isWithinGrace) {
      // Kick off background revalidation without blocking the response
      if (!isRateLimited) {
        void revalidateInBackground(key, cacheKey, fetcher, ttlSeconds)
      }
      return payload.data
    }
  }

  // Cache miss or fully expired — fetch synchronously
  try {
    const freshData = await fetchWithRetry(fetcher)
    await swrSet(cacheKey, freshData, ttlSeconds)
    return freshData
  } catch (err: unknown) {
    const isRateLimit =
      err instanceof Error &&
      (err.name === "RateLimitError" || err.message.includes("Rate limit") || err.message.includes("429"))

    if (isRateLimit) {
      rateLimitPausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS
      if (payload) {
        console.warn(`[Cache SWR] Hit rate limit on cache miss. Serving stale fallback for ${key}`)
        return payload.data
      }
    }
    throw err
  }
}

export async function swrSet<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const now = Date.now()
  const payload: SwrPayload<T> = {
    data,
    expiresAt: now + ttlSeconds * 1000,
    staleUntil: now + ttlSeconds * 1000 + GRACE_PERIOD_MS,
  }

  cache.set(key, payload)

  if (redisClient && redisHealthy) {
    const totalTtl = ttlSeconds + GRACE_PERIOD_REDIS_TTL_EXTRA
    await safeRedisSet(key, payload, totalTtl)
  }
}

// ─── Fetch with exponential backoff retry ─────────────────────────────────────

async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries = FETCH_RETRY_COUNT,
  delay = FETCH_RETRY_INITIAL_DELAY_MS,
): Promise<T> {
  try {
    return await fetcher()
  } catch (err: unknown) {
    const isRateLimit =
      err instanceof Error &&
      (err.name === "RateLimitError" || err.message.includes("Rate limit") || err.message.includes("429"))

    // Never retry rate limit errors
    if (isRateLimit) throw err

    if (retries <= 0) throw err

    const message = err instanceof Error ? err.message : String(err)
    console.warn(`[Cache Fetch Queue] Fetch failed. Retrying in ${delay}ms... Error:`, message)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return fetchWithRetry(fetcher, retries - 1, delay * 2)
  }
}

// ─── TTL constants ─────────────────────────────────────────────────────────────

export const CACHE_TTL = {
  PLAYERS: 86_400, // 24 hours
  TEAMS:   86_400, // 24 hours
  LEAGUES: 86_400, // 24 hours
  SCORES:  30,     // 30 seconds
  NEWS:    900,    // 15 minutes
}
