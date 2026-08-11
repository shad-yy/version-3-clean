// Sport-specific theme utilities
// Each sport gets its own color scheme and visual identity

export type SportType = 
  | "Soccer" 
  | "Football" 
  | "Basketball" 
  | "Tennis" 
  | "Baseball" 
  | "Ice Hockey" 
  | "American Football"
  | "Motorsport"
  | "F1"
  | "Formula 1"
  | "Cricket"
  | "Rugby"
  | "Golf"
  | "Boxing"
  | "UFC"
  | "MMA"
  | "Volleyball"
  | "Handball"
  | "Other"

export interface SportTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  gradient: string
  border: string
  text: string
  icon?: string
  pattern?: string
  description: string
}

export const SPORT_THEMES: Record<string, SportTheme> = {
  Soccer: {
    name: "Soccer",
    primary: "from-green-600 to-green-800",
    secondary: "bg-green-500/20",
    accent: "text-green-400",
    background: "bg-green-950/30",
    gradient: "bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-700/20",
    border: "border-green-500/30",
    text: "text-green-100",
    pattern: "grass",
    description: "The beautiful game with green pitches and passionate fans",
  },
  Football: {
    name: "Football",
    primary: "from-green-600 to-green-800",
    secondary: "bg-green-500/20",
    accent: "text-green-400",
    background: "bg-green-950/30",
    gradient: "bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-700/20",
    border: "border-green-500/30",
    text: "text-green-100",
    pattern: "grass",
    description: "The beautiful game with green pitches and passionate fans",
  },
  Basketball: {
    name: "Basketball",
    primary: "from-orange-600 to-red-600",
    secondary: "bg-orange-500/20",
    accent: "text-orange-400",
    background: "bg-orange-950/30",
    gradient: "bg-gradient-to-br from-orange-900/40 via-red-800/30 to-orange-700/20",
    border: "border-orange-500/30",
    text: "text-orange-100",
    pattern: "court",
    description: "Fast-paced action on the hardwood",
  },
  Tennis: {
    name: "Tennis",
    primary: "from-blue-500 to-cyan-500",
    secondary: "bg-blue-500/20",
    accent: "text-blue-400",
    background: "bg-blue-950/30",
    gradient: "bg-gradient-to-br from-blue-900/40 via-cyan-800/30 to-blue-700/20",
    border: "border-blue-500/30",
    text: "text-blue-100",
    pattern: "court",
    description: "Elegant matches on pristine courts",
  },
  Baseball: {
    name: "Baseball",
    primary: "from-blue-700 to-blue-900",
    secondary: "bg-blue-500/20",
    accent: "text-blue-400",
    background: "bg-blue-950/30",
    gradient: "bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-700/20",
    border: "border-blue-500/30",
    text: "text-blue-100",
    pattern: "diamond",
    description: "America's pastime on the diamond",
  },
  "Ice Hockey": {
    name: "Ice Hockey",
    primary: "from-cyan-500 to-blue-600",
    secondary: "bg-cyan-500/20",
    accent: "text-cyan-400",
    background: "bg-cyan-950/30",
    gradient: "bg-gradient-to-br from-cyan-900/40 via-blue-800/30 to-cyan-700/20",
    border: "border-cyan-500/30",
    text: "text-cyan-100",
    pattern: "ice",
    description: "Fast-paced action on the ice",
  },
  "American Football": {
    name: "American Football",
    primary: "from-amber-600 to-orange-600",
    secondary: "bg-amber-500/20",
    accent: "text-amber-400",
    background: "bg-amber-950/30",
    gradient: "bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-700/20",
    border: "border-amber-500/30",
    text: "text-amber-100",
    pattern: "field",
    description: "Gridiron action and touchdowns",
  },
  Motorsport: {
    name: "Motorsport",
    primary: "from-red-600 to-red-800",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-red-950/30",
    gradient: "bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-700/20",
    border: "border-red-500/30",
    text: "text-red-100",
    pattern: "track",
    description: "High-speed racing and precision",
  },
  F1: {
    name: "Formula 1",
    primary: "from-red-600 to-red-800",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-red-950/30",
    gradient: "bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-700/20",
    border: "border-red-500/30",
    text: "text-red-100",
    pattern: "track",
    description: "The pinnacle of motorsport",
  },
  "Formula 1": {
    name: "Formula 1",
    primary: "from-red-600 to-red-800",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-red-950/30",
    gradient: "bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-700/20",
    border: "border-red-500/30",
    text: "text-red-100",
    pattern: "track",
    description: "The pinnacle of motorsport",
  },
  Cricket: {
    name: "Cricket",
    primary: "from-emerald-600 to-green-700",
    secondary: "bg-emerald-500/20",
    accent: "text-emerald-400",
    background: "bg-emerald-950/30",
    gradient: "bg-gradient-to-br from-emerald-900/40 via-green-800/30 to-emerald-700/20",
    border: "border-emerald-500/30",
    text: "text-emerald-100",
    pattern: "pitch",
    description: "The gentleman's game on the pitch",
  },
  Rugby: {
    name: "Rugby",
    primary: "from-yellow-600 to-orange-600",
    secondary: "bg-yellow-500/20",
    accent: "text-yellow-400",
    background: "bg-yellow-950/30",
    gradient: "bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-yellow-700/20",
    border: "border-yellow-500/30",
    text: "text-yellow-100",
    pattern: "field",
    description: "Physical intensity on the field",
  },
  Golf: {
    name: "Golf",
    primary: "from-emerald-500 to-green-600",
    secondary: "bg-emerald-500/20",
    accent: "text-emerald-400",
    background: "bg-emerald-950/30",
    gradient: "bg-gradient-to-br from-emerald-900/40 via-green-800/30 to-emerald-700/20",
    border: "border-emerald-500/30",
    text: "text-emerald-100",
    pattern: "course",
    description: "Precision on the green",
  },
  Boxing: {
    name: "Boxing",
    primary: "from-red-700 to-red-900",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-red-950/30",
    gradient: "bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-700/20",
    border: "border-red-500/30",
    text: "text-red-100",
    pattern: "ring",
    description: "The sweet science in the ring",
  },
  UFC: {
    name: "UFC",
    primary: "from-red-800 to-black",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-black/50",
    gradient: "bg-gradient-to-br from-red-900/60 via-black/80 to-red-800/40",
    border: "border-red-500/50",
    text: "text-red-100",
    pattern: "octagon",
    description: "The ultimate fighting championship",
  },
  MMA: {
    name: "MMA",
    primary: "from-red-800 to-black",
    secondary: "bg-red-500/20",
    accent: "text-red-400",
    background: "bg-black/50",
    gradient: "bg-gradient-to-br from-red-900/60 via-black/80 to-red-800/40",
    border: "border-red-500/50",
    text: "text-red-100",
    pattern: "octagon",
    description: "Mixed martial arts action",
  },
  Volleyball: {
    name: "Volleyball",
    primary: "from-blue-500 to-cyan-500",
    secondary: "bg-blue-500/20",
    accent: "text-blue-400",
    background: "bg-blue-950/30",
    gradient: "bg-gradient-to-br from-blue-900/40 via-cyan-800/30 to-blue-700/20",
    border: "border-blue-500/30",
    text: "text-blue-100",
    pattern: "court",
    description: "Dynamic action on the court",
  },
  Handball: {
    name: "Handball",
    primary: "from-blue-600 to-purple-600",
    secondary: "bg-blue-500/20",
    accent: "text-blue-400",
    background: "bg-blue-950/30",
    gradient: "bg-gradient-to-br from-blue-900/40 via-purple-800/30 to-blue-700/20",
    border: "border-blue-500/30",
    text: "text-blue-100",
    pattern: "court",
    description: "Fast-paced court action",
  },
  Other: {
    name: "Other",
    primary: "from-gray-600 to-gray-800",
    secondary: "bg-gray-500/20",
    accent: "text-gray-400",
    background: "bg-gray-950/30",
    gradient: "bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-700/20",
    border: "border-gray-500/30",
    text: "text-gray-100",
    description: "Various sports and competitions",
  },
}

export function getSportTheme(sport: string | null | undefined): SportTheme {
  if (!sport) return SPORT_THEMES.Other
  
  const normalizedSport = sport.trim()
  
  // Direct match
  if (SPORT_THEMES[normalizedSport]) {
    return SPORT_THEMES[normalizedSport]
  }
  
  // Case-insensitive match
  const lowerSport = normalizedSport.toLowerCase()
  for (const [key, theme] of Object.entries(SPORT_THEMES)) {
    if (key.toLowerCase() === lowerSport) {
      return theme
    }
  }
  
  // Partial match
  for (const [key, theme] of Object.entries(SPORT_THEMES)) {
    if (lowerSport.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerSport)) {
      return theme
    }
  }
  
  return SPORT_THEMES.Other
}

export function getSportThemeClasses(sport: string | null | undefined) {
  const theme = getSportTheme(sport)
  return {
    card: `bg-gradient-to-br ${theme.gradient} border ${theme.border}`,
    button: `bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white`,
    badge: `${theme.secondary} ${theme.accent} border ${theme.border}`,
    text: theme.accent,
    background: theme.background,
  }
}

