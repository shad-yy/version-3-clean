export interface Channel {
  id: string
  name: string
  category: ChannelCategory
  logo: string
  description: string
  streamUrl: string
  isLive: boolean
  viewers: number
  language: string
}

export type ChannelCategory =
  | "football"
  | "basketball"
  | "ufc"
  | "tennis"
  | "boxing"
  | "motorsport"
  | "cricket"
  | "entertainment"
  | "news"

export const CHANNEL_CATEGORIES: { value: ChannelCategory | "all"; label: string }[] = [
  { value: "all", label: "All Channels" },
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "ufc", label: "UFC / MMA" },
  { value: "tennis", label: "Tennis" },
  { value: "boxing", label: "Boxing" },
  { value: "motorsport", label: "Motorsport" },
  { value: "cricket", label: "Cricket" },
  { value: "entertainment", label: "Entertainment" },
  { value: "news", label: "News" },
]

export const channels: Channel[] = [
  {
    id: "sky-sports-pl",
    name: "Sky Sports Premier League",
    category: "football",
    logo: "https://www.thesportsdb.com/images/media/league/badge/i6o0q01683355320.png/small",
    description: "Live Premier League coverage, highlights, and analysis.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 45200,
    language: "English",
  },
  {
    id: "bt-sport-ucl",
    name: "BT Sport Champions League",
    category: "football",
    logo: "https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png/small",
    description: "UEFA Champions League live matches and studio shows.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 38700,
    language: "English",
  },
  {
    id: "la-liga-tv",
    name: "La Liga TV",
    category: "football",
    logo: "https://www.thesportsdb.com/images/media/league/badge/7onmyv1534768460.png/small",
    description: "Spanish La Liga live action and matchday coverage.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 12300,
    language: "Spanish",
  },
  {
    id: "serie-a-pass",
    name: "Serie A Pass",
    category: "football",
    logo: "https://www.thesportsdb.com/images/media/league/badge/ocy2fe1566216901.png/small",
    description: "Italian Serie A live football, highlights and analysis.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 9800,
    language: "Italian",
  },
  {
    id: "bundesliga-live",
    name: "Bundesliga Live",
    category: "football",
    logo: "https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png/small",
    description: "German Bundesliga live football and matchday experiences.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 7400,
    language: "German",
  },
  {
    id: "ufc-fight-pass",
    name: "UFC Fight Pass",
    category: "ufc",
    logo: "https://www.thesportsdb.com/images/media/league/badge/ro2wo91683355307.png/small",
    description: "Live UFC events, Fight Night, and exclusive content.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 62100,
    language: "English",
  },
  {
    id: "ufc-prelims",
    name: "UFC Prelims",
    category: "ufc",
    logo: "https://www.thesportsdb.com/images/media/league/badge/ro2wo91683355307.png/small",
    description: "Prelim card coverage for UFC Fight Nights and PPVs.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 18400,
    language: "English",
  },
  {
    id: "nba-league-pass",
    name: "NBA League Pass",
    category: "basketball",
    logo: "https://www.thesportsdb.com/images/media/league/badge/flaborz1706539498.png/small",
    description: "Live NBA games from all 30 teams.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 31500,
    language: "English",
  },
  {
    id: "euroleague-tv",
    name: "EuroLeague TV",
    category: "basketball",
    logo: "https://www.thesportsdb.com/images/media/league/badge/fl adorz1706539498.png/small",
    description: "European basketball at its finest — live EuroLeague coverage.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 5200,
    language: "English",
  },
  {
    id: "tennis-channel",
    name: "Tennis Channel",
    category: "tennis",
    logo: "https://www.thesportsdb.com/images/media/league/badge/eys4m81682969353.png/small",
    description: "ATP, WTA, and Grand Slam tournaments live.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 14800,
    language: "English",
  },
  {
    id: "dazn-boxing",
    name: "DAZN Boxing",
    category: "boxing",
    logo: "https://www.thesportsdb.com/images/media/league/badge/7dqzl41679956338.png/small",
    description: "World championship boxing, fight nights, and analysis.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 22100,
    language: "English",
  },
  {
    id: "f1-tv-pro",
    name: "F1 TV Pro",
    category: "motorsport",
    logo: "https://www.thesportsdb.com/images/media/league/badge/b774d91684932898.png/small",
    description: "Formula 1 live races, practice, qualifying, and onboard cams.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 41200,
    language: "English",
  },
  {
    id: "sky-sports-cricket",
    name: "Sky Sports Cricket",
    category: "cricket",
    logo: "https://www.thesportsdb.com/images/media/league/badge/lv05hz1686744093.png/small",
    description: "International and domestic cricket live from around the world.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 8900,
    language: "English",
  },
  {
    id: "sports-news-24",
    name: "Sports News 24/7",
    category: "news",
    logo: "",
    description: "Round-the-clock sports news, transfers, and breaking stories.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: true,
    viewers: 6300,
    language: "English",
  },
  {
    id: "sports-entertainment",
    name: "Sports Entertainment",
    category: "entertainment",
    logo: "",
    description: "Documentaries, behind-the-scenes, and sports lifestyle content.",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isLive: false,
    viewers: 3200,
    language: "English",
  },
]

export function getChannelsByCategory(category: ChannelCategory | "all"): Channel[] {
  if (category === "all") return channels
  return channels.filter((ch) => ch.category === category)
}

export function getChannelById(id: string): Channel | undefined {
  return channels.find((ch) => ch.id === id)
}
