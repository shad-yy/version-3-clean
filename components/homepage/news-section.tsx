"use client"
import { useState, useEffect } from "react"
import { NewsCarousel } from "./news-carousel"

interface NewsArticle {
  title: string
  description?: string
  image_url?: string
  link?: string
  source_id?: string
  pubDate?: string
  category?: string[]
}

interface NewsSectionProps {
  maxArticles?: number
}

export function NewsSection({ maxArticles = 10 }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    
    fetch('/api/news')
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        const items = data?.articles || data?.results || []
        
        // Deduplicate — use 60-char title key with minimum threshold
        const seen = new Set<string>()
        const unique = items.filter((a: NewsArticle) => {
          const key = (a.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 60)
          // Only dedup if key is substantial enough
          if (key.length < 15) return !!a.title
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        
        setArticles(unique.slice(0, maxArticles))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    
    return () => { cancelled = true }
  }, [maxArticles])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]" />
              </span>
              <span className="text-[#00e676] font-bold text-xs uppercase tracking-widest">Live Feed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Trending Sports News
            </h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i}
              className="flex-none w-[280px] sm:w-[320px] 
                bg-[#12121a] border border-[#2a2a3a] 
                rounded-2xl overflow-hidden">
              <div className="h-44 bg-[#0a0a0f] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-[#1a1a24] rounded animate-pulse" />
                <div className="h-4 w-full bg-[#1a1a24] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[#1a1a24] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!articles.length) return null

  return <NewsCarousel articles={articles} />
}
