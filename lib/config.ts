/**
 * Centralized API configuration
 * All API base URLs and keys are loaded from environment variables
 * Security: RISK-002 - Eliminate hardcoded URLs and keys
 */

import { ENV } from "@/lib/config/env"

// API Base URLs - using NEXT_PUBLIC_* for client-side access
export const API_CONFIG = {
  thesportsdb: {
    baseUrl: process.env.NEXT_PUBLIC_THESPORTSDB_API_BASE_URL || "/api",
    apiKey: ENV.THESPORTSDB_KEY, // Server-side only
  },
  newsdata: {
    baseUrl: process.env.NEXT_PUBLIC_NEWSDATA_API_BASE_URL || "https://newsdata.io/api/1",
    apiKey: ENV.NEWS_API_KEY, // Server-side only
  },
  ufc: {
    baseUrl: process.env.NEXT_PUBLIC_UFC_API_BASE_URL || "https://www.ufc.com",
  },
} as const

// Allowed domains for API endpoint testing (SSRF protection)
export const ALLOWED_DOMAINS = [
  "thesportsdb.com",
  "www.thesportsdb.com",
  "r2.thesportsdb.com",
  "newsdata.io",
  "ufc.com",
  "www.ufc.com",
] as const

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per IP
} as const

// Response size limits
export const RESPONSE_LIMITS = {
  maxSizeBytes: 1024 * 1024, // 1 MB
  timeoutMs: 10000, // 10 seconds
} as const

// Batch testing limits
export const BATCH_LIMITS = {
  maxBatchSize: 50,
  minDelayMs: 1000,
} as const

// League and team configuration - Updated with TheSportsDB IDs
// Source: TheSportsDB API all_leagues.php endpoint
export const POPULAR_LEAGUE_IDS = ["4328", "4335", "4331", "4332", "4334"] as const // Premier League (4328), La Liga (4335), Bundesliga (4331), Serie A (4332), Ligue 1 (4334)

export const POPULAR_TEAM_IDS = [
  "133602", // Manchester United
  "133613", // Liverpool
  "133615", // Arsenal
  "133616", // Chelsea
  "133617", // Manchester City
  "133618", // Tottenham
  "133619", // Barcelona
  "133620", // Real Madrid
  "133621", // Bayern Munich
  "133622", // PSG
] as const

export const QUICK_LEAGUE_FILTERS = [
  { id: "4328", name: "English Premier League", country: "England" },
  { id: "4335", name: "Spanish La Liga", country: "Spain" },
  { id: "4331", name: "German Bundesliga", country: "Germany" },
  { id: "4332", name: "Italian Serie A", country: "Italy" },
  { id: "4334", name: "French Ligue 1", country: "France" },
] as const

export const POPULAR_LEAGUES = [
  {
    id: "4328",
    name: "English Premier League",
    country: "England",
    logo: null,
    description: "England's top football division",
    popularity: "Very High",
    tier: "Tier 1",
    teams: 20,
    founded: "1992",
  },
  {
    id: "4335",
    name: "Spanish La Liga",
    country: "Spain",
    logo: null,
    description: "Spain's top football division",
    popularity: "Very High",
    tier: "Tier 1",
    teams: 20,
    founded: "1929",
  },
  {
    id: "4331",
    name: "German Bundesliga",
    country: "Germany",
    logo: null,
    description: "Germany's top football division",
    popularity: "Very High",
    tier: "Tier 1",
    teams: 18,
    founded: "1963",
  },
  {
    id: "4332",
    name: "Italian Serie A",
    country: "Italy",
    logo: null,
    description: "Italy's top football division",
    popularity: "Very High",
    tier: "Tier 1",
    teams: 20,
    founded: "1929",
  },
  {
    id: "4334",
    name: "French Ligue 1",
    country: "France",
    logo: null,
    description: "France's top football division",
    popularity: "High",
    tier: "Tier 1",
    teams: 20,
    founded: "1932",
  },
] as const

export const OTHER_LEAGUES = [
  {
    id: "203",
    name: "Eredivisie",
    country: "Netherlands",
    logo: null,
    tier: "Tier 2",
  },
  {
    id: "201",
    name: "Primeira Liga",
    country: "Portugal",
    logo: null,
    tier: "Tier 2",
  },
  {
    id: "169",
    name: "MLS",
    country: "USA",
    logo: null,
    tier: "Tier 2",
  },
] as const

export const PLAYER_POSITIONS = [
  { value: "all", label: "All Positions" },
  { value: "Goalkeeper", label: "Goalkeeper" },
  { value: "Defender", label: "Defender" },
  { value: "Midfielder", label: "Midfielder" },
  { value: "Forward", label: "Forward" },
] as const

export function getPopularityColor(popularity: string): string {
  switch (popularity.toLowerCase()) {
    case "very high":
      return "bg-red-500"
    case "high":
      return "bg-orange-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}
