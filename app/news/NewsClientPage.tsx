"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, X } from "lucide-react"
import { newsAPI, type NewsArticle as APINewsArticle } from "@/lib/api/news"
import { type NewsArticle, type NewsResponse, type NewsSource } from "@/lib/api/types"
import { NewsCard } from "@/components/news/news-card"
import { NewsFilters } from "@/components/news/news-filters"
import { TrendingNews } from "@/components/news/trending-news"

interface NewsFiltersState {
  category: string | null
  source: string | null
  sortBy: string
}

interface NewsClientPageProps {
  initialNews: NewsResponse
  trendingKeywords: string[]
  sources: NewsSource[]
  searchParams: {
    q?: string
    category?: string
    source?: string
    page?: string
  }
}

export default function NewsClientPage({
  initialNews,
  trendingKeywords: initialTrendingKeywords,
  sources,
  searchParams,
}: NewsClientPageProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialNews.articles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "")
  const [filters, setFilters] = useState<NewsFiltersState>({
    category: searchParams.category || null,
    source: searchParams.source || null,
    sortBy: "publishedAt",
  })
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.page || "1"))
  const [totalResults, setTotalResults] = useState(initialNews.totalResults)
  const [showFilters, setShowFilters] = useState(false)
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(initialTrendingKeywords)

  const articlesPerPage = 12

  const fetchNews = async (page = 1, query = "", filterOptions = filters) => {
    try {
      setLoading(true)
      setError(null)

      const response = await newsAPI.searchNews({
        q: query || "sports",
        category: filterOptions.category || undefined,
        sources: filterOptions.source || undefined,
        sortBy: filterOptions.sortBy as "relevancy" | "popularity" | "publishedAt",
        page,
        pageSize: articlesPerPage,
      })

      if (response && Array.isArray(response.articles)) {
        const typedArticles: NewsArticle[] = response.articles.map((art, idx) => ({
          ...art,
          id: art.id || art.url || `article-${idx}`,
        }))
        setArticles(typedArticles)
        setTotalResults(response.totalResults || 0)
      } else {
        setArticles([])
        setTotalResults(0)
      }
    } catch (err) {
      console.error("Failed to fetch news:", err)
      setError(err instanceof Error ? err.message : "Failed to load news")
      setArticles([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingKeywords = async () => {
    try {
      const trending = await newsAPI.getTrendingSportsNews()
      if (Array.isArray(trending)) {
        // Extract keywords from trending articles
        const keywords = trending
          .flatMap((article) => article.title.split(" "))
          .filter((word) => word.length > 4)
          .slice(0, 10)
        setTrendingKeywords(keywords)
      }
    } catch (err) {
      console.error("Failed to fetch trending keywords:", err)
      setTrendingKeywords([])
    }
  }

  useEffect(() => {
    // Don't fetch on initial load since we have server data
    if (searchParams.q || searchParams.category || searchParams.source) {
      // Only fetch trending keywords on initial load
      fetchTrendingKeywords()
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchNews(1, searchQuery, filters)
  }

  const handleFilterChange = (newFilters: Partial<NewsFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    setCurrentPage(1)
    fetchNews(1, searchQuery, updatedFilters)
  }

  const clearFilter = (filterType: keyof NewsFiltersState) => {
    const clearedFilters = { ...filters }
    if (filterType === "category" || filterType === "source") {
      clearedFilters[filterType] = null
    } else {
      clearedFilters[filterType] = "publishedAt"
    }
    setFilters(clearedFilters)
    setCurrentPage(1)
    fetchNews(1, searchQuery, clearedFilters)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchNews(page, searchQuery, filters)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = Math.ceil(totalResults / articlesPerPage)
  const hasActiveFilters = filters.category || filters.source || filters.sortBy !== "publishedAt"

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-24 md:pt-32 pb-16">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Sports News</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search sports news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </form>

            {/* Filters */}
            {showFilters && (
              <div className="mb-4">
                <NewsFilters filters={filters} onFiltersChange={handleFilterChange} />
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("category")} />
                  </Badge>
                )}
                {filters.source && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Source: {filters.source}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("source")} />
                  </Badge>
                )}
                {filters.sortBy !== "publishedAt" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Sort: {filters.sortBy}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => clearFilter("sortBy")} />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Info */}
          {!loading && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {totalResults > 0
                  ? `Showing ${(currentPage - 1) * articlesPerPage + 1}-${Math.min(currentPage * articlesPerPage, totalResults)} of ${totalResults} results`
                  : "No results found"}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-red-500">Error: {error}</p>
                <Button onClick={() => fetchNews(currentPage, searchQuery, filters)} className="mt-2" variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-48 md:h-full" />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !error && articles.length > 0 && (() => {
            // Final dedup safety net at render level
            const seen = new Set<string>()
            const uniqueArticles = articles.filter((a) => {
              const key = (a.title || '').toLowerCase()
                .replace(/[^a-z0-9]/g, '').slice(0, 40)
              if (!key || seen.has(key)) return false
              seen.add(key)
              return true
            })
            return (
            <div className="space-y-6">
              {uniqueArticles.map((article, index) => (
                <NewsCard key={`${article.url}-${index}`} article={article} />
              ))}
            </div>
            )
          })()}

          {/* No Results */}
          {!loading && !error && articles.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No articles found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({ category: null, source: null, sortBy: "publishedAt" })
                    fetchNews(1, "", { category: null, source: null, sortBy: "publishedAt" })
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <TrendingNews />
        </div>
      </div>
    </div>
  )
}
