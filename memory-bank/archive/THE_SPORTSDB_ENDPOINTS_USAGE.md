# TheSportsDB v1 Endpoint Usage Mapping

**Source**: `Sportsdb API documentation.json`  
**Generated**: 2025-11-06  
**Purpose**: Complete mapping of TheSportsDB endpoints to application usage, with citations from documentation

---

## Critical Fixes Applied

### ❌ REMOVED: `livescore.php` (Does Not Exist)
**Documentation Citation**: Line 32 - "No 'livescore.php' endpoint in v1 — do not call it."

**Replaced With**:
- `eventsday.php?d={today}&s={Sport}` - For today's live events
- `eventsnext.php?id={teamId}` - Next team events
- `eventslast.php?id={teamId}` - Last team events
- `eventsnextleague.php?id={leagueId}` - Next league events

**Files Changed**:
- `lib/api/the-sports-db.ts` - `liveScore()` function now uses `eventsday.php`
- `lib/api/unified-sports-api.ts` - `getLiveFixtures()` and `getFixtures({live: true})` use `eventsDay()`
- `app/scores/ScoresPageClient.tsx` - Uses `getLiveFixtures()` which now calls correct endpoint

---

## Endpoint Mapping by Page/Feature

### Homepage (`/`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `all_sports.php` | List supported sports | 37-46 |
| `all_leagues.php` | Top leagues widget | 59-68 |
| `eventsday.php?d={today}` | Today's events widget | 433-446 |

### Scores Page (`/scores`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `eventsday.php?d={YYYY-MM-DD}&s={Sport}` | Daily events (replaces livescore.php) | 433-446 |
| `eventsnext.php?id={teamId}` | Next team fixtures | 367-378 |
| `eventslast.php?id={teamId}` | Recent team results | 380-391 |
| `eventsnextleague.php?id={leagueId}` | Upcoming league matches | 393-404 |
| `eventspastleague.php?id={leagueId}` | Past league results | 406-417 |

### Leagues Page (`/leagues`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `all_leagues.php` | Master league list | 59-68 |
| `search_all_leagues.php?c={Country}&s={Sport}` | Filtered leagues | 70-82 |
| `lookupleague.php?id={leagueId}` | League details | 153-164 |
| `lookuptable.php?l={leagueId}&s={season}` | Standings table | 448-460 |
| `eventsseason.php?id={leagueId}&s={season}` | Season schedule | 419-431 |
| `search_all_seasons.php?id={leagueId}` | Available seasons | 84-97 |

### Teams Page (`/teams/[id]`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `lookupteam.php?id={teamId}` | Team profile | 153-164 |
| `lookup_all_players.php?id={teamId}` | Team roster | 179-190 |
| `eventsnext.php?id={teamId}` | Upcoming fixtures | 367-378 |
| `eventslast.php?id={teamId}` | Recent results | 380-391 |
| `lookupequipment.php?id={teamId}` | Team kits | 475-486 |
| `search_all_teams.php?l={leagueName}` | Teams in league | 99-112 |

**Note**: `search_all_teams.php` requires **league NAME**, not numeric ID. Implementation in `lib/api/unified-sports-api.ts` first calls `lookupLeague()` to get name, then queries teams.

### Players Page (`/players/[id]`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `lookupplayer.php?id={playerId}` | Player profile | 166-177 |
| `searchplayers.php?p={playerName}` | Player search | 127-138 |
| `playerresults.php?id={playerId}` | Match history | 244-255 |
| `lookuphonours.php?id={playerId}` | Trophies/awards | 192-203 |
| `lookupformerteams.php?id={playerId}` | Career history | 205-216 |
| `lookupmilestones.php?id={playerId}` | Career milestones | 218-229 |
| `lookupcontracts.php?id={playerId}` | Contract info | 231-242 |

### Events Page (`/events/[id]`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `lookupevent.php?id={eventId}` | Event details | 257-268 |
| `eventresults.php?id={eventId}` | Match results | 270-281 |
| `lookuplineup.php?id={eventId}` | Team lineups | 283-294 |
| `lookuptimeline.php?id={eventId}` | Play-by-play | 296-307 |
| `lookupeventstats.php?id={eventId}` | Match statistics | 309-320 |
| `lookuptv.php?id={eventId}` | Broadcast info | 322-333 |
| `eventhighlights.php?id={eventId}` | Highlight videos | Media section |

### Search Page (`/search`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `searchteams.php?t={teamName}` | Team search | 114-125 |
| `searchplayers.php?p={playerName}` | Player search | 127-138 |
| `searchevents.php?e={eventTitle}&s={season}&d={date}` | Event search | 501-515 |

### TV Schedule (`/tv`)
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `eventstv.php?d={date}&s={sport}&a={country}&c={channel}` | TV listings | 335-350 |

### Highlights/Videos
| Endpoint | Usage | Documentation Line |
|----------|-------|-------------------|
| `eventshighlights.php?d={date}&l={leagueId}&s={sport}` | Daily highlights | 352-365 |
| `eventhighlights.php?id={eventId}` | Event highlights | Media section |

---

## Implementation Files

### Core API Client
- **File**: `lib/api/the-sports-db.ts`
- **Functions**: All endpoint wrappers
- **Request Wrapper**: `sportsdbFetch()` - Logs URLs with masked keys, handles errors

