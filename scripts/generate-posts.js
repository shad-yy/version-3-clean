const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure marked to render properly
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Override per deployment: NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_HOST
//
// SITE_HOST previously defaulted to the commercial store's domain, so every absolute
// URL written into public/llms.txt and public/llms-full.txt — the files answer engines
// read first — pointed at a site this project does not own. localhost is an obviously
// wrong value that gets noticed; another company's domain is not.
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Smart Live TV';
const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || 'localhost:3200';

// Local hosts are not served over TLS, so a hardcoded `https://` would write
// unreachable URLs into the generated files whenever SITE_HOST is a dev host.
const SITE_ORIGIN = /^(localhost|127\.0\.0\.1)/.test(SITE_HOST)
  ? `http://${SITE_HOST}`
  : `https://${SITE_HOST}`;

const CONTENT_DIR = path.join(__dirname, '../content/blog');
const OUTPUT_FILE = path.join(__dirname, '../lib/blog/posts.ts');

function getCategory(categoryStr) {
  if (!categoryStr) return 'guides';
  const cat = categoryStr.toLowerCase().trim();
  if (cat.includes('how')) return 'how-to';
  if (cat.includes('comparison') || cat.includes('vs')) return 'comparison';
  if (cat.includes('news')) return 'news';
  return 'guides';
}

// Domain separation guard — the main site must never publish commercial IPTV copy.
// See memory-bank/PATTERNS.md §1 and .cursorrules §2.
const FORBIDDEN = [
  /\biptv\b/i,
  /230[,.]?000/,
  /15[,.]?000\+?\s*(live\s*)?channels/i,
  /£\s?(12|29|54|4\.50)\b/,
  /free\s+24-?hour\s+trial/i,
  /free\s+trial/i,
  /no\s+blackouts/i,
  /no\s+VPN\s+(needed|required)/i,
  // Grey-market device-setup signals. Note: naming the Fire TV / Firestick device is
  // fine — telling readers to install the official ITVX or BBC iPlayer app on one is
  // legitimate broadcast guidance. What is banned is sideloading an unlicensed player.
  /\/setup\/firestick/i,
  /apps?\s+from\s+unknown\s+sources/i,
  /sideload/i,
  /downloader\s+app/i,
  /firestick\s+(setup|install)/i,
  // Commercial funnel routes that now live on the store domain.
  /\]\(\/(pricing|buy|free-trial|setup\/[a-z-]+)\)/i,
  /smartlivetv-store\.com/i,
];

function assertDomainCompliant(label, text) {
  const hits = FORBIDDEN.filter((re) => re.test(text)).map((re) => re.source);
  if (hits.length) {
    console.error(`\n❌ DOMAIN SEPARATION VIOLATION in ${label}`);
    console.error(`   Matched forbidden patterns: ${hits.join(', ')}`);
    console.error(`   Fix the source file in content/blog/ — do not edit generated output.\n`);
    process.exit(1);
  }
}

function generate() {
  console.log('Generating posts from MDX...');
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory ${CONTENT_DIR} does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.mdx'));
  const posts = [];
  const skipped = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const slug = file.replace(/\.mdx$/, '');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContent);

    // Drafts are retained in the repo but never published, never validated, and never
    // added to the sitemap. Used for expired fixture guides awaiting conversion into
    // result reports — see reports/implementation-plan-2026-07-31.md Fix 27.
    if (data.draft === true) {
      skipped.push(slug);
      continue;
    }

    // Convert markdown content to HTML and sanitize IPTV commercial links to domain-compliant URLs
    let htmlContent = marked.parse(content);
    htmlContent = htmlContent
      .replace(/href="\/free-trial"/g, 'href="/scores"')
      .replace(/href="\/pricing"/g, 'href="/scores"')
      .replace(/href="\/setup\/firestick"/g, 'href="/watch"');

    // Validate the RAW source, not the rewritten HTML — the href rewrites above would
    // otherwise mask commercial link targets that still need fixing at source.
    assertDomainCompliant(
      `content/blog/${file}`,
      `${data.title || ''} ${data.description || ''} ${data.metaDescription || ''} ${(data.tags || []).join(' ')} ${content}`
    );

    // Calculate reading time
    const words = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    posts.push({
      slug,
      title: data.title || '',
      description: data.description || '',
      category: getCategory(data.category),
      publishedAt: data.date || new Date().toISOString().slice(0, 10),
      readTime: data.readTime || readTime,
      featured: typeof data.featured === 'boolean' ? data.featured : false,
      metaTitle: data.metaTitle || null,
      content: htmlContent
    });
  }

  // Sort posts by date descending
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const code = `// AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
// Run "npm run generate-posts" or build to regenerate from content/blog/

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: "how-to" | "guides" | "news" | "comparison"
  publishedAt: string
  readTime: number
  featured: boolean
  content: string
  metaTitle?: string
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, code, 'utf-8');
  console.log(`Successfully generated ${posts.length} posts to ${OUTPUT_FILE}`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} draft post(s): ${skipped.join(', ')}`);
  }

  generateLlmsIndex(posts);
  generateLlmsFull(posts);
}

