const NEWS_BASE_URL = 'https://newsdata.io/api/1/latest'
const NEWS_DOMAIN_FILTER = 'skysports.com,bbc.com,goal.com,espn.com,theguardian.com'
const NEWS_DOMAIN_FALLBACK = 'skysports.com'

// Module-level cache — survives between requests in dev
const newsCache = new Map<string, { data: NewsArticle[]; expires: number }>()

export interface NewsArticle {
  article_id: string
  title: string
  link: string
  description: string | null
  pubDate: string
  source_name: string | null
  source_icon: string | null
  image_url: string | null
  category: string[] | null
  language: string | null
  country: string[] | null
  creator: string[] | null
}

const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    article_id: 'fallback-1',
    title: 'Premier League 2026-27: Live Score Tracking & Match Data',
    description: 'Follow every Premier League match with live scores, stats and where to watch, on Sightline.',
    image_url: null,
    link: '/scores',
    source_name: 'Sightline',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: ['Sightline'],
  },
  {
    article_id: 'fallback-2',
    title: 'Champions League Live Scores — Real-Time Data Hub',
    description: 'Track every UEFA Champions League match with live scores, stats, and fixture data.',
    image_url: null,
    link: '/watch/champions-league',
    source_name: 'Sightline',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: ['Sightline'],
  },
  {
    article_id: 'fallback-3',
    title: 'World Cup 2026 — Live Match Data & Fixtures',
    description: 'Real-time FIFA World Cup 2026 fixtures, scores, and match statistics.',
    image_url: null,
    link: '/watch/world-cup-2026',
    source_name: 'Sightline',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: ['Sightline'],
  },
  {
    article_id: 'fallback-4',
    title: 'UFC Fight Night — Live Results & Event Data',
    description: 'Follow every UFC event with real-time fight results, odds, and event information.',
    image_url: null,
    link: '/ufc',
    source_name: 'Sightline',
    pubDate: new Date().toISOString(),
    category: ['mma'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: ['Sightline'],
  },
]

import { swrGet } from "@/lib/cache"
import { ENV } from "@/lib/config/env"

export async function getLatestSportsNews(
  query = 'football OR soccer OR "premier league" OR UFC OR "champions league"',
  size = 10
): Promise<NewsArticle[]> {
  const apiKey = ENV.NEWS_API_KEY

  if (!apiKey) {
    console.warn('[NewsAPI] NEWS_API_KEY missing in env')
    return FALLBACK_ARTICLES
  }

  // Free plan: size must be 1-10
  const safeSize = Math.min(Math.max(1, size), 10)
  const cacheKey = `news:sports:v6:${safeSize}:${query}`

  /*
   * Shared cache, not the module-level Map this used to rely on.
   *
   * The old path combined `cache: 'no-store'` with a one-hour in-process Map. In-process
   * means per-serverless-instance: the first visitor to reach a cold instance paid the
   * full upstream round trip, and so did the first visitor to reach the *next* instance,
   * and the next. The cache existed but almost nobody hit it.
   *
   * `swrGet` is Redis-backed, so one visitor's slow request warms it for everyone, and it
   * serves stale content while revalidating in the background — meaning a reader never
   * waits on the upstream again once anything has been cached, even after the TTL passes.
   *
   * The fetcher throws on any non-success so a failure is never written to the cache.
   * Caching a fallback would pin the placeholder articles in Redis for the full TTL, which
   * is far worse than a slow retry.
   */
  return swrGet<NewsArticle[]>(cacheKey, () => fetchNewsUpstream(query, safeSize), NEWS_TTL)
    .catch(() => FALLBACK_ARTICLES)
}

/** Time news stays fresh before a background refresh. Headlines are not breaking data. */
const NEWS_TTL = 6 * 60 * 60 // 6 hours

