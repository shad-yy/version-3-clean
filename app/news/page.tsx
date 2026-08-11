import type { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { getLatestSportsNews } from "@/lib/api/news"
import { NewsPageClient } from "./client"

export const metadata: Metadata = {
  title: "Sports News | Latest Football & MMA Headlines",
  description:
    "Latest Premier League, Champions League and UFC news updated daily.",
  alternates: { canonical: `${ENV.BASE_URL}/news` },
}

export default async function NewsPage() {
  const rawArticles = await getLatestSportsNews(undefined, 10)
  
  const seen = new Set<string>()
  const seenUrls = new Set<string>()
  const articles = rawArticles.filter(article => {
    const url = article.link || (article as any).url
    if (url && seenUrls.has(url)) return false
    if (url) seenUrls.add(url)
    
    const key = (article.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60)
    
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <>
      <h1 className="sr-only">Sports News — Latest Football &amp; MMA Headlines</h1>
      <NewsPageClient initialArticles={articles} />
    </>
  )
}
