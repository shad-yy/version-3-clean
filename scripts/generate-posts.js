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
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Smart Live TV';
const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || 'smartlivetv.co.uk';

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

  generateLlmsFull(posts);
}

function generateLlmsFull(posts) {
  const llmsFullFile = path.join(__dirname, '../public/llms-full.txt');
  
  let content = `# ${SITE_NAME} — Sports Telemetry & Broadcast Information Directory
> This is a comprehensive, full-text resource detailing live sports scores, real-time match telemetry, fixture schedules, and sports editorial coverage on ${SITE_NAME}.

---

## 1. About ${SITE_NAME}
${SITE_NAME} (${SITE_HOST}) is a real-time sports telemetry and live match data platform for UK and international sports fans.
- **Core Features:** Live football scores, match statistics, team lineups, league standings, and official UK broadcast schedule guides for Premier League, Champions League, Europa League, UFC, Formula 1, and World Cup 2026.
- **Data Coverage:** Real-time event updates across global leagues and competitions via official sports data providers (TheSportsDB for scores, fixtures, standings, teams and players; NewsData.io for news).
- **Broadcast Listings:** Reference official UK rights holders only — Sky Sports, TNT Sports, BBC, ITV, discovery+ and Amazon Prime Video. ${SITE_NAME} does not sell or provide television subscriptions.

---

## 2. Frequently Asked Questions (FAQ)

### What data does ${SITE_NAME} provide?
${SITE_NAME} provides real-time scores, match statistics, head-to-head records, official line-ups, and UK broadcast schedule information for major football leagues, UFC, and Motorsport.

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
