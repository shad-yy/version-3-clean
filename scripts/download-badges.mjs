import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// League IDs from the existing constants
const LEAGUE_IDS = {
  'premier-league': '4328',
  'la-liga': '4335',
  'bundesliga': '4331',
  'serie-a': '4332',
  'ligue-1': '4334',
  'champions-league': '4480',
  'europa-league': '4481',
  'world-cup': '4429',
  'formula-1': '4370',
  'ufc': '4443',
}

const dir = join(process.cwd(), 'public', 'leagues')
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

let downloaded = 0
let failed = 0

for (const [slug, id] of Object.entries(LEAGUE_IDS)) {
  const file = `${slug}.png`
  try {
    // Query TheSportsDB API to get the current badge URL
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${id}`
    console.log(`Fetching badge URL for ${slug} (id=${id})...`)
    const apiRes = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    if (!apiRes.ok) {
      console.error(`  ✗ API returned ${apiRes.status} for ${slug}`)
      failed++
      continue
    }
    const json = await apiRes.json()
    const league = json?.leagues?.[0]
    const badgeUrl = league?.strBadge || league?.strLogo
    if (!badgeUrl) {
      console.error(`  ✗ No badge URL found for ${slug}`)
      failed++
      continue
    }
    console.log(`  Found badge: ${badgeUrl}`)

    // Try downloading the badge
    const urls = [
      badgeUrl,
      badgeUrl.replace('www.thesportsdb.com', 'r2.thesportsdb.com'),
      badgeUrl.replace('r2.thesportsdb.com', 'www.thesportsdb.com'),
    ]

    let success = false
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        if (!res.ok) {
          console.log(`    ⋅ ${url} → ${res.status}`)
          continue
        }
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length < 100) {
          console.log(`    ⋅ ${url} → too small (${buf.length}B)`)
          continue
        }
        writeFileSync(join(dir, file), buf)
        console.log(`  ✓ Downloaded ${file} (${(buf.length/1024).toFixed(1)}KB)`)
        downloaded++
        success = true
        break
      } catch (e) {
        console.log(`    ⋅ ${url} → ${e.message}`)
      }
    }
    if (!success) {
      console.error(`  ✗ FAILED to download badge for ${slug}`)
      failed++
    }
  } catch (e) {
    console.error(`  ✗ Error for ${slug}: ${e.message}`)
    failed++
  }
}

console.log(`\nDone. ${downloaded} downloaded, ${failed} failed.`)
console.log('League badges saved to public/leagues/')
