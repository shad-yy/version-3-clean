// Route configuration and validation
export const ROUTES = {
  // Main navigation routes
  HOME: "/",
  SCORES: "/scores",
  LEAGUES: "/leagues",
  TEAMS: "/teams",
  PLAYERS: "/players",
  EVENTS: "/events",
  NEWS: "/news",
  UFC: "/ufc",
  WATCH: "/watch",
  FAVORITES: "/favorites",
  SEARCH: "/search",

  // Dynamic routes
  TEAM_DETAIL: (id: string) => `/teams/${id}`,
  PLAYER_DETAIL: (id: string) => `/players/${id}`,
  LEAGUE_DETAIL: (id: string) => `/leagues/${id}`,
  EVENT_DETAIL: (id: string) => `/events/${id}`,

  // Admin routes
  ADMIN_API_HEALTH: "/admin/api-health",
  ADMIN_API_MANAGEMENT: "/admin/api-management",

  // Info routes
  INFO_PAGE: (slug: string) => `/${slug}`,
} as const

// Validate that all navigation routes exist
export const NAVIGATION_ROUTES = [
  ROUTES.HOME,
  ROUTES.SCORES,
  ROUTES.LEAGUES,
  ROUTES.TEAMS,
  ROUTES.PLAYERS,
  ROUTES.EVENTS,
  ROUTES.NEWS,
  ROUTES.UFC,
  ROUTES.WATCH,
  ROUTES.FAVORITES,
] as const

// Route metadata for SEO and navigation
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: "Sightline",
    description: "Your ultimate destination for live sports scores, news, and updates",
  },
  [ROUTES.SCORES]: {
    title: "Live Scores & Results",
    description: "Real-time football scores and match results",
  },
  [ROUTES.LEAGUES]: {
    title: "Football Leagues",
    description: "Explore the world's top football leagues and competitions",
  },
  [ROUTES.TEAMS]: {
    title: "Football Teams",
    description: "Discover teams from the world's top football leagues",
  },
  [ROUTES.PLAYERS]: {
    title: "Football Players",
    description: "Find player profiles and statistics",
  },
  [ROUTES.EVENTS]: {
    title: "Football Events",
    description: "Live matches, fixtures, and results from around the world",
  },
  [ROUTES.NEWS]: {
    title: "Sports News",
    description: "Stay updated with the latest sports news and breaking stories",
  },
  [ROUTES.UFC]: {
    title: "UFC Coverage",
    description: "Latest UFC events, fighter rankings, and fight results",
  },
  [ROUTES.SEARCH]: {
    title: "Search Sports Content",
    description: "Find teams, players, leagues, events, and news",
  },
  [ROUTES.WATCH]: {
    title: "Watch Now — Live Channels",
    description: "Browse and stream live sports channels from around the world",
  },
  [ROUTES.FAVORITES]: {
    title: "My Favorites",
    description: "Your saved teams, leagues, events, and channels",
  },
} as const

// Helper function to validate route exists
export function isValidRoute(path: string): boolean {
  return Object.values(ROUTES).some((route) => (typeof route === "string" ? route === path : false))
}

// Helper function to get route metadata
export function getRouteMetadata(path: string) {
  return (
    ROUTE_METADATA[path as keyof typeof ROUTE_METADATA] || {
      title: "Sightline",
      description: "Sports Hub",
    }
  )
}
