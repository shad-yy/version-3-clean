import { chromium } from 'playwright';
import fs from 'fs';

const pagesToAudit = [
  '/',
  '/pricing',
  '/channels',
  '/free-trial',
  '/blog',
  '/blog/how-to-watch-premier-league-from-morocco',
  '/blog/3pm-blackout-rule-explained',
  '/blog/is-iptv-legal-uk',
  '/blog/sky-sports-vs-iptv-honest-comparison',
  '/blog/how-to-install-iptv-firestick',
  '/blog/watch-champions-league-without-bt-sport',
  '/news',
  '/watch/premier-league',
  '/watch/la-liga',
  '/watch/bundesliga',
  '/watch/serie-a',
  '/watch/ligue-1',
  '/watch/champions-league',
  '/watch/europa-league',
  '/watch/world-cup-2026',
  '/watch/formula-1',
  '/ufc',
  '/setup/firestick',
  '/setup/smart-tv',
  '/setup/android',
  '/setup/iphone',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/favorites',
  '/login',
  '/sitemap.xml'
];

const baseUrl = 'https://smartlivetv-pi.vercel.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let results = '';

  for (const path of pagesToAudit) {
    const url = baseUrl + path;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      const status = response ? response.status() : 'UNKNOWN';
      const title = await page.title();
      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => 'NONE');
      const h1s = await page.locator('h1').allTextContents();
      const h1 = h1s.length > 0 ? h1s[0].trim() : 'NONE';
      
      const links = await page.locator('a').all();
      let brokenLinks = [];
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href === '#' || href === 'javascript:void(0)' || href === 'javascript:void') {
          brokenLinks.push(href);
        }
      }

      results += `### ${path}\n`;
      results += `- Status: ${status === 200 ? 'OK' : status === 404 ? 'ERROR' : status}\n`;
      results += `- Title: ${title}\n`;
      results += `- Meta Description: ${metaDesc}\n`;
      results += `- H1: ${h1}\n`;
      results += `- Broken Links Found: ${brokenLinks.length} (${[...new Set(brokenLinks)].join(', ')})\n`;
      
      // Let's also do a quick text check for "15,000+" and "15K+"
      const bodyText = await page.locator('body').innerText();
      if (bodyText.includes('15,000+') || bodyText.includes('15K+')) {
        results += `  🔴 CRITICAL: Still showing 15,000+ or 15K+\n`;
      }
      
      if (path === '/') {
         const newsTitles = await page.locator('.news-section h3').allTextContents().catch(()=>[]);
         // check duplicates
         const setTitles = new Set(newsTitles);
         if (setTitles.size < newsTitles.length) {
            results += `  🔴 CRITICAL: Duplicate news articles detected.\n`;
         }
      }

      console.log(`Checked ${path} - Status ${status}`);
    } catch (e) {
      results += `### ${path}\n- Status: ERROR (${e.message})\n`;
    }
  }

  await browser.close();
  fs.writeFileSync('audit-results.txt', results);
  console.log('Audit complete, saved to audit-results.txt');
}

run().catch(console.error);
