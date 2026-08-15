import sharp from 'sharp'
import { writeFileSync, readFileSync } from 'fs'

/**
 * Generates the site-wide Open Graph card.
 *
 * This image is the single most widely-seen asset on the site: it is referenced
 * as `openGraph.images`, `twitter.images` and the Organization JSON-LD `logo.url`,
 * so it is what Google, X, Facebook, LinkedIn and Slack render for EVERY URL on
 * the domain.
 *
 * Because it is a PNG, no text search can audit it. A previous version shipped
 * "15,000+ Channels · 4K · Free Trial" in rendered pixels and survived multiple
 * text-based audits that all reported the site clean.
 *
 * Rules for this file:
 *  - Never state a channel count, a price, or a trial offer.
 *  - Never make a claim here that is not true on the page.
 *  - Brand text is env-driven so it follows the domain when one is chosen.
 *
 * Regenerate with: node scripts/generate-og.mjs
 */

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Smart Live TV'
const TAGLINE = process.env.NEXT_PUBLIC_OG_TAGLINE || 'Where to watch, wherever you are'

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <text x="600" y="300" font-family="${FONT_STACK}" font-size="96" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${escapeXml(SITE_NAME)}</text>
  <text x="600" y="420" font-family="${FONT_STACK}" font-size="44" font-weight="600" fill="#00e676" text-anchor="middle" dominant-baseline="middle">${escapeXml(TAGLINE)}</text>
</svg>
`

// The SVG is also served publicly at /og-default.svg, so it must be written out
// alongside the PNG — a stale SVG is as damaging as a stale PNG.
writeFileSync('./public/og-default.svg', svg, 'utf-8')

await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile('./public/og-default.png')

// Guard: fail loudly if a forbidden claim ever creeps back into the source text.
const FORBIDDEN = [/\d[\d,.]*\s*\+?\s*channels/i, /free\s+trial/i, /£|\$|€/, /\biptv\b/i]
const combined = `${SITE_NAME} ${TAGLINE}`
const hit = FORBIDDEN.find((re) => re.test(combined))
if (hit) {
  console.error(`\nOG text violates content rules (matched ${hit}): "${combined}"\n`)
  process.exit(1)
}

console.log(`OG image generated: public/og-default.png`)
console.log(`  ${SITE_NAME} — ${TAGLINE}`)
