// Shared types for API responses and data structures

export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  author: string | null
  category?: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  totalResults: number
  status?: string
  nextPage?: string
}

export interface NewsSource {
  id: string
  name: string
  description: string
  url: string
  category: string
  language: string
  country: string
}

export interface ApiHealthStatus {
  status: "healthy" | "degraded" | "down"
  responseTime: number
  lastChecked: string
  error?: string
}

export interface ApiMetrics {
  requestCount: number
  errorCount: number
  averageResponseTime: number
  uptime: number
}

export interface Team {
  id: string
  name: string
  logo: string
  country: string
  league?: string
  founded?: number
}

export interface Player {
  id: string
  name: string
  photo: string | null
  team: string
  position: string | null
  nationality: string | null
  age: number | null
}

export interface Fixture {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  league: string
  time: string
  homeLogo: string
  awayLogo: string
  venue: string
}
