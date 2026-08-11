// Common types used across the application

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Team Types
export interface Team {
  id: string
  name: string
  shortName?: string
  logo?: string
  founded?: number
  venue?: string
  country?: string
  league?: string
  description?: string
}

// Player Types
export interface Player {
  id: string
  name: string
  position?: string
  age?: number
  nationality?: string
  team?: string
  photo?: string
  height?: string
  weight?: string
}

// League Types
export interface League {
  id: string
  name: string
  country?: string
  logo?: string
  season?: string
  type?: string
}

// Fixture/Event Types
export interface Fixture {
  id: string
  referee?: string
  timezone: string
  date: string
  timestamp: number
  periods?: {
    first?: number
    second?: number
  }
  venue?: {
    id?: string
    name?: string
    city?: string
  }
  status: {
    long: string
    short: string
    elapsed?: number
  }
  league: League
  teams: {
    home: Team
    away: Team
  }
  goals: {
    home?: number
    away?: number
  }
  score?: {
    halftime?: {
      home?: number
      away?: number
    }
    fulltime?: {
      home?: number
      away?: number
    }
    extratime?: {
      home?: number
      away?: number
    }
    penalty?: {
      home?: number
      away?: number
    }
  }
}

// Unified Event Interface
export interface UnifiedEvent {
  id: string
  homeTeam: string
  awayTeam: string
  homeLogo?: string
  awayLogo?: string
  homeScore?: number
  awayScore?: number
  date: string
  time: string
  status: string
  league: string
  venue?: string
  isLive: boolean
}

// Standing Types
export interface Standing {
  rank: number
  team: Team
  points: number
  goalsDiff: number
  group?: string
  form?: string
  status?: string
  description?: string
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  home: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  away: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  update: string
}

// Statistics Types
export interface TeamStatistics {
  league: League
  team: Team
  form?: string
  fixtures: {
    played: {
      home: number
      away: number
      total: number
    }
    wins: {
      home: number
      away: number
      total: number
    }
    draws: {
      home: number
      away: number
      total: number
    }
    loses: {
      home: number
      away: number
      total: number
    }
  }
  goals: {
    for: {
      total: {
        home: number
        away: number
        total: number
      }
      average: {
        home: string
        away: string
        total: string
      }
    }
    against: {
      total: {
        home: number
        away: number
        total: number
      }
      average: {
        home: string
        away: string
        total: string
      }
    }
  }
  biggest: {
    streak: {
      wins: number
      draws: number
      loses: number
    }
    wins: {
      home?: string
      away?: string
    }
    loses: {
      home?: string
      away?: string
    }
    goals: {
      for: {
        home: number
        away: number
      }
      against: {
        home: number
        away: number
      }
    }
  }
  clean_sheet: {
    home: number
    away: number
    total: number
  }
  failed_to_score: {
    home: number
    away: number
    total: number
  }
  penalty: {
    scored: {
      total: number
      percentage: string
    }
    missed: {
      total: number
      percentage: string
    }
    total: number
  }
  lineups: Array<{
    formation: string
    played: number
  }>
  cards: {
    yellow: {
      [key: string]: {
        total: number
        percentage: string
      }
    }
    red: {
      [key: string]: {
        total: number
        percentage: string
      }
    }
  }
}

// News Types
export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  author?: string
  content?: string
  category?: string
}

export interface NewsFilters {
  category?: string | null
  source?: string | null
  search?: string
  page?: number
  limit?: number
}

// UFC Types - Enhanced
export interface UFCEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'Upcoming' | 'Live' | 'Past' | 'Cancelled';
  mainEvent?: string;
  url?: string;
  image?: string;
  fights?: UFCFight[];
}

export interface UFCFighter {
  id: string; // Can be slug or ID
  name: string;
  nickname?: string;
  record?: string; // e.g., "27-1-0 (1 NC)"
  weightClass?: string;
  ranking?: string;
  country?: string;
  photo?: string;
  url?: string;
  age?: number;
  height?: string;
  reach?: string;
  weight?: string;
  stats?: {
    wins: number;
    losses: number;
    draws: number;
    koTko: number;
    submissions: number;
    decisions: number;
    height?: string;
    weight?: string;
    reach?: string;
    legReach?: string;
    stance?: string;
    dob?: string;
  };
  fightHistory?: Array<{
    opponent: string;
    result: "Win" | "Loss" | "Draw";
    method: string;
    date: string;
    event?: string;
  }>;
  bio?: string;
}

export interface UFCFight {
  id: string;
  fighter1: { name: string; url?: string };
  fighter2: { name: string; url?: string };
  weightClass: string;
  isMainEvent: boolean;
  isTitleFight?: boolean;
  cardSegment?: 'Main Card' | 'Prelims' | 'Early Prelims';
  result?: string | null;
}

// TheSportsDB specific types
export interface SportsDbEvent {
  idEvent: string
  strEvent: string
  strEventAlternate?: string
  strFilename?: string
  strSport: string
  idLeague: string
  strLeague: string
  strSeason: string
  strDescriptionEN?: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore?: string
  intAwayScore?: string
  intRound?: string
  strOfficial?: string
  strTimestamp?: string
  dateEvent: string
  strDate?: string
  strTime?: string
  strTimeLocal?: string
  strTVStation?: string
  idHomeTeam: string
  idAwayTeam: string
  strResult?: string
  strVenue?: string
  strCountry?: string
  strCity?: string
  strPoster?: string
  strSquare?: string
  strFanart?: string
  strThumb?: string
  strBanner?: string
  strMap?: string
  strTweet1?: string
  strTweet2?: string
  strTweet3?: string
  strVideo?: string
  strStatus?: string
  strPostponed?: string
  strLocked?: string
  dateEventLocal?: string
  strCapacity?: string
  intSpectators?: number
}

