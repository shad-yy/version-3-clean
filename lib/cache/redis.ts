import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.warn('[Cache] Upstash env vars missing — caching disabled')
    return null
  }
  redis = new Redis({ url, token })
  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  try {
    return await client.get<T>(key) ?? null
  } catch (err) {
    console.error('[Cache] GET error:', key, err)
    return null
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, value, { ex: ttlSeconds })
  } catch (err) {
    console.error('[Cache] SET error:', key, err)
  }
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached
  const fresh = await fetcher()
  cacheSet(key, fresh, ttlSeconds).catch(console.error)
  return fresh
}

export async function withShortCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  return withCache(key, 300, fetcher) // 5 minute TTL
}
