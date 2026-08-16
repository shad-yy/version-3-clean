export interface LeagueInfo {
  id: string
  name: string
  country: string
  /**
   * ISO 3166-1 alpha-2, for schema.org addressCountry. Absent for multi-national
   * competitions — omit the property rather than inventing a code for "Europe".
   */
  countryCode?: string
  slug: string
  heroText: string
  primary: string
  secondary: string
  accent: string
  badgeUrl: string
  localBadge: string
}

export const LEAGUES: Record<string, LeagueInfo> = {
  'premier-league': {
    id: '4328',
    name: 'Premier League',
    country: 'England',
    countryCode: 'GB',
    slug: 'premier-league',
    heroText: "The World's Most Watched League",
    primary: '#3d195b',
    secondary: '#00ff87',
    accent: '#e90052',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
    localBadge: '/leagues/premier-league.png',
  },
  'la-liga': {
    id: '4335',
    name: 'La Liga',
    country: 'Spain',
    countryCode: 'ES',
    slug: 'la-liga',
    heroText: 'Home of El Clásico. Home of Magic.',
    primary: '#ff4b44',
    secondary: '#ffd700',
    accent: '#c8102e',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/qjwhxc1617300664.png',
    localBadge: '/leagues/la-liga.png',
  },
  'bundesliga': {
    id: '4331',
    name: 'Bundesliga',
    country: 'Germany',
    countryCode: 'DE',
    slug: 'bundesliga',
    heroText: 'Speed. Passion. German Precision.',
    primary: '#d20515',
    secondary: '#e8192c',
    accent: '#d20515',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/bpct641566986627.png',
    localBadge: '/leagues/bundesliga.png',
  },
  'serie-a': {
    id: '4332',
    name: 'Serie A',
    country: 'Italy',
    countryCode: 'IT',
    slug: 'serie-a',
    heroText: 'The Home of Tactical Masterclasses',
    primary: '#1a56a0',
    secondary: '#ffffff',
    accent: '#008c45',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/serie_a.png',
    localBadge: '/leagues/serie-a.png',
  },
  'ligue-1': {
    id: '4334',
    name: 'Ligue 1',
    country: 'France',
    countryCode: 'FR',
    slug: 'ligue-1',
    heroText: 'Où Naissent les Légendes',
    primary: '#091c3e',
    secondary: '#de1a16',
    accent: '#ffffff',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/ligue1.png',
    localBadge: '/leagues/ligue-1.png',
  },
  'champions-league': {
    id: '4480',
    name: 'UEFA Champions League',
    country: 'Europe',
    slug: 'champions-league',
    heroText: 'The Greatest Club Competition on Earth',
    primary: '#001a4e',
    secondary: '#c8a951',
    accent: '#ffffff',
    badgeUrl: 'https://r2.thesportsdb.com/images/media/league/badge/ucl.png',
    localBadge: '/leagues/champions-league.png',
  }
}

export type LeagueSlug = keyof typeof LEAGUES
