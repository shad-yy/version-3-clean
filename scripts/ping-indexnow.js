// Guard: this script submits URLs to the IndexNow API, which is an outward-facing
// action. It must only run from the production deploy, never from a developer's
// local build or from CI. Set INDEXNOW_ENABLED=true in the production environment.
if (process.env.INDEXNOW_ENABLED !== 'true') {
  console.log('IndexNow ping skipped (set INDEXNOW_ENABLED=true to enable).');
  process.exit(0);
}

const fs = require('fs');
const path = require('path');

// Key details
// Override per deployment: INDEXNOW_HOST=example.com
const HOST = process.env.INDEXNOW_HOST || 'smartlivetv.co.uk';
const KEY = 'f63234d7ee824249a5b3260c6d2c49e2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const BASE_URL = `https://${HOST}`;

// Import blog posts dynamically if it exists
let blogPosts = [];
try {
  const postsFilePath = path.join(__dirname, '../lib/blog/posts.ts');
  if (fs.existsSync(postsFilePath)) {
    // Parse the JSON array from the auto-generated ts file
    const content = fs.readFileSync(postsFilePath, 'utf-8');
    const jsonMatch = content.match(/export const BLOG_POSTS: BlogPost\[] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      blogPosts = JSON.parse(jsonMatch[1]);
    }
  }
} catch (e) {
  console.error('Failed to parse blog posts:', e.message);
}

// Define URLs — only include pages that belong to the sports data main domain
// Store/commercial pages (pricing, free-trial, channels, setup guides) are handled
// by the smartlivetv-store.com domain and its own IndexNow submission.
const staticUrls = [
  '/',
  '/scores',
  '/watch/premier-league',
  '/watch/la-liga',
  '/watch/bundesliga',
  '/watch/serie-a',
  '/watch/ligue-1',
  '/watch/champions-league',
  '/watch/world-cup-2026',
  '/watch/europa-league',
  '/watch/formula-1',
  '/ufc',
  '/news',
  '/blog',
  '/leagues',
  '/teams',
  '/faq',
  '/about',
  '/contact',
];

const urls = [
  ...staticUrls.map(p => `${BASE_URL}${p}`),
  ...blogPosts.map(p => `${BASE_URL}/blog/${p.slug}`)
];

async function ping() {
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);
  
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200 || response.status === 202) {
      console.log(`IndexNow ping successful (${response.status} ${response.status === 200 ? 'OK' : 'Accepted'})`);
    } else {
      const text = await response.text();
      console.error(`IndexNow ping failed with status ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error('Error pinging IndexNow:', err.message);
  }
}

ping();