async function fetchNewsUpstream(query: string, safeSize: number): Promise<NewsArticle[]> {
  const apiKey = ENV.NEWS_API_KEY

  const params = new URLSearchParams({
    apikey: apiKey || '',
    language: 'en',
    size: String(safeSize),
    q: query,
  })

  const domainFilter = 'skysports.com,bbc.com,espn.com,theguardian.com'
  const url = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${domainFilter}`

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[NewsAPI DEBUG] fetching:', url.replace(apiKey, 'REDACTED'))
    }
    let response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })

    // Some plans reject multiple domains and return 422; retry with one domain.
    if (response.status === 422) {
      const fallbackUrl = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${NEWS_DOMAIN_FALLBACK}`
      console.warn('[NewsAPI] Domain filter rejected, retrying with fallback domain')
      if (process.env.NODE_ENV !== 'production') {
        console.log('[NewsAPI DEBUG] retrying:', fallbackUrl.replace(apiKey || '', 'REDACTED'))
      }
      response = await fetch(fallbackUrl, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (response.status === 401 || response.status === 403) {
      console.error('[NewsAPI] Unauthorized — check NEWS_API_KEY in .env.local')
      throw new Error('news: unauthorised')
    }

    if (response.status === 429) {
      console.error('[NewsAPI] Rate limit hit — using mock data')
      throw new Error('news: rate limited')
    }

    if (!response.ok) {
      console.error(`[NewsAPI] Request failed with status ${response.status} — using mock data`)
      throw new Error(`news: HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'success' || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('[NewsAPI] Empty or error response — using mock data')
      throw new Error('news: empty response')
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NewsAPI] Success — got ${data.results.length} articles`)
    }

    return data.results as NewsArticle[]

  } catch (error) {
    console.error('[NewsAPI] Network error:', error)
    // Rethrown so swrGet does not persist a failure. The caller substitutes fallbacks.
    throw error
  }
}

import { NewsArticle as SharedNewsArticle, NewsResponse } from "@/lib/api/types"

/**
 * Nuclear dedup — catches duplicates by URL, normalized title,
 * image URL (sans query-string), and description content hash.
 */
function nuclearDedup(articles: any[]): any[] {
  if (!articles?.length) return []

  const seenUrls = new Set<string>()
  const seenTitleKeys = new Set<string>()
  const seenImages = new Set<string>()

  return articles.filter(article => {
    if (!article || !article.title) return false

    // URL dedup — exact match only
    const url = (article.link || article.url || '').trim()
    if (url && seenUrls.has(url)) return false

    // Title dedup — use 60 chars to avoid false positives
    const titleKey = (article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 60)

    if (titleKey.length >= 15 && seenTitleKeys.has(titleKey)) {
      return false
    }

    // Image dedup — exact same image URL only
    const img = (article.image_url || article.urlToImage || '')
      .split('?')[0]
      .trim()

    if (img && img.length > 20 && seenImages.has(img)) {
      return false
    }

    // Mark as seen
    if (url) seenUrls.add(url)
    if (titleKey.length >= 15) seenTitleKeys.add(titleKey)
    if (img && img.length > 20) seenImages.add(img)

    return true
  })
}

export const newsAPI = {
  searchNews: async (params: any = {}): Promise<NewsResponse> => {
    const raw = await getLatestSportsNews(params.q, params.pageSize);
    const deduped = nuclearDedup(raw);
    return {
      totalResults: deduped.length,
      articles: deduped.map(a => ({
        id: a.article_id,
        title: a.title || "",
        url: a.link,
        urlToImage: a.image_url || null,
        description: a.description || "",
        content: a.description || "",
        source: { id: null, name: a.source_name || "Unknown" },
        publishedAt: a.pubDate,
        author: a.creator ? a.creator.join(', ') : null,
        category: a.category ? a.category[0] : undefined
      })) as SharedNewsArticle[]
    };
  },
  getTrendingSportsNews: async (): Promise<SharedNewsArticle[]> => {
    const raw = await getLatestSportsNews();
    const deduped = nuclearDedup(raw);
    return deduped.map(a => ({
      id: a.article_id,
      title: a.title || "",
      url: a.link,
      urlToImage: a.image_url || null,
      description: a.description || "",
      content: a.description || "",
      source: { id: null, name: a.source_name || "Unknown" },
      publishedAt: a.pubDate,
      author: a.creator ? a.creator.join(', ') : null,
      category: a.category ? a.category[0] : undefined
    })) as SharedNewsArticle[];
  }
};