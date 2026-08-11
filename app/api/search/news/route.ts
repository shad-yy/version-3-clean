import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

/** Nuclear dedup — catches duplicates across URL, title, image, description */
function nuclearDedup(articles: any[]): any[] {
  if (!articles?.length) return []
  const seen = new Map<string, boolean>()
  return articles.filter(article => {
    if (!article) return false
    const url = (article.link || article.url || '').trim()
    const title = (article.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
    const img = (article.image_url || article.urlToImage || '').split('?')[0].trim()
    const desc = (article.description || article.content || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    const keys = [
      url && `url:${url}`,
      title && title.length > 10 && `title:${title}`,
      img && `img:${img}`,
      desc && desc.length > 20 && `desc:${desc}`,
    ].filter(Boolean) as string[]
    const isDuplicate = keys.some(k => seen.has(k))
    if (isDuplicate) return false
    keys.forEach(k => seen.set(k, true))
    return true
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || "sports"
  try {
    const rawArticles = await getLatestSportsNews(q, 5)
    const deduped = nuclearDedup(rawArticles)
    return NextResponse.json({ status: "success", articles: deduped, totalResults: deduped.length })
  } catch (error) {
    return NextResponse.json({ status: "error", articles: [], totalResults: 0 }, { status: 500 })
  }
}
