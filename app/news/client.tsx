"use client"

import { useMemo, useState } from "react"
import { Clock, ExternalLink } from "lucide-react"
import type { NewsArticle } from "@/lib/api/news"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

const TABS = [
  { key: "all", label: "All" },
  { key: "football", label: "Football" },
  { key: "mma", label: "MMA" },
  { key: "combat", label: "Combat Sports" },
  { key: "transfer", label: "Transfer News" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function formatDate(pubDate?: string) {
  if (!pubDate) return "Recent"
  return new Date(pubDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getArticleBucket(article: NewsArticle): Exclude<TabKey, "all"> {
  const cats = (article.category || []).map((c) => c.toLowerCase())
  const title = (article.title || "").toLowerCase()
  const desc = (article.description || "").toLowerCase()
  const haystack = `${cats.join(" ")} ${title} ${desc}`

  if (haystack.includes("transfer") || cats.includes("transfers")) return "transfer"
  if (haystack.includes("ufc") || haystack.includes("mma")) return "mma"
  if (haystack.includes("boxing") || haystack.includes("kickboxing") || haystack.includes("combat")) return "combat"
  return "football"
}

function CategoryBadge({ tab }: { tab: Exclude<TabKey, "all"> }) {
  const colors: Record<Exclude<TabKey, "all">, string> = {
    football: "bg-blue-600 text-white",
    mma: "bg-red-600 text-white",
    combat: "bg-orange-500 text-black",
    transfer: "bg-purple-600 text-white",
  }
  const labelMap: Record<Exclude<TabKey, "all">, string> = {
    football: "Football",
    mma: "MMA",
    combat: "Combat Sports",
    transfer: "Transfer News",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[tab]}`}>
      {labelMap[tab]}
    </span>
  )
}

function ArticleMeta({ article }: { article: NewsArticle }) {
  const dateStr = formatDate(article.pubDate)
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="font-medium text-blue-400">{article.source_name || "News"}</span>
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {dateStr}
      </span>
    </div>
  )
}

function ImageOrGradient({
  imageUrl,
  alt,
  className,
}: {
  imageUrl?: string | null
  alt?: string
  className?: string
}) {
  return (
    <div
      className={[
        "relative overflow-hidden",
        imageUrl ? "bg-gray-900" : "bg-gradient-to-br from-gray-900 via-gray-950 to-black",
        className || "",
      ].join(" ")}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt || "Sports news image"}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
    </div>
  )
}

interface NewsPageClientProps {
  initialArticles: NewsArticle[]
}

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  const filtered = useMemo(() => {
    if (activeTab === "all") return initialArticles
    return initialArticles.filter((a) => getArticleBucket(a) === activeTab)
  }, [initialArticles, activeTab])

  const hero = filtered[0]
  const featured = filtered.slice(1, 3)
  const rest = filtered.slice(3)

  return (
    <main className="min-h-screen bg-background pt-28 md:pt-36 pb-16 md:pb-20">
      <FadeIn>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 border-t border-white/10 pt-4 mb-6">
            The Sports Desk
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
                Latest Sports Headlines
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                Football, transfers, and fight news—curated into a clean newspaper layout.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border",
                activeTab === t.key
                  ? "bg-green-500 text-black border-green-500"
                  : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!hero ? (
          <div className="text-center py-20 text-gray-500">
            <p>No articles found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero */}
            <a
              href={hero.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative rounded-2xl border border-border overflow-hidden">
                <ImageOrGradient imageUrl={hero.image_url} alt={hero.title} className="h-[320px] md:h-[420px]" />
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3">
                    <CategoryBadge tab={getArticleBucket(hero)} />
                    <ArticleMeta article={hero} />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
                    {hero.title}
                  </h2>
                  {hero.description ? (
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 max-w-3xl">
                      {hero.description}
                    </p>
                  ) : null}
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-400">
                    <span>Open story</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>

            {/* Featured row */}
            {featured.length > 0 ? (
              <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((a) => (
                  <a
                    key={a.article_id}
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="rounded-2xl border border-border overflow-hidden bg-surface hover:bg-surface-elevated transition-colors">
                      <ImageOrGradient imageUrl={a.image_url} alt={a.title} className="h-44" />
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <CategoryBadge tab={getArticleBucket(a)} />
                          <ArticleMeta article={a} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-text-primary mb-2 leading-snug line-clamp-2 group-hover:text-green-400 transition-colors">
                          {a.title}
                        </h3>
                        {a.description ? (
                          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                            {a.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </a>
                ))}
              </StaggerIn>
            ) : null}

            {/* Newspaper grid */}
            {rest.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 border-t border-white/10 pt-4 mb-6">
                  More stories
                </p>
                <StaggerIn className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                  {rest.map((a) => (
                    <a
                      key={a.article_id}
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block py-4 border-b border-white/10 hover:border-white/20 transition-colors"
                    >
                      <h4 className="font-bold tracking-tight text-text-primary leading-snug line-clamp-2 group-hover:text-green-400 transition-colors">
                        {a.title}
                      </h4>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                        <span className="truncate">{a.source_name || "News"}</span>
                        <span className="shrink-0">{formatDate(a.pubDate)}</span>
                      </div>
                    </a>
                  ))}
                </StaggerIn>
              </div>
            ) : null}
          </div>
        )}
      </div>
      </FadeIn>
    </main>
  )
}
