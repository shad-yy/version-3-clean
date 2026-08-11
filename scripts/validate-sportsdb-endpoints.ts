/**
 * Comprehensive TheSportsDB v1 Endpoint Validation Script
 * Tests all endpoints documented in Sportsdb API documentation.json
 * Generates detailed report with status codes, response schemas, and fixes
 * 
 * Run: npx tsx scripts/validate-sportsdb-endpoints.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { SPORTSDB_SPEC } from '../lib/data/sportsdb-spec'

const API_KEY = process.env.THESPORTSDB_API_KEY || '123'
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/`

interface EndpointTest {
  name: string
  function: string
  path: string
  params: Record<string, string>
  finalUrl: string
  statusCode: number
  contentType: string
  responseSize: number
  responseBodySample: string
  parsedJsonSchema: { keys: string[]; types: Record<string, string> }
  errorIfAny?: string
  ok: boolean
  fixStatus: string
  correctUsage: string
}

interface ValidationReport {
  baseUrl: string
  apiKey: string
  generatedAt: string
  totalEndpoints: number
  passing: number
  failing: number
  results: EndpointTest[]
  summary: {
    endpoint: string
    status: number
    ok: boolean
    sampleKeys: string[]
    correctUsage: string
    fixStatus: string
  }[]
}

// Sample IDs from documentation (Sportsdb API documentation.json)
const SAMPLE_IDS = {
  leagueId: '4328', // English Premier League
  teamId: '133604', // Arsenal
  playerId: '34146370', // Sample player (may vary)
  eventId: '1032862', // Sample event
  venueId: '16163', // Sample venue
}

const today = new Date().toISOString().split('T')[0]

// Build endpoint list from SPEC to avoid drift
const ENDPOINTS = SPORTSDB_SPEC.endpoints.map((e) => ({
  name: e.id,
  path: e.path.replace(/^\//, ''),
  params:
    e.id === 'search_all_seasons' ? { id: SAMPLE_IDS.leagueId } :
    e.id === 'search_all_teams' ? { l: 'English Premier League' } :
    e.id === 'lookup_all_players' ? { id: SAMPLE_IDS.teamId } :
    e.id === 'searchteams' ? { t: 'Arsenal' } :
    e.id === 'searchplayers' ? { p: 'Cristiano Ronaldo' } :
    e.id === 'searchevents' ? { e: 'Arsenal', s: '2023-2024' } :
    e.id === 'searchvenues' ? { v: 'Emirates Stadium' } :
    e.id === 'search_all_leagues' ? { c: 'England', s: 'Soccer' } :
    e.id === 'lookupleague' ? { id: SAMPLE_IDS.leagueId } :
    e.id === 'lookuptable' ? { l: SAMPLE_IDS.leagueId, s: '2023-2024' } :
    e.id === 'lookupteam' ? { id: SAMPLE_IDS.teamId } :
    e.id === 'lookupequipment' ? { id: SAMPLE_IDS.teamId } :
    e.id === 'lookupplayer' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'lookuphonours' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'lookupformerteams' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'lookupmilestones' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'lookupcontracts' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'playerresults' ? { id: SAMPLE_IDS.playerId } :
    e.id === 'lookupevent' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'eventresults' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'lookuplineup' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'lookuptimeline' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'lookupeventstats' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'lookuptv' ? { id: SAMPLE_IDS.eventId } :
    e.id === 'lookupvenue' ? { id: SAMPLE_IDS.venueId } :
    e.id === 'eventsnext' ? { id: SAMPLE_IDS.teamId } :
    e.id === 'eventslast' ? { id: SAMPLE_IDS.teamId } :
    e.id === 'eventsnextleague' ? { id: SAMPLE_IDS.leagueId } :
    e.id === 'eventspastleague' ? { id: SAMPLE_IDS.leagueId } :
    e.id === 'eventsday' ? { d: today, s: 'Soccer' } :
    e.id === 'eventsseason' ? { id: SAMPLE_IDS.leagueId, s: '2023-2024' } :
    e.id === 'eventstv' ? { d: today, s: 'Soccer', a: 'UK' } :
    e.id === 'eventshighlights' ? { d: today, s: 'Soccer' } :
    {},
}))

async function testEndpoint(endpoint: { name: string; path: string; params: Record<string, string> }): Promise<EndpointTest> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const queryString = new URLSearchParams(endpoint.params).toString()
  const fullPath = queryString ? `${endpoint.path}?${queryString}` : endpoint.path
  const finalUrl = `${BASE_URL}${fullPath}`
  // Cache setup
  const cacheDir = path.join(process.cwd(), 'cache', 'sportsdb')
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true })
  const cacheKey = endpoint.name + '_' + Buffer.from(fullPath).toString('base64').replace(/\W+/g, '') + '.json'
  const cachePath = path.join(cacheDir, cacheKey)

  // Return cached result if exists
  if (fs.existsSync(cachePath)) {
    try {
      const cached: EndpointTest = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      // Ensure finalUrl reflects current BASE_URL
      cached.finalUrl = finalUrl
      return cached
    } catch {}
  }
  
  const startTime = Date.now()
  let statusCode = 0
  let contentType = ''
  let responseSize = 0
  let responseBodySample = ''
  let parsedJsonSchema: { keys: string[]; types: Record<string, string> } = { keys: [], types: {} }
  let errorIfAny: string | undefined

  const tryUrls = [
    finalUrl,
    finalUrl.replace('https://www.thesportsdb.com', 'https://thesportsdb.com'),
    (() => {
      const u = new URL(finalUrl)
      if (!/\/json\//.test(u.pathname)) {
        u.searchParams.set('apikey', API_KEY)
      }
      return u.toString()
    })(),
  ]

  const maxRetries = 3
  let attemptCount = 0
  retryLoop: while (attemptCount < maxRetries) {
    for (const attemptUrl of tryUrls) {
      try {
        const res = await fetch(attemptUrl, {
          headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:120.0)' },
        })
        statusCode = res.status
        contentType = res.headers.get('content-type') || ''
        const text = await res.text()
        responseSize = text.length

        if (statusCode === 429) {
          attemptCount += 1
          if (attemptCount < maxRetries) {
            console.log(`[RETRY] ${endpoint.name} -> 429 rate-limited; waiting 3000ms (attempt ${attemptCount}/${maxRetries})`)
            await sleep(3000)
            continue retryLoop
          }
        }

        try {
          const json = JSON.parse(text)
          responseBodySample = JSON.stringify(json).substring(0, 2000)
          if (json && typeof json === 'object') {
            const firstKey = Object.keys(json)[0]
            const value = (json as any)[firstKey]
            if (Array.isArray(value) && value.length > 0) {
              parsedJsonSchema.keys = Object.keys(value[0])
              parsedJsonSchema.types = Object.fromEntries(parsedJsonSchema.keys.map((k) => [k, typeof value[0][k]]))
            } else if (value && typeof value === 'object') {
              parsedJsonSchema.keys = Object.keys(value)
              parsedJsonSchema.types = Object.fromEntries(parsedJsonSchema.keys.map((k) => [k, typeof (value as any)[k]]))
            }
          }
        } catch (e) {
          responseBodySample = text.substring(0, 300)
          const htmlDir = path.join(process.cwd(), 'logs', 'sportsdb')
          if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir, { recursive: true })
          const fname = endpoint.path.replace(/\W+/g, '_') + '.response.html'
          fs.writeFileSync(path.join(htmlDir, fname), text)
          errorIfAny = 'Invalid JSON or HTML response'
        }
        break retryLoop
      } catch (err) {
        errorIfAny = err instanceof Error ? err.message : String(err)
      }
    }
    // only reached if network errors for all tryUrls; small backoff before next cycle
    attemptCount += 1
    if (attemptCount < maxRetries) {
      console.log(`[RETRY] ${endpoint.name} -> network/parse issue; waiting 3000ms (attempt ${attemptCount}/${maxRetries})`)
      await sleep(3000)
    }
  }

  const ok = statusCode === 200 && !errorIfAny
  let fixStatus = 'valid'
  if (statusCode === 404) {
    fixStatus = 'check-params-or-empty-day'
  } else if (statusCode === 429) {
    fixStatus = 'rate-limited'
  } else if (statusCode !== 200) {
    fixStatus = 'needs-investigation'
  }

  const correctUsage = finalUrl.replace(BASE_URL, '')

  const result: EndpointTest = {
    name: endpoint.name,
    function: endpoint.name,
    path: endpoint.path,
    params: endpoint.params,
    finalUrl,
    statusCode,
    contentType,
    responseSize,
    responseBodySample,
    parsedJsonSchema,
    errorIfAny,
    ok,
    fixStatus,
    correctUsage,
  }

  // Cache successful responses to prevent redundant hits
  try {
    if (result.ok) {
      fs.writeFileSync(cachePath, JSON.stringify(result, null, 2))
    }
  } catch {}

  return result
}

async function main() {
  console.log(`[Validation] Testing ${ENDPOINTS.length} TheSportsDB endpoints...`)
  console.log(`[Validation] Base URL: ${BASE_URL.replace(/(json\/).+?(\/)/, '$1***$2')}`)
  console.log(`[Validation] API Key: ${API_KEY === '123' ? 'FREE TIER (fallback)' : 'SET'}\n`)

  const results: EndpointTest[] = []

  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    
    const status = result.ok ? '✓' : '✗'
    console.log(`${status} ${endpoint.name} -> ${result.statusCode} (${result.responseSize} bytes)`)
    
    if (!result.ok) {
      console.log(`   URL: ${result.finalUrl}`)
      if (result.errorIfAny) console.log(`   Error: ${result.errorIfAny}`)
    }
    
  // Rate limit: 1.5 seconds between requests
  await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  const passing = results.filter((r) => r.ok).length
  const failing = results.length - passing

  const summary = results.map((r) => ({
    endpoint: r.name,
    status: r.statusCode,
    ok: r.ok,
    sampleKeys: r.parsedJsonSchema.keys,
    correctUsage: r.correctUsage,
    fixStatus: r.fixStatus,
  }))

  const report: ValidationReport = {
    baseUrl: BASE_URL,
    apiKey: API_KEY === '1' ? 'FREE_TIER_FALLBACK' : 'SET',
    generatedAt: new Date().toISOString(),
    totalEndpoints: ENDPOINTS.length,
    passing,
    failing,
    results,
    summary,
  }

  // Ensure directories exist
  const logsDir = path.join(process.cwd(), 'logs')
  const reportsDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

  // Write reports
  const reportPath = path.join(reportsDir, 'sportsdb_validation.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  const logPath = path.join(logsDir, 'sportsdb_test_report.json')
  fs.writeFileSync(logPath, JSON.stringify(report, null, 2))

  console.log(`\n[Validation] Complete: ${passing}/${results.length} passing`)
  console.log(`[Validation] Reports written to:`)
  console.log(`  - ${reportPath}`)
  console.log(`  - ${logPath}`)
  // Write concise summary markdown
  const okCount = summary.filter((s) => s.ok).length
  const failCount = summary.length - okCount
  const likelyCauses: Record<string, number> = {}
  results.forEach((r) => {
    if (!r.ok) {
      const cause = r.statusCode === 404 ? 'not-found-or-empty-day' : r.errorIfAny ? 'invalid-json-or-html' : 'other'
      likelyCauses[cause] = (likelyCauses[cause] || 0) + 1
    }
  })
  const summaryMd = [
    `# TheSportsDB Validation Summary`,
    `Date: ${new Date().toISOString()}`,
    ``,
    `- Total endpoints: ${summary.length}`,
    `- Passing: ${okCount}`,
    `- Failing: ${failCount}`,
    `- Likely causes: ${Object.entries(likelyCauses).map(([k,v])=>`${k}=${v}`).join(', ') || 'none'}`,
    ``,
    `## Failures`,
  ]
  results.filter((r)=>!r.ok).forEach((r)=>{
    summaryMd.push(`- ${r.name}: ${r.statusCode} → ${r.correctUsage}`)
  })
  fs.writeFileSync(path.join(reportsDir, 'sportsdb_summary.md'), summaryMd.join('\n'))

  // Print summary table
  console.log('\n=== SUMMARY ===')
  results.forEach((r) => {
    const icon = r.ok ? '✓' : '✗'
    console.log(`${icon} ${r.name.padEnd(25)} ${r.statusCode} ${r.fixStatus}`)
  })
}

main().catch(console.error)

