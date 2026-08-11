// Test script for TheSportsDB API
// Run with: node scripts/test-the-sportsdb.ts

import { readFileSync } from 'fs'
import { join } from 'path'

// Polyfill fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY || '123'}/`

let requestCount = 0
let lastRequestTime = Date.now()

async function makeRequest(endpoint: string): Promise<any> {
  // Rate limiting: 30 req/min
  const now = Date.now()
  if (now - lastRequestTime < 2000) {
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  lastRequestTime = Date.now()
  requestCount++

  try {
    const url = `${BASE_URL}${endpoint}`
    const res = await fetch(url)
    if (!res.ok) {
      return { error: `HTTP ${res.status}` }
    }
    const json = await res.json()
    const firstKey = Object.keys(json)[0]
    return json[firstKey] ?? []
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

async function testEndpoint(name: string, endpoint: string): Promise<void> {
  const result = await makeRequest(endpoint)
  if (result.error) {
    console.log(`[API TEST] ${name} → ERROR: ${result.error}`)
  } else {
    const count = Array.isArray(result) ? result.length : result ? 1 : 0
    const itemName = Array.isArray(result) && result.length > 0 && result[0].strTeam 
      ? result[0].strTeam 
      : Array.isArray(result) && result.length > 0 && result[0].strLeague
      ? result[0].strLeague
      : Array.isArray(result) && result.length > 0 && result[0].strSport
      ? result[0].strSport
      : ''
    console.log(`[API TEST] ${name} → OK (${count}${itemName ? `, sample: ${itemName}` : ''})`)
  }
}

async function main() {
  console.log('Testing TheSportsDB API endpoints...\n')

  // General data
  await testEndpoint('all_sports', 'all_sports.php')
  await testEndpoint('all_leagues', 'all_leagues.php')
  await testEndpoint('all_countries', 'all_countries.php')

  // Live scores
  await testEndpoint('livescore(Soccer)', 'livescore.php?sport=Soccer')

  // Search
  await testEndpoint("searchteams('Arsenal')", 'searchteams.php?t=Arsenal')

  // Lookup
  await testEndpoint('lookupteam(133604)', 'lookupteam.php?id=133604')

  // Events
  const today = new Date().toISOString().split('T')[0]
  await testEndpoint(`eventsday(${today})`, `eventsday.php?d=${today}`)

  console.log(`\nTotal requests: ${requestCount}`)
  console.log('Testing complete.')
}

main().catch(console.error)

