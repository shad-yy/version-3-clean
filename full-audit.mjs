import { chromium } from 'playwright';
import fs from 'fs';

const pagesToAudit = [
   '/', '/pricing', '/channels', '/free-trial', '/blog',
   '/blog/how-to-watch-premier-league-from-morocco',
   '/blog/3pm-blackout-rule-explained',
   '/blog/is-iptv-legal-uk',
   '/blog/sky-sports-vs-iptv-honest-comparison',
   '/blog/how-to-install-iptv-firestick',
   '/blog/watch-champions-league-without-bt-sport',
   '/news',
   '/watch/premier-league', '/watch/la-liga', '/watch/bundesliga',
   '/watch/serie-a', '/watch/ligue-1', '/watch/champions-league',
   '/watch/europa-league', '/watch/world-cup-2026', '/watch/formula-1',
   '/ufc',
   '/setup/firestick', '/setup/smart-tv', '/setup/android', '/setup/iphone',
   '/about', '/contact', '/privacy', '/terms', '/favorites', '/login', '/sitemap.xml'
];

//const baseUrl = 'https://smartlivetv-pi.vercel.app';
const baseUrl = 'http://localhost:3000';

async function run() {
   const browser = await chromium.launch({ headless: true });
   const context = await browser.newContext();
   const page = await context.newPage();

   let results = '';
   let critCount = 0;
   let highCount = 0;
   let minorCount = 0;

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
            if (href === '#' || href === 'javascript:void(0)' || href === 'javascript:void' || href === '') {
               brokenLinks.push(href);
            }
         }

         results += `### ${path}\n`;
         results += `- Status: ${status === 200 ? 'OK' : status === 404 ? 'ERROR' : status}\n`;
         results += `- Title: ${title}\n`;
         results += `- Issues found:\n`;

         let hasIssues = false;
         //dsds
         if (status === 404) {
            results += `  🔴 CRITICAL: Page returns 404 Not Found.\n`;
            critCount++;
            hasIssues = true;
         }

         if (!path.endsWith('.xml')) {
            if (!title || title.trim() === '') {
               results += `  🟡 HIGH: Missing title tag.\n`;
               highCount++;
               hasIssues = true;
            }
            if (!metaDesc || metaDesc === 'NONE') {
               results += `  🟡 HIGH: Missing meta description.\n`;
               highCount++;
               hasIssues = true;
            }
            if (h1 === 'NONE' && status !== 404) {
               results += `  🟡 HIGH: Missing H1 tag.\n`;
               highCount++;
               hasIssues = true;
            }
         }

         if (brokenLinks.length > 0) {
            results += `  🔴 CRITICAL: ${brokenLinks.length} broken link(s) found (${[...new Set(brokenLinks)].join(', ')}).\n`;
            critCount++;
            hasIssues = true;
         }

         const bodyText = await page.locator('body').innerText();
         // Domain separation: the main site must carry no commercial IPTV copy.
         // This check used to assert the OPPOSITE — it flagged pages for *not*
         // advertising "230,000+". See reports/audit-2026-07-31.md.
         const FORBIDDEN = [
            /\bIPTV\b/i,
            /230[,.]?000/,
            /15[,.]?000\+/,
            /£\s?(12|29|54|4\.50)\b/,
            /free\s+24-?hour\s+trial/i,
            /no\s+blackouts/i,
         ];
         const hits = FORBIDDEN.filter((re) => re.test(bodyText)).map((re) => re.source);
         if (hits.length) {
            results += `  🔴 CRITICAL: Commercial IPTV copy present (${hits.join(', ')}).\n`;
            critCount++;
            hasIssues = true;
         }

         if (title.includes('Smart Live TV | Smart Live TV')) {
            results += `  🟢 MINOR: Title has duplicate site name "Smart Live TV | Smart Live TV".\n`;
            minorCount++;
            hasIssues = true;
         }

         // Page specific checks
         if (path === '/') {
            const newsTitles = await page.locator('.news-section h3').allTextContents().catch(() => []);
            const setTitles = new Set(newsTitles);
            if (setTitles.size < newsTitles.length && newsTitles.length > 0) {
               results += `  🔴 CRITICAL: Duplicate news articles detected on homepage.\n`;
               critCount++;
               hasIssues = true;
            }
            const streamLinks = await page.locator('text=Stream This Match').all();
            for (const l of streamLinks) {
               const href = await l.getAttribute('href');
               if (!href || href === '#') {
                  results += `  🔴 CRITICAL: "Stream This Match" link is broken (${href}).\n`;
                  critCount++;
                  hasIssues = true;
                  break;
               }
            }
         }

         if (path === '/pricing') {
            if (bodyText.includes('Starter') || bodyText.includes('Sports Fan') || bodyText.includes('Ultimate')) {
               results += `  🟡 HIGH: FAQ or content still references old plan names (Starter/Sports Fan/Ultimate).\n`;
               highCount++;
               hasIssues = true;
            }
         }

         if (path.startsWith('/blog/') && status !== 404) {
            if (!bodyText.includes('James Harper')) {
               results += `  🟡 HIGH: Missing author byline "James Harper".\n`;
               highCount++;
               hasIssues = true;
            }
         }

         if (path === '/favorites' && status !== 404) {
            if (!bodyText.includes('No favorites') && !bodyText.includes('Add some leagues')) {
               results += `  🟡 HIGH: Empty state might be missing clear messaging.\n`;
               highCount++;
               hasIssues = true;
            }
         }

         if (path.startsWith('/setup/') && status !== 404) {
            if (bodyText.trim().length < 200) {
               results += `  🔴 CRITICAL: Setup page is empty or nearly empty.\n`;
               critCount++;
               hasIssues = true;
            }
         }

         if (path === '/watch/world-cup-2026') {
            if (!bodyText.includes('LIVE NOW')) {
               results += `  🟡 HIGH: Missing LIVE NOW badge.\n`;
               highCount++;
               hasIssues = true;
            }
         }

         if (path === '/watch/europa-league') {
            if (bodyText.includes('5998')) {
               results += `  🔴 CRITICAL: Displays wrong year (e.g. 5998).\n`;
               critCount++;
               hasIssues = true;
            }
         }

         if (!hasIssues) {
            results += `  None.\n`;
         }

         console.log(`Checked ${path} - Status ${status}`);
      } catch (e) {
         results += `### ${path}\n- Status: ERROR\n- Title: N/A\n- Issues found:\n  🔴 CRITICAL: Page failed to load (${e.message})\n`;
         critCount++;
      }
   }

   results += `\n### SUMMARY\n`;
   results += `Total pages audited: ${pagesToAudit.length}\n`;
   results += `Total 🔴 CRITICAL issues: ${critCount}\n`;
   results += `Total 🟡 HIGH issues: ${highCount}\n`;
   results += `Total 🟢 MINOR issues: ${minorCount}\n`;

   await browser.close();
   fs.writeFileSync('audit-full.txt', results);
   console.log('Audit complete, saved to audit-full.txt');
}

run().catch(console.error);
