// Search indexing and caching utility
import type { UnifiedLeague, UnifiedTeam, UnifiedPlayer, UnifiedFixture } from "@/lib/api/unified-sports-api"

export interface SearchIndex {
  leagues: Map<string, UnifiedLeague>
  teams: Map<string, UnifiedTeam>
  players: Map<string, UnifiedPlayer>
  events: Map<string, UnifiedFixture>
  lastUpdated: number
}

class SearchIndexer {
  private index: SearchIndex = {
    leagues: new Map(),
    teams: new Map(),
    players: new Map(),
    events: new Map(),
    lastUpdated: 0,
  }

  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim()
  }

  private matches(query: string, text: string): boolean {
    const normalizedQuery = this.normalizeQuery(query)
    const normalizedText = text.toLowerCase()
    return normalizedText.includes(normalizedQuery)
  }

  indexLeagues(leagues: UnifiedLeague[]) {
    leagues.forEach((league) => {
      this.index.leagues.set(league.id, league)
    })
    this.index.lastUpdated = Date.now()
  }

  indexTeams(teams: UnifiedTeam[]) {
    teams.forEach((team) => {
      this.index.teams.set(team.id, team)
    })
    this.index.lastUpdated = Date.now()
  }

  indexPlayers(players: UnifiedPlayer[]) {
    players.forEach((player) => {
      this.index.players.set(player.id, player)
    })
    this.index.lastUpdated = Date.now()
  }

  indexEvents(events: UnifiedFixture[]) {
    events.forEach((event) => {
      this.index.events.set(event.id, event)
    })
    this.index.lastUpdated = Date.now()
  }

  search(query: string, limit: number = 10): {
    leagues: UnifiedLeague[]
    teams: UnifiedTeam[]
    players: UnifiedPlayer[]
    events: UnifiedFixture[]
  } {
    const normalizedQuery = this.normalizeQuery(query)
    if (!normalizedQuery) {
      return { leagues: [], teams: [], players: [], events: [] }
    }

    const results = {
      leagues: [] as UnifiedLeague[],
      teams: [] as UnifiedTeam[],
      players: [] as UnifiedPlayer[],
      events: [] as UnifiedFixture[],
    }

    // Search leagues
    for (const league of this.index.leagues.values()) {
      if (
        this.matches(query, league.name) ||
        this.matches(query, league.country) ||
        this.matches(query, league.sport)
      ) {
        results.leagues.push(league)
        if (results.leagues.length >= limit) break
      }
    }

    // Search teams
    for (const team of this.index.teams.values()) {
      if (
        this.matches(query, team.name) ||
        this.matches(query, team.country) ||
        (team.league && this.matches(query, team.league))
      ) {
        results.teams.push(team)
        if (results.teams.length >= limit) break
      }
    }

    // Search players
    for (const player of this.index.players.values()) {
      if (
        this.matches(query, player.name) ||
        (player.nationality && this.matches(query, player.nationality)) ||
        (player.team && this.matches(query, player.team))
      ) {
        results.players.push(player)
        if (results.players.length >= limit) break
      }
    }

    // Search events
    for (const event of this.index.events.values()) {
      if (
        this.matches(query, event.homeTeam) ||
        this.matches(query, event.awayTeam) ||
        this.matches(query, event.league)
      ) {
        results.events.push(event)
        if (results.events.length >= limit) break
      }
    }

    return results
  }

  isStale(): boolean {
    return Date.now() - this.index.lastUpdated > this.CACHE_DURATION
  }

  clear() {
    this.index.leagues.clear()
    this.index.teams.clear()
    this.index.players.clear()
    this.index.events.clear()
    this.index.lastUpdated = 0
  }

  getStats() {
    return {
      leagues: this.index.leagues.size,
      teams: this.index.teams.size,
      players: this.index.players.size,
      events: this.index.events.size,
      lastUpdated: this.index.lastUpdated,
    }
  }
}

export const searchIndexer = new SearchIndexer()