/**
 * Generates public/llms.txt — the short index answer engines read first.
 *
 * Generated rather than hand-written because it was hardcoding a domain that now
 * belongs to a different property, telling AI crawlers this content lived there.
 *
 * Content rules:
 *  - Describe only what the site actually has today. Do not announce planned
 *    verticals as if they exist.
 *  - Broadcast coverage is per country and comes from lib/data/broadcast-rights.ts.
 *    Never claim a country or competition that file does not cover.
 *  - No single-market framing. This site is not UK-only.
 */
function generateLlmsIndex(posts) {
  const file = path.join(__dirname, '../public/llms.txt');
  const base = SITE_ORIGIN;

  const blogLines = posts
    .map((p) => `- [${p.title}](${base}/blog/${p.slug}): ${p.description}`)
    .join('\n');

  const content = `# ${SITE_NAME}

> ${SITE_NAME} (${SITE_HOST}) answers one question: where and how can I watch this?
> It publishes live football scores, fixtures, league standings, team and player
> statistics, and the broadcast listings that show which service carries a given
> competition in a given country.

## Core pages
- [Home](${base}/): Live scores, today's fixtures, standings and sports news.
- [Live Scores](${base}/scores): Real-time football scores and results.
- [Leagues](${base}/leagues): Tables, fixtures and results for major competitions.
- [Teams](${base}/teams): Club profiles, squads and fixture histories.
- [Players](${base}/players): Player profiles and season statistics.
- [Fixtures & Results](${base}/events): Full fixture calendar and results archive.
- [Sports News](${base}/news): Football and MMA headlines updated daily.
- [Blog](${base}/blog): Editorial guides on fixtures, competitions and broadcast schedules.
- [FAQ](${base}/faq): Common questions about scores, fixtures and broadcast listings.

## Competition guides
Each guide carries the fixture list, standings where applicable, and the broadcast
listing for the countries we have verified.

- [Premier League](${base}/watch/premier-league)
- [Champions League](${base}/watch/champions-league)
- [Europa League](${base}/watch/europa-league)
- [La Liga](${base}/watch/la-liga)
- [Serie A](${base}/watch/serie-a)
- [Bundesliga](${base}/watch/bundesliga)
- [Ligue 1](${base}/watch/ligue-1)
- [Formula 1](${base}/watch/formula-1)
- [UFC](${base}/ufc)
- [World Cup 2026](${base}/watch/world-cup-2026): Results and broadcast archive.

## Editorial guides
${blogLines}

## Notes
- Audience is international. Content is not restricted to any single country.
- Data sources: TheSportsDB (scores, fixtures, standings, teams, players) and
  NewsData.io (news).
- Broadcast listings name the official rights holder for each country covered, and
  each competition record carries the date it was last verified. Where a country is
  not covered, no claim is made for it.
- ${SITE_NAME} does not sell, resell or provide access to any television or
  streaming subscription, and does not host or transmit video.
- Full-text corpus: ${base}/llms-full.txt
`;

  assertDomainCompliant('public/llms.txt', content);
  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Successfully generated public/llms.txt`);
}

function generateLlmsFull(posts) {
  const llmsFullFile = path.join(__dirname, '../public/llms-full.txt');
  
  let content = `# ${SITE_NAME} — Sports Telemetry & Broadcast Information Directory
> This is a comprehensive, full-text resource detailing live sports scores, real-time match telemetry, fixture schedules, and sports editorial coverage on ${SITE_NAME}.

---

## 1. About ${SITE_NAME}
${SITE_NAME} (${SITE_HOST}) is a real-time sports telemetry and live match data platform serving an international audience, with no single-market focus.
- **Core Features:** Live football scores, match statistics, team lineups, league standings, and broadcast schedule guides by country for Premier League, Champions League, Europa League, UFC, Formula 1, and World Cup 2026.
- **Data Coverage:** Real-time event updates across global leagues and competitions via official sports data providers (TheSportsDB for scores, fixtures, standings, teams and players; NewsData.io for news).
- **Broadcast Listings:** Name the official rights holder per country covered, each with the date it was last verified. No claim is made for countries not covered. ${SITE_NAME} does not sell or provide television subscriptions.

---

## 2. Frequently Asked Questions (FAQ)

### What data does ${SITE_NAME} provide?
${SITE_NAME} provides real-time scores, match statistics, head-to-head records, official line-ups, and per-country broadcast schedule information for major football leagues, UFC, and Motorsport.

### Where can I check live match scores?
Visit ${SITE_HOST}/scores for live real-time score updates across all ongoing matches.

---

## 3. Full Articles & Guides
`;

  for (const post of posts) {
    const filePath = path.join(CONTENT_DIR, `${post.slug}.mdx`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { content: rawMarkdown } = matter(fileContent);
      
      content += `\n### Article: ${post.title}\n`;
      content += `**Published Date:** ${post.publishedAt} | **Category:** ${post.category}\n`;
      content += `**Description:** ${post.description}\n\n`;
      content += `${rawMarkdown}\n`;
      content += `\n---\n`;
    }
  }

  assertDomainCompliant('public/llms-full.txt', content);
  fs.writeFileSync(llmsFullFile, content, 'utf-8');
  console.log(`Successfully generated public/llms-full.txt with ${posts.length} articles`);
}

generate();