export interface SportsDbEventStat {
  idEvent: string
  strStat: string
  intHome?: number
  intAway?: number
  strTeam: string
  intStat: number
}

export interface SportsDbLineupPlayer {
  idPlayer: string
  idTeam: string
  strTeam: string
  strPlayer: string
  strPosition: string
  intSquadNumber: number
  strCutout?: string
  strThumb?: string
}

export interface SportsDbEventTimeline {
  idTimeline: string
  idEvent: string
  strTimeline?: string
  strTimelineDetail?: string
  strHome?: string
  strEvent: string
  strPlayer?: string
  strAssist?: string
  strTime?: string
  strTeam?: string
  strComment?: string
}

export interface SportsDbTeam {
  idTeam: string
  strTeam: string
  strTeamShort?: string
  strAlternate?: string
  intFormedYear?: string
  strSport: string
  strLeague: string
  idLeague: string
  strManager?: string
  strStadium?: string
  strKeywords?: string
  strRSS?: string
  strStadiumThumb?: string
  strStadiumDescription?: string
  strStadiumLocation?: string
  intStadiumCapacity?: string
  strWebsite?: string
  strFacebook?: string
  strTwitter?: string
  strInstagram?: string
  strDescriptionEN?: string
  strCountry?: string
  strTeamBadge?: string
  strTeamJersey?: string
  strTeamLogo?: string
  strTeamFanart1?: string
  strTeamFanart2?: string
  strTeamFanart3?: string
  strTeamFanart4?: string
  strTeamBanner?: string
  strYoutube?: string
  strLocked?: string
}

export interface SportsDbPlayer {
  idPlayer: string
  strPlayer: string
  strTeam?: string
  strSport: string
  strDescriptionEN?: string
  strPlayerThumb?: string
  strCutout?: string
  strRender?: string
  strThumb?: string
  strFanart1?: string
  strFanart2?: string
  strFanart3?: string
  strFanart4?: string
  strCreativeCommons?: string
  strLocked?: string
  dateBorn?: string
  strNationality?: string
  strHeight?: string
  strWeight?: string
  intSoccerXMLTeamID?: string
  intLoved?: string
  strPosition?: string
  strCollege?: string
  strFacebook?: string
  strWebsite?: string
  strTwitter?: string
  strInstagram?: string
  strYoutube?: string
  strKit?: string
  strAgent?: string
  strBirthLocation?: string
  strEthnicity?: string
  strStatus?: string
  strSigning?: string
  strWage?: string
  strOutfitter?: string
  strGender?: string
  strSide?: string
}

// API Football types
export interface ApiFootballFixture {
  fixture: {
    id: number
    referee?: string
    timezone: string
    date: string
    timestamp: number
    periods: {
      first?: number
      second?: number
    }
    venue: {
      id?: number
      name?: string
      city?: string
    }
    status: {
      long: string
      short: string
      elapsed?: number
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag?: string
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner?: boolean
    }
    away: {
      id: number
      name: string
      logo: string
      winner?: boolean
    }
  }
  goals: {
    home?: number
    away?: number
  }
  score: {
    halftime: {
      home?: number
      away?: number
    }
    fulltime: {
      home?: number
      away?: number
    }
    extratime: {
      home?: number
      away?: number
    }
    penalty: {
      home?: number
      away?: number
    }
  }
}

// Unified Sports API types (abstraction layer)
export interface UnifiedFixture {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  date: string
  time: string
  status: string
  league: string
  venue?: string
  isLive: boolean
  homeLogo?: string
  awayLogo?: string
}

export interface UnifiedTeam {
  id: string
  name: string
  logo?: string
  country?: string
  founded?: number
  venue?: string
  description?: string
}

export interface UnifiedPlayer {
  id: string
  name: string
  position?: string
  age?: number
  nationality?: string
  team?: string
  photo?: string
}

// Search types
export interface SearchResult {
  type: 'team' | 'player' | 'league' | 'event'
  id: string
  title: string
  subtitle?: string
  image?: string
  url: string
}

// Filter types
export interface SportFilters {
  league?: string
  team?: string
  date?: string
  status?: string
}

// API Health types
export interface ApiEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  category: string
  isActive: boolean
  lastChecked?: string
  responseTime?: number
  status?: 'healthy' | 'unhealthy' | 'unknown'
  errorMessage?: string
}

export interface ApiHealthStatus {
  endpoint: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  responseTime: number
  timestamp: string
  error?: string
}

// Cache Types
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// Error Types
export interface APIError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface NewsletterForm {
  email: string
  preferences?: string[]
}

// Component Props Types
export interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

// LazyImage component removed - use OptimizedImage instead
// export interface LazyImageProps extends OptimizedImageProps {
//   loading?: "lazy" | "eager"
//   onLoad?: () => void
//   onError?: () => void
// }

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error"

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FilterOptions {
  league?: string
  team?: string
  player?: string
  date?: string
  status?: string
  country?: string
  position?: string
}

export interface SortOptions {
  field: string
  direction: "asc" | "desc"
}
