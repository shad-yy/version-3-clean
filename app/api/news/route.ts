import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Nuclear dedup — catches duplicates by URL, normalized title,
 * and image URL (sans query-string).
 * Uses safe thresholds to avoid false-positive collapse.
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

    // Title dedup — use 60 chars to avoid
    // false positive deduplication of different articles
    const titleKey = (article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 60)  // CRITICAL: was 40, too short

    // Only deduplicate if title key is substantial
    // (longer than 15 chars after normalisation)
    if (titleKey.length >= 15 && seenTitleKeys.has(titleKey)) {
      return false
    }

    // Image dedup — only deduplicate if different
    // articles share the exact same image URL
    // (indicates syndicated duplicates)
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

export async function GET(request: Request) {
  try {
    const rawArticles = await getLatestSportsNews()
    const deduped = nuclearDedup(rawArticles)

    return NextResponse.json({
      status: "success",
      articles: deduped.slice(0, 10),
      totalResults: deduped.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { status: "error", articles: [], totalResults: 0 },
      { status: 500 }
    )
  }
}