### Unified API Layer
- **File**: `lib/api/unified-sports-api.ts`
- **Purpose**: Transforms TheSportsDB responses to app's unified data structures
- **Key Transformations**:
  - `transformLeague()` - Maps `SportsDbLeague` → `UnifiedLeague`
  - `transformTeam()` - Maps `SportsDbTeam` → `UnifiedTeam`
  - `transformPlayer()` - Maps `SportsDbPlayer` → `UnifiedPlayer`
  - `transformFixture()` - Maps `SportsDbEvent` → `UnifiedFixture`
  - `transformStandings()` - Maps `SportsDbTable[]` → `UnifiedStanding[]`

### Environment Configuration
- **File**: `lib/env.ts`
- **Changes**:
  - `JWT_SECRET` now defaults to `"dev"` in development (prevents blocking)
  - `THESPORTSDB_API_KEY` optional, falls back to `"1"` (free tier)
  - Logs warnings when keys not set

---

## Common Gotchas Fixed

### 1. League ID vs League Name
**Problem**: `search_all_teams.php` expects league **name**, not numeric ID.

**Fix**: `lib/api/unified-sports-api.ts` `getTeams()`:
```typescript
// First lookup league to get name
const league = await theSportsDB.lookupLeague(leagueId)
if (league?.strLeague) {
  // Then query teams by name
  const teams = await theSportsDB.searchAllTeams({ league: league.strLeague })
}
```

**Documentation Citation**: Line 110 - Example uses `l=English_Premier_League` (name, not ID)

### 2. Season Format
**Required Format**: `YYYY-YYYY` (e.g., `2023-2024`)

**Used In**:
- `lookuptable.php?l={leagueId}&s={season}`
- `eventsseason.php?id={leagueId}&s={season}`

**Documentation Citation**: Line 30 - "Season format when required: 'YYYY-YYYY'"

### 3. Date Format
**Required Format**: `YYYY-MM-DD` (ISO date)

**Used In**:
- `eventsday.php?d={YYYY-MM-DD}`
- `eventstv.php?d={YYYY-MM-DD}`
- `eventshighlights.php?d={YYYY-MM-DD}`

**Documentation Citation**: Line 444 - Example: `d=2014-10-10`

### 4. API Key in URL Path
**Pattern**: `https://www.thesportsdb.com/api/v1/json/{API_KEY}/endpoint.php`

**Implementation**: `lib/api/the-sports-db.ts`
```typescript
const API_KEY = process.env.THESPORTSDB_API_KEY || '123'
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/`
```

**Documentation Citation**: Line 15 - Base URL template

---

## Request Logging & Debugging

All requests are logged with masked API keys:
```
[TheSportsDB] REQUEST https://www.thesportsdb.com/api/v1/json/***1***/all_sports.php
```

On 404 errors, full URL is logged:
```
[TheSportsDB] eventsday.php => 404 (No data found or invalid endpoint)
[TheSportsDB] Final URL: https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=2025-11-06&s=Soccer
```

---

## Validation & Testing

### Validation Script
**File**: `scripts/validate-sportsdb-endpoints.ts`

**Runs**: Tests all 40+ endpoints with sample parameters

**Outputs**:
- `reports/sportsdb-endpoint-report.json` - Full validation report
- `logs/sportsdb_test_report.json` - Detailed test results

**Run**: `npx tsx scripts/validate-sportsdb-endpoints.ts`

---

## Environment Variables

### Required (Development)
```bash
JWT_SECRET=dev  # Defaults to "dev" if not set in dev mode
```

### Optional
```bash
THESPORTSDB_API_KEY=1  # Defaults to "1" (free tier) if not set
```

### Production
```bash
JWT_SECRET=<your-secret>  # Required in production
THESPORTSDB_API_KEY=<your-key>  # Optional, defaults to free tier
```

---

## Rate Limits

**Free Tier**: 30 requests/minute  
**Premium**: 100 requests/minute  
**Business**: 120 requests/minute

**Documentation Citation**: Lines 23-25

**Implementation**: 1-second delay between requests in validation script. In-memory cache with TTL for production use.

---

## Endpoint Status Summary

After fixes:
- ✅ All documented endpoints implemented
- ✅ `livescore.php` removed (doesn't exist)
- ✅ Request wrapper with logging added
- ✅ JWT_SECRET dev fallback added
- ✅ League name lookup fixed for `search_all_teams.php`
- ✅ Error handling improved with structured responses

---

## Next Steps for Developer

1. **Set Environment Variables**:
   ```bash
   echo "JWT_SECRET=dev" >> .env.local
   echo "THESPORTSDB_API_KEY=1" >> .env.local
   ```

2. **Run Validation**:
   ```bash
   npx tsx scripts/validate-sportsdb-endpoints.ts
   ```

3. **Check Reports**:
   - Review `reports/sportsdb-endpoint-report.json`
   - Check `logs/sportsdb_test_report.json` for detailed results

4. **Test Pages**:
   - `/leagues` - Should show real league data
   - `/teams/[id]` - Should show team details
   - `/players/[id]` - Should show player profiles
   - `/scores` - Should show today's events (or empty state if none)
   - `/events/[id]` - Should show event details

5. **Monitor Logs**:
   - Check console for `[TheSportsDB]` log messages
   - Verify URLs are correctly formatted
   - Watch for 404s and investigate if they occur

---

**Last Updated**: 2025-11-06  
**Documentation Source**: `Sportsdb API documentation.json`

