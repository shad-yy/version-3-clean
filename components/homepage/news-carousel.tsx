"use client"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Newspaper } from "lucide-react"
import Link from 'next/link'

interface NewsArticle {
  title: string
  description?: string | null
  image_url?: string | null
  urlToImage?: string
  link?: string
  url?: string
  source_id?: string | null
  source?: { name: string }
  source_name?: string | null
  pubDate?: string
  publishedAt?: string
  category?: string[] | null
  article_id?: string
}

interface NewsCarouselProps {
  articles: NewsArticle[]
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NewsCarousel({ articles }: NewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!articles?.length) return null

  return (
    <div className="relative">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-sl-text">
            Trending Sports News
          </h2>
          <p className="text-sl-mute text-sm mt-0.5">
            Stay updated with the latest stories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/news"
            className="text-xs font-semibold text-[var(--sl-amber)] hover:underline mr-2 hidden sm:block"
          >
            View All News →
          </Link>
          {/* Prev button */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              canScrollPrev
                ? 'border-[var(--sl-line)] hover:border-[var(--sl-amber)]/40 text-sl-text cursor-pointer'
                : 'border-[var(--sl-raise)] text-sl-dim cursor-not-allowed'
            }`}
            aria-label="Previous news"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Next button */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              canScrollNext
                ? 'border-[var(--sl-line)] hover:border-[var(--sl-amber)]/40 text-sl-text cursor-pointer'
                : 'border-[var(--sl-raise)] text-sl-dim cursor-not-allowed'
            }`}
            aria-label="Next news"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel viewport — overflow-hidden prevents layout shifts */}
      <div ref={emblaRef} className="overflow-hidden -mx-1">
        <div className="flex gap-4 px-1">
          {articles.map((article, i) => {
            const img = article.image_url || article.urlToImage
            const source =
              article.source_id ||
              article.source_name ||
              article.source?.name ||
              'Sports News'
            const date = timeAgo(article.pubDate || article.publishedAt)
            const cat = article.category?.[0] || 'Football'

            // Safe href construction
            const articleHref = (() => {
              const raw = article.link || article.url || ''
              if (!raw || raw === '#') return '/news'
              // For internal paths, use directly
              if (raw.startsWith('/')) return raw
              // For external URLs, verify it is a valid URL
              try {
                const url = new URL(raw)
                if (!['http:', 'https:'].includes(url.protocol)) {
                  return '/news'
                }
                return raw
              } catch {
                return '/news'
              }
            })()

            const isExternal = articleHref.startsWith('http')

            const cardContent = (
              <div className="block bg-[var(--sl-surface)] border border-[var(--sl-line)] rounded-2xl overflow-hidden hover:border-[var(--sl-amber)]/30 transition-all duration-200 h-full">
                {/* Image — fixed height prevents CLS */}
                <div className="relative h-44 bg-[var(--sl-ground)] overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={article.title}
                      width={320}
                      height={176}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--sl-surface)]">
                      <Newspaper className="w-10 h-10 opacity-20" aria-hidden="true" />
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-[var(--sl-amber)] text-black text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    {cat}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2 text-[11px] text-sl-mute">
                    <span className="font-semibold uppercase tracking-wide truncate max-w-[120px]">
                      {source}
                    </span>
                    {date && <span>{date}</span>}
                  </div>
                  <h3 className="font-bold text-sl-text text-sm leading-snug line-clamp-3 mb-3 group-hover:text-[var(--sl-amber)] transition-colors">
                    {article.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sl-mute group-hover:text-[var(--sl-amber)] transition-colors">
                    Read Article
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )

            return (
              <div
                key={article.article_id || `${articleHref}-${i}`}
                className="flex-none w-[280px] sm:w-[320px] group"
              >
                {isExternal ? (
                  <a
                    href={articleHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link href={articleHref} className="block h-full">
                    {cardContent}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile "View All" */}
      <div className="text-center mt-4 sm:hidden">
        <Link href="/news" className="text-xs font-semibold text-[var(--sl-amber)]">
          View All News →
        </Link>
      </div>
    </div>
  )
}
