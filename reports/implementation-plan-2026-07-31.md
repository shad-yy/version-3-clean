# 🛠️ Implementation Plan — 2026-07-31

**Source audit:** `reports/audit-2026-07-31.md`
**Target branch:** `Version-3`
**Baseline verified at plan time:** `npx tsc --noEmit` → 0 errors · `next build` → succeeds · unit tests → 3 of 4 files failing

> **This plan is self-contained.** You do not need to read the audit report to execute it.
>
> **Rules for the executing model:**
> 1. Work strictly top to bottom. Fix 1 → Fix 41.
> 2. After **every** fix, run its **Verification** command and confirm the stated expected output before moving on.
> 3. After finishing each phase, run `npx tsc --noEmit` and confirm **0 errors**.
> 4. **Never run `npm run build`.** It ends by pinging the IndexNow API (an external search-engine submission). To build locally, run:
>    ```bash
>    node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
>    ```
> 5. **Never hand-edit `lib/blog/posts.ts`.** It is auto-generated and is overwritten by every `npm run dev` and `npm run build`. Edit `content/blog/*.mdx` instead.
> 6. Stop the dev server before running a build — sharing the `.next` directory causes a spurious `Cannot find module './NNNN.js'` failure.

---

## Definitions used throughout

**"Domain-compliant"** means: describes live sports scores, fixtures, standings, statistics, or *official* UK/international TV broadcast listings (Sky Sports, TNT Sports, BBC, ITV, discovery+, Amazon Prime). It must contain **none** of: the word `IPTV`, channel counts (`230,000`, `15,000`), subscription prices (`£12`, `£29`, `£54`, `£4.50`), `free trial`, `Firestick` setup instructions, `no blackouts`, `no VPN needed`, `4K UHD` streaming claims about our own service, or WhatsApp ordering/activation.

---

# 🔴 PHASE 1 — CRITICAL (12 fixes)

---

## Fix 1: Stop the blog build pipeline from regenerating IPTV content

- **Severity**: 🔴 CRITICAL
- **Category**: Content / Infrastructure
- **File(s)**: `scripts/generate-posts.js`

### Current State
`scripts/generate-posts.js` reads `content/blog/*.mdx` and writes two outputs:
1. `lib/blog/posts.ts` (rendered to `/blog/[slug]`)
2. `public/llms-full.txt` (submitted to search engines via `app/sitemap.ts`)

Lines 43–46 sanitise **three link hrefs only**:
```js
htmlContent = htmlContent
  .replace(/href="\/free-trial"/g, 'href="/scores"')
  .replace(/href="\/pricing"/g, 'href="https://smartlivetv-store.com"')
  .replace(/href="\/setup\/firestick"/g, 'href="/watch"');
```
Body prose, prices and channel counts pass through untouched. Worse, `generateLlmsFull()` at lines 121–133 appends **`rawMarkdown`** with no sanitisation at all.

`package.json` line 7 (`dev`) and line 8 (`build`) both run `npm run generate-posts` **first**, so any manual cleanup of `lib/blog/posts.ts` is destroyed on the next run.

### Required Change
Add a build-time guard that **fails the build** if forbidden terms survive into the generated output. This makes the regression impossible to reintroduce silently.

Insert this function into `scripts/generate-posts.js` (top level, after the `getCategory` function ends at line 22):

```js
const FORBIDDEN = [
  /\biptv\b/i,
  /230[,.]?000/,
  /15[,.]?000\+?\s*(live\s*)?channels/i,
  /£\s?(12|29|54|4\.50)\b/,
  /free\s+24-?hour\s+trial/i,
  /firestick/i,
  /no\s+blackouts/i,
  /no\s+VPN\s+needed/i,
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
```

Then call it in two places:

```diff
     let htmlContent = marked.parse(content);
     htmlContent = htmlContent
       .replace(/href="\/free-trial"/g, 'href="/scores"')
       .replace(/href="\/pricing"/g, 'href="https://smartlivetv-store.com"')
       .replace(/href="\/setup\/firestick"/g, 'href="/watch"');
+
+    assertDomainCompliant(`content/blog/${file}`, `${data.title || ''} ${data.description || ''} ${htmlContent}`);
```

```diff
       content += `**Description:** ${post.description}\n\n`;
       content += `${rawMarkdown}\n`;
       content += `\n---\n`;
     }
   }
 
+  assertDomainCompliant('public/llms-full.txt', content);
   fs.writeFileSync(llmsFullFile, content, 'utf-8');
```

### Verification
```bash
node scripts/generate-posts.js
```
Expected **now**: the script exits non-zero with `❌ DOMAIN SEPARATION VIOLATION in content/blog/is-iptv-legal-uk.mdx`. That is correct — it proves the guard works. Fix 2 removes the offending source files, after which this command must print `Successfully generated N posts` and exit 0.

- **Source**: Audit §STEP 4 "Root cause"; `.cursorrules` §1 Domain Separation.

---

## Fix 2: Remove or rewrite the 12 IPTV blog source files

- **Severity**: 🔴 CRITICAL
- **Category**: Content
- **File(s)**: `content/blog/*.mdx` (delete list below)

### Current State
29 MDX files exist in `content/blog/`. 12 contain IPTV commercial content that is rendered live at `/blog/[slug]`, listed on `/blog`, surfaced on the homepage, and submitted in `sitemap.xml`. Confirmed IPTV hit counts per file:

| File | `iptv` hits |
|---|---|
| `iptv-vs-netflix-disney-sky-2026.mdx` | 20 |
| `best-iptv-premier-league-2026-27-4k.mdx` | 17 |
| `is-iptv-legal-uk.mdx` | 14 |
| `watch-premier-league-firestick-without-sky.mdx` | 11 |
| `sky-sports-price-increase-2026-alternatives.mdx` | 7 |
| `watch-premier-league-2026-27-live-channels-streaming.mdx` | 6 |
| `watch-world-cup-2026-abroad-iptv.mdx` | 5 |
| `cancel-sky-sports-save-money-2026.mdx` | 4 |
| `sky-sports-tnt-prime-cost-premier-league-2026-27.mdx` | 3 |
| `watch-argentina-world-cup-2026-live-uk.mdx` | 2 |
| `watch-ufc-fight-night-ankalaev-guskov-uk-guide.mdx` | 2 |
| `world-cup-2026-firestick-complete-guide.mdx` | 1 |

### Required Change
**Step A — delete the 6 files whose entire premise is selling IPTV.** These cannot be rewritten into domain-compliant articles because the topic *is* the product:
```bash
git rm content/blog/iptv-vs-netflix-disney-sky-2026.mdx
git rm content/blog/best-iptv-premier-league-2026-27-4k.mdx
git rm content/blog/is-iptv-legal-uk.mdx
git rm content/blog/watch-premier-league-firestick-without-sky.mdx
git rm content/blog/watch-world-cup-2026-abroad-iptv.mdx
git rm content/blog/world-cup-2026-firestick-complete-guide.mdx
```

**Step B — for the remaining 6 files**, edit the MDX body and frontmatter so every forbidden term is gone. These articles have legitimate domain-compliant topics (broadcaster costs, price rises, SD discontinuation, fixture guides); only the promotional insert must go.

Rewrite rule — wherever the text recommends "Smart Live TV" as a cheaper streaming alternative, replace that recommendation with the **official** UK broadcaster route. Example transformation:

```diff
- The total cost to watch all televised Premier League 2026-27 matches in the UK is
- **£82.99 per month** across Sky Sports, TNT Sports, and Amazon Prime Video. You can cut
- this down to just **£12/month** with [Smart Live TV](/pricing), which provides access to
- all televised matches plus international feeds.
+ The total cost to watch all televised Premier League 2026-27 matches in the UK is
+ **£82.99 per month** across Sky Sports, TNT Sports, and Amazon Prime Video. Sky Sports
+ carries the majority of televised fixtures, TNT Sports holds a smaller package, and
+ Amazon Prime Video streams a dedicated December matchweek. NOW offers Sky Sports content
+ on a contract-free monthly or daily pass.
```

Apply the same pattern to every occurrence of `£12`, `230,000`, `free 24-hour trial`, `Firestick`, `no blackouts`, `no VPN needed`, and any `[Smart Live TV](/pricing)` link.

**Step C — remove the "Cost" comparison rows that list our own service as a product**, e.g. `sky-sports-price-increase-2026-alternatives.mdx:89` (`| **Smart Live TV** | **£12** | ... |`) and `sky-sports-tnt-prime-cost-premier-league-2026-27.mdx:65-66`. Delete those table rows entirely.

### Verification
```bash
node scripts/generate-posts.js
```
Expected: `Successfully generated 23 posts to .../lib/blog/posts.ts`, exit 0, **no** violation message.

Then:
```bash
grep -ric "iptv\|230,000\|£12\|free 24-hour trial\|firestick" content/blog/ lib/blog/posts.ts public/llms-full.txt
```
Expected: `0` for every file.

- **Source**: Audit §STEP 4 table; Persona 4 S-15.

---

## Fix 3: Rewrite `public/llms.txt`

- **Severity**: 🔴 CRITICAL
- **Category**: SEO / Content
- **File(s)**: `public/llms.txt`

### Current State
This is the file AI answer engines read first, and `app/sitemap.ts:31` submits it to Google with `changeFrequency: 'daily'`. Line 2 currently reads verbatim:
> *"Smart Live TV is a premium IPTV streaming service for the UK and global audiences, offering 230,000+ live TV channels, sports channels (including Sky Sports, TNT Sports, and international broadcasts), movies, and TV shows starting from £12/month. Includes a free 24-hour trial."*

It also advertises URLs that no longer resolve: `/buy` and `/pricing` (now 308-redirect off-domain), `/setup/firestick` and `/iptv-vs-sky-sports` (both deleted → 404).

### Required Change
Replace the **entire file** with the content below. Do not merge — overwrite.

```markdown
# Smart Live TV

> Smart Live TV (smartlivetv.co.uk) is a real-time sports data platform providing live
> football scores, fixtures, league standings, team and player statistics, and official
> UK television broadcast listings for Premier League, Champions League, Europa League,
> La Liga, Serie A, Bundesliga, Ligue 1, UFC, and Formula 1.

## Core pages
- [Home](https://smartlivetv.co.uk/): Live scores, today's fixtures, league standings, and sports news.
- [Live Scores](https://smartlivetv.co.uk/scores): Real-time football scores and results, updated continuously.
- [Leagues](https://smartlivetv.co.uk/leagues): League tables, fixtures, and results for major competitions.
- [Teams](https://smartlivetv.co.uk/teams): Club profiles, squads, and fixture histories.
- [Players](https://smartlivetv.co.uk/players): Player profiles and season statistics.
- [Sports News](https://smartlivetv.co.uk/news): Football and MMA headlines updated daily.
- [UFC](https://smartlivetv.co.uk/ufc): Event schedules, fight cards, fighter records, and rankings.
- [Blog](https://smartlivetv.co.uk/blog): Editorial guides on fixtures, competitions, and UK broadcast schedules.

## Broadcast guides
- [Premier League](https://smartlivetv.co.uk/watch/premier-league): Fixtures, standings, and official UK TV channel listings.
- [Champions League](https://smartlivetv.co.uk/watch/champions-league): Fixtures, group tables, and UK broadcast information.
- [Europa League](https://smartlivetv.co.uk/watch/europa-league): Fixtures and official UK broadcast listings.
- [World Cup 2026](https://smartlivetv.co.uk/watch/world-cup-2026): Tournament results and broadcast archive.
- [Formula 1](https://smartlivetv.co.uk/watch/formula-1): Race calendar, session times, and UK broadcast listings.

## About
- [About](https://smartlivetv.co.uk/about): What the platform covers and where its data comes from.
- [FAQ](https://smartlivetv.co.uk/faq): Common questions about scores, fixtures, and broadcast listings.
- [Contact](https://smartlivetv.co.uk/contact): How to reach the editorial and technical team.
- [Privacy](https://smartlivetv.co.uk/privacy) · [Terms](https://smartlivetv.co.uk/terms)

## Notes
- Data sources: TheSportsDB (scores, fixtures, standings, teams, players) and NewsData.io (news).
- Broadcast listings reference official rights holders only (Sky Sports, TNT Sports, BBC, ITV, discovery+, Amazon Prime Video).
- Smart Live TV does not sell or provide television subscriptions.
```

### Verification
```bash
grep -ic "iptv\|230,000\|£12\|free trial\|firestick\|/buy\|/pricing" public/llms.txt
```
Expected: `0`.

- **Source**: Audit Persona 4 S-01.

---

## Fix 4: Rewrite `app/terms/page.tsx` — it is currently an IPTV subscription contract

- **Severity**: 🔴 CRITICAL
- **Category**: Content / Compliance
- **File(s)**: `app/terms/page.tsx`

### Current State
Lines 22–25 state: *"Smart Live TV provides access to a streaming service with 230,000+ live channels. A free 24-hour trial is available with no credit card required. Paid subscriptions begin after the trial period at the rate of your chosen plan."* Section 2 is "Subscriptions & Billing" (monthly billing, no contract, 7-day money-back via WhatsApp). Section 3 restricts credential sharing "outside your household". The meta description (line 7) reads *"…your rights and responsibilities as a subscriber."*

> ⚠️ A previous remediation pass recorded this file as "verified clean". It was not. Verify by reading, not by trusting the tracker.

### Required Change
Replace the metadata block and Sections 1–3.

```diff
 export const metadata: Metadata = {
   title: 'Terms of Service',
-  description: 'Smart Live TV terms of service — your rights and responsibilities as a subscriber.',
+  description: 'Smart Live TV terms of service — the rules for using our live sports scores, fixtures and broadcast listings.',
   alternates: { canonical: `${ENV.BASE_URL}/terms` },
 }
```

Replace Section 1 (lines ~20–26):
```diff
           <section>
             <h2 className="text-xl font-bold text-white mb-3">1. Service Description</h2>
-            <p>Smart Live TV provides access to a streaming service with 230,000+ 
-            live channels. A free 24-hour trial is available with no credit card 
-            required. Paid subscriptions begin after the trial period at the 
-            rate of your chosen plan.</p>
+            <p>Smart Live TV is a free, ad-supported information service. We publish live
+            sports scores, fixture schedules, league standings, team and player statistics,
+            and listings of the official television broadcasters that hold the rights to
+            each event. We do not sell, resell, or provide access to any television or
+            streaming subscription, and we do not host or transmit any video content.</p>
           </section>
```

Replace Section 2 entirely (lines ~28–39) with an accuracy disclaimer — the appropriate clause for a data publisher:
```diff
           <section>
-            <h2 className="text-xl font-bold text-white mb-3">2. Subscriptions & Billing</h2>
-            <p>Subscriptions are billed monthly with no long-term contract. ...</p>
-            <p className="mt-4"><strong>7-Day Money Back Guarantee:</strong> ...</p>
+            <h2 className="text-xl font-bold text-white mb-3">2. Accuracy of Information</h2>
+            <p>Scores, fixtures, standings and statistics are supplied by third-party data
+            providers and are presented on a best-effort basis. Kick-off times and broadcast
+            listings are subject to change by the competition organiser or rights holder.
+            Always confirm against the official broadcaster before making plans. We accept no
+            liability for decisions made on the basis of information published here.</p>
           </section>
```

Replace Section 3 (lines ~41–48):
```diff
           <section>
             <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use</h2>
-            <p>Your subscription is for personal, non-commercial use only. 
-            Sharing account credentials outside your household is not permitted. 
-            We reserve the right to suspend accounts found to be in breach 
-            of this policy.</p>
+            <p>You may use this site for personal, non-commercial purposes. Automated
+            scraping, bulk redistribution of our data, or any attempt to disrupt or
+            overload the service is not permitted. We reserve the right to restrict
+            access where these terms are breached.</p>
           </section>
```

Then read the **remainder of the file** (sections 4 onward) and remove any other reference to subscriptions, billing, trials, refunds, credentials or channel counts.

### Verification
```bash
grep -ic "subscription\|subscriber\|billing\|refund\|trial\|230,000\|channels\|whatsapp" app/terms/page.tsx
```
Expected: `0`.
```bash
curl -s http://localhost:3000/terms | grep -ic "230,000"
```
Expected: `0`.

- **Source**: Audit Persona 4 S-03.

---

## Fix 5: Correct the subscription language in `app/privacy/page.tsx`

- **Severity**: 🔴 CRITICAL
- **Category**: Content / Compliance
- **File(s)**: `app/privacy/page.tsx`

### Current State
Line 41 states collected data (including WhatsApp number and device type) is *"used solely to activate your subscription"*.

### Required Change
```diff
-              WhatsApp number, and device type. This data is used solely to activate your subscription
+              and any message you send us. This data is used solely to respond to your enquiry
```
Read the surrounding paragraph and adjust wording so it reads naturally and describes only the data a contact form actually collects (name, email, message). Remove `WhatsApp number` and `device type` from the list unless a form on the site still collects them.

### Verification
```bash
grep -ic "subscription\|activate your" app/privacy/page.tsx
```
Expected: `0`.

- **Source**: Audit Persona 4 S-08.

---

## Fix 6: Remove the free-trial funnel from every match detail page

- **Severity**: 🔴 CRITICAL
- **Category**: Content / SEO
- **File(s)**: `app/match/[id]/page.tsx`

### Current State
Lines 306–318 render a 3-step commercial funnel on **every** match URL:
```
1. Claim Free Trial      — "No card needed. Get credentials via WhatsApp in 5 minutes."
2. Install on Your Device — "Works on Firestick, Smart TV, Android, iPhone, and PC."
3. Watch in 4K            — "Stream {homeTeam} vs {awayTeam} live with no blackouts."
```
Immediately above (lines ~300–303): *"…Sky Sports, TNT Sports, beIN Sports — all in HD and 4K. No VPN needed — works from anywhere in the world."*

Because this is a dynamic route, the funnel is replicated across every match page the site generates.

### Required Change
Replace the three funnel objects with domain-compliant "how to follow this match" steps, and fix the paragraph above it.

```diff
           {[
-            { n: '1', t: 'Claim Free Trial', d: 'No card needed. Get credentials via WhatsApp in 5 minutes.' },
-            { n: '2', t: 'Install on Your Device', d: 'Works on Firestick, Smart TV, Android, iPhone, and PC.' },
-            { n: '3', t: 'Watch in 4K', d: `Stream ${homeTeam} vs ${awayTeam} live with no blackouts.` },
+            { n: '1', t: 'Check the Kick-Off Time', d: 'Confirm the local start time and competition round above.' },
+            { n: '2', t: 'Find the Official Broadcaster', d: 'See which UK rights holder is showing this fixture.' },
+            { n: '3', t: 'Follow Live', d: `Track ${homeTeam} vs ${awayTeam} score updates, lineups and stats here.` },
           ].map(s => (
```

Then read lines ~295–305 and rewrite the surrounding paragraph so it lists official broadcasters as *information* rather than as a bundle we supply. Remove `all in HD and 4K`, `No VPN needed`, and `works from anywhere in the world`.

### Verification
```bash
grep -ic "free trial\|firestick\|4K\|no blackouts\|VPN\|whatsapp\|credentials" "app/match/[id]/page.tsx"
```
Expected: `0`.

- **Source**: Audit Persona 4 S-07.

---

## Fix 7: Clean `app/ufc/page.tsx` metadata and FAQ schema

- **Severity**: 🔴 CRITICAL
- **Category**: SEO / Content
- **File(s)**: `app/ufc/page.tsx`

### Current State
Lines 10–11:
```js
title: 'Watch UFC Live — All Fight Nights in 4K',
description: 'Stream every UFC event live in 4K. Prelims, main card and PPV events all included. Free 24-hour trial — no card needed.',
```
Line 48 (inside an **FAQ schema answer**, i.e. submitted to Google as structured data):
```js
text: 'Yes. Smart Live TV includes every UFC event — prelims, main card, and PPV — all included in your subscription with live sport data and schedules available on smartlivetv.co.uk.',
```

### Required Change
```diff
-  title: 'Watch UFC Live — All Fight Nights in 4K',
-  description: 'Stream every UFC event live in 4K. Prelims, main card and PPV events all included. Free 24-hour trial — no card needed.',
+  title: 'UFC Schedule, Fight Cards & Rankings | Smart Live TV',
+  description: 'Upcoming UFC events, full fight cards, fighter records and divisional rankings, plus official UK broadcast listings for every card.',
```
```diff
-        text: 'Yes. Smart Live TV includes every UFC event — prelims, main card, and PPV — all included in your subscription with live sport data and schedules available on smartlivetv.co.uk.',
+        text: 'UFC events are broadcast in the UK by TNT Sports, with numbered pay-per-view cards sold separately through discovery+. Smart Live TV publishes the full schedule, fight cards and start times for every event, including prelims and main card.',
```
Then read the whole file and remove any other occurrence of `4K`, `free trial`, `subscription`, `included`, or `PPV events all included`.

### Verification
```bash
grep -ic "free trial\|4K\|your subscription\|no card needed" app/ufc/page.tsx
```
Expected: `0`.
```bash
curl -s http://localhost:3000/ufc | grep -o '<meta name="description" content="[^"]*"'
```
Expected: the new description; no "Free 24-hour trial".

- **Source**: Audit Persona 4 S-05.

---

## Fix 8: Clean `app/watch/europa-league/page.tsx`

- **Severity**: 🔴 CRITICAL
- **Category**: SEO / Content
- **File(s)**: `app/watch/europa-league/page.tsx`

### Current State
Five violations, three of them inside **FAQ structured data**:

| Line | Content |
|---|---|
| 127 | FAQ answer: *"…use Smart Live TV to stream every single match live in 4K UHD from **£12/month**."* |
| 142 | FAQ answer: *"…you get all these channels plus international feeds in a single interface from **£12/month**."* |
| 147 | FAQ answer: *"Yes! Smart Live TV offers a 24-hour free trial… No credit card or contract is required—simply request activation via WhatsApp."* |
| 222 | Body: *"…use **Smart Live TV** from **£12/month** with a 24-hour free trial."* |
| 255 | Price table cell: `From £4.50 to £12/mo` |

### Required Change
- **Line 127** — end the answer after the official broadcaster sentence: *"In the UK, TNT Sports holds the exclusive rights to broadcast the UEFA Europa League (including the League Phase and Knockout matches). discovery+ is the official streaming platform for TNT Sports."* Delete the "Alternatively, you can use Smart Live TV…" clause.
- **Line 142** — end after: *"The Europa League is primarily broadcast on TNT Sports channels (TNT Sports 1, 2, 3) on Sky, Virgin Media, and EE TV."* Delete the "With Smart Live TV…" clause.
- **Line 147** — replace the whole answer with: *"TNT Sports subscribers can stream every Europa League match through discovery+. discovery+ also sells a contract-free monthly pass that includes TNT Sports."*
- **Line 222** — delete the sentence from *"For a more cost-effective alternative…"* to the end of the paragraph, including the `<Link href="https://smartlivetv-store.com">` element.
- **Line 255** — delete the entire `<tr>` row containing that price cell.

### Verification
```bash
grep -c "£12\|£4.50\|free trial\|smartlivetv-store" app/watch/europa-league/page.tsx
```
Expected: `0`.

- **Source**: Audit Persona 4 S-04.

---

## Fix 9: Clean `app/watch/world-cup-2026/page.tsx`

- **Severity**: 🔴 CRITICAL
- **Category**: SEO / Content
- **File(s)**: `app/watch/world-cup-2026/page.tsx`

### Current State
| Line | Content |
|---|---|
| 8 | `description:` ends *"…Watch every match live from £12/month."* |
| 52 | FAQ schema answer: *"Smart Live TV gives you access to every Premier League 2026-27 match live in 4K — Sky Sports, TNT Sports and international feeds all included. Start from £12/month with a free 24-hour trial."* |
| 269 | CTA button label: `View Plans from £12/month` |

### Required Change
```diff
-  description: 'The 2026 FIFA World Cup is over. Spain beat Argentina 4-1 in the final on 19 July 2026. The Premier League 2026-27 season starts 21 August. Watch every match live from £12/month.',
+  description: 'The 2026 FIFA World Cup is over — Spain beat Argentina 4-1 in the final on 19 July 2026. Full results archive, plus the Premier League 2026-27 season start date and UK broadcast listings.',
```
```diff
-        text: 'Smart Live TV gives you access to every Premier League 2026-27 match live in 4K — Sky Sports, TNT Sports and international feeds all included. Start from £12/month with a free 24-hour trial.',
+        text: 'The Premier League 2026-27 season starts on 21 August 2026. In the UK, televised fixtures are shared between Sky Sports, TNT Sports and Amazon Prime Video. Smart Live TV publishes the full fixture list, kick-off times and the official broadcaster for each match.',
```
Line 269 — replace the CTA. Change the label to `View Premier League Fixtures` and point the `href` to `/watch/premier-league`.

### Verification
```bash
grep -c "£12\|free 24-hour trial\|View Plans" app/watch/world-cup-2026/page.tsx
```
Expected: `0`.

- **Source**: Audit §STEP 4 table.

---

## Fix 10: Remove the live commercial API endpoints and order UI

- **Severity**: 🔴 CRITICAL
- **Category**: Backend / Compliance
- **File(s)**: `app/api/orders/route.ts`, `app/api/subscribe/route.ts`, `app/api/speed-test/route.ts`, `app/pricing/order-form.tsx`, `app/pricing/page.tsx`, `app/buy/page.tsx`, `app/free-trial/page.tsx`, `app/login/page.tsx`

### Current State
`next.config.mjs` `redirects()` shadows the **pages** `/buy`, `/pricing`, `/free-trial` — but **not** `/api/*`. Verified against the running dev server:

| Endpoint | Method | Status | Meaning |
|---|---|---|---|
| `/api/orders` | GET | **405** | Route exists, accepts POST |
| `/api/subscribe` | GET | **405** | Route exists, accepts POST |
| `/api/speed-test` | GET | **200** | Live |
| `/login` | GET | **200** | Live |

`app/api/orders/route.ts` accepts `{name, email, whatsapp, plan, message}` (lines 7, 31) and emails *"We've received your free trial request. Our team will send your login credentials to your WhatsApp… within 5 minutes"* (line 85) and *"We've received your order for the **{plan}** plan"* (line 86). `app/pricing/order-form.tsx` is the matching checkout form. `app/login/page.tsx` states *"Account management is handled via WhatsApp."*

The build also still compiles `/buy`, `/pricing`, `/free-trial` as static pages (87.5 kB each) even though they are unreachable.

### Required Change
Move all eight files to the store archive, then delete them from the main site:
```bash
mkdir -p smartlivetv-store/api smartlivetv-store/pages
git mv app/api/orders/route.ts       smartlivetv-store/api/orders-route.ts
git mv app/api/subscribe/route.ts    smartlivetv-store/api/subscribe-route.ts
git mv app/pricing/order-form.tsx    smartlivetv-store/components/order-form.tsx
git mv app/login/page.tsx            smartlivetv-store/pages/login-page.tsx
git rm app/api/speed-test/route.ts
git rm app/pricing/page.tsx app/buy/page.tsx app/free-trial/page.tsx
```
Then remove the now-empty `app/pricing/`, `app/buy/`, `app/free-trial/`, `app/login/` directories.

**Keep the redirects in `next.config.mjs` as-is** — they must continue to send `/buy`, `/pricing` and `/free-trial` to the store domain for any inbound links.

If `git rm` reports the file is untracked, use `rm` instead.

Finally, grep for imports of the removed modules and fix any that break:
```bash
grep -rn "order-form\|/api/orders\|/api/subscribe\|/api/speed-test\|app/login" --include=*.tsx --include=*.ts app components lib
```

### Verification
```bash
# restart dev server first
for p in /api/orders /api/subscribe /api/speed-test /login; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)  $p"; done
```
Expected: `404` for all four.
```bash
for p in /buy /pricing /free-trial; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)  $p"; done
```
Expected: `308` for all three (redirects must still work).
Then `npx tsc --noEmit` → 0 errors.

- **Source**: Audit Layer 1 B-01, Persona 5 C-02.

---

## Fix 11: Stop caching authenticated API responses in public/shared caches

- **Severity**: 🔴 CRITICAL
- **Category**: Security
- **File(s)**: `next.config.mjs`

### Current State
`next.config.mjs` lines 173–181 apply one blanket header to **every** API route:
```js
{
  source: '/api/(.*)',
  headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }],
}
```
Confirmed live:
```
$ curl -D - http://localhost:3000/api/auth/admin/status
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```
`public` explicitly authorises shared caches (Vercel's edge CDN, any intermediary proxy) to store the response and replay it to **other users**. An authenticated admin-status response can therefore be served to an unauthenticated visitor for up to an hour, extended to 24 hours by `stale-while-revalidate`. The same rule covers `/api/auth/admin/extend`, `/api/admin/health` and `/api/admin/metrics`.

### Required Change
Replace the single blanket rule with an explicit no-store rule for auth/admin routes, placed **before** the general rule (Next.js applies the first matching header rule):

```diff
       {
+        source: '/api/auth/:path*',
+        headers: [
+          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
+        ],
+      },
+      {
+        source: '/api/admin/:path*',
+        headers: [
+          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
+        ],
+      },
+      {
         source: '/api/(.*)',
         headers: [
           {
             key: 'Cache-Control',
-            value: 'public, max-age=3600, stale-while-revalidate=86400',
+            value: 'public, max-age=60, stale-while-revalidate=300',
           },
         ],
       },
```

The `max-age` reduction on the general rule is deliberate — see Fix 20 for why 3600 was also breaking live scores.

### Verification
```bash
curl -s -D - -o /dev/null http://localhost:3000/api/auth/admin/status | grep -i cache-control
```
Expected: `Cache-Control: private, no-store, no-cache, must-revalidate` — and **no** `public`.

- **Source**: Audit Layer 3 SEC-01.

---

## Fix 12: Point the distributed rate limiter at the actual login endpoint

- **Severity**: 🔴 CRITICAL
- **Category**: Security
- **File(s)**: `middleware.ts`, `app/api/auth/admin/route.ts`

### Current State
`middleware.ts:103` gates the Upstash rate limiter on:
```js
if (request.nextUrl.pathname.startsWith('/api/admin/')) {
```
But the admin **login** route is `app/api/auth/admin/route.ts` → **`/api/auth/admin`**, which does not match that prefix. `/api/admin/*` contains only `health`, `health/report` and `metrics`. So the distributed limiter guards health endpoints while login falls back to the in-process `globalThis.__adminRateLimit` Map in `app/api/auth/admin/route.ts:30-48` — which on Vercel is per-lambda-instance and resets on every cold start, making the effective limit unbounded under scale.

Additionally, in `app/api/auth/admin/route.ts` the expensive `bcrypt.compare()` at line 28 runs **before** the rate-limit block at lines 30–48, and `password` from `await request.json()` (line 22) is never validated. `bcryptjs` is pure JS and single-threaded, so unauthenticated requests can saturate the event loop.

### Required Change
**Step A** — widen the middleware matcher:
```diff
-    if (request.nextUrl.pathname.startsWith('/api/admin/')) {
+    const isAdminSurface =
+      request.nextUrl.pathname.startsWith('/api/admin/') ||
+      request.nextUrl.pathname.startsWith('/api/auth/admin')
+
+    if (isAdminSurface) {
```

**Step B** — in `app/api/auth/admin/route.ts`, validate input and move the rate-limit block **above** the bcrypt call. Reorder so the function body reads:

1. JWT_SECRET check (unchanged)
2. `const body = await request.json().catch(() => null)`
3. Validate: if `!body || typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 200`, return `400` with `{ success: false, message: 'Invalid request' }`
4. `ADMIN_PASSWORD_HASH` configured check (unchanged)
5. **The entire IP rate-limit block** (currently lines 30–48) — moved here
6. `const isValidPassword = await bcrypt.compare(body.password, ADMIN_PASSWORD_HASH)` — moved down
7. The rest, unchanged

The `length > 200` cap matters: bcrypt cost scales with input, so an unbounded string is a CPU amplification vector.

### Verification
```bash
npx tsc --noEmit
```
Expected: 0 errors.

Then confirm ordering by reading the file — `bcrypt.compare` must appear **after** the rate-limit block, and a `typeof … !== 'string'` guard must appear before it:
```bash
grep -n "bcrypt.compare\|typeof\|__adminRateLimit\|status: 400" app/api/auth/admin/route.ts
```
Expected line order: `typeof` guard → `status: 400` → `__adminRateLimit` → `bcrypt.compare`.

Then, with the dev server running, POST an invalid body and confirm a `400` (not a `500`):
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/admin \
  -H "Content-Type: application/json" -d '{"password":123}'
```
Expected: `400`.

- **Source**: Audit Layer 3 SEC-02 and SEC-03.

---

# 🟡 PHASE 2 — HIGH (14 fixes)

---

## Fix 13: Stop presenting a finished season as "Live Standings"

- **Severity**: 🟡 HIGH
- **Category**: Frontend / Content
- **File(s)**: `components/homepage/league-tables.tsx`

### Current State
The homepage renders a section headed **"Live Standings — Stream Every Game"** with the caption *"Premier League — All 380 matches this season"*, showing every club on **P = 38** (Arsenal 38 played / 85 pts, Man City 38/78, Man Utd 38/71, Aston Villa 38/65, Liverpool 38/60). A 38-game table is a **completed** season. The 2026-27 season has not started — the site's own copy says it begins 21 August 2026.

### Required Change
Make the heading reflect the data rather than the marketing claim. In `components/homepage/league-tables.tsx`:

1. Compute whether the table is complete: if every row's played count equals the league's total matchdays (38 for Premier League), the season is finished.
2. When finished, render the heading as `Final Standings — {season}` and the caption as `{season} season complete`.
3. When in progress, render `Live Standings` and `Matchday {n}`.
4. Remove `Stream Every Game` from the heading — it is a streaming claim, not a data label.

If the season string is not currently available in the component's props, derive it from the standings API response rather than hardcoding it.

### Verification
```bash
curl -s http://localhost:3000/ | grep -o "Live Standings[^<]*"
```
Expected before the new season starts: no match (heading now reads "Final Standings"). After 21 Aug 2026: `Live Standings` with a matchday number, and played counts below 38.

- **Source**: Audit Persona 3 U-01.

---

## Fix 14: Remove the hardcoded season from the two direct API calls

- **Severity**: 🟡 HIGH
- **Category**: Backend
- **File(s)**: `app/watch/champions-league/page.tsx`, `app/watch/europa-league/page.tsx`, `lib/api/unified-sports-api.ts`

### Current State
Six requests bypass the unified API layer, the 25 req/min rate limiter and the TTL cache — violating `.cursorrules` §2 ("Never call external APIs directly from frontend components"; "Always use the wrapper classes in `lib/api/unified-sports-api.ts`"):
```
app/watch/champions-league/page.tsx:106  eventsnextleague.php?id=4480
app/watch/champions-league/page.tsx:107  lookuptable.php?l=4480&s=2025-2026   ← hardcoded
app/watch/champions-league/page.tsx:108  eventspastleague.php?id=4480
app/watch/europa-league/page.tsx:110     eventsnextleague.php?id=4735
app/watch/europa-league/page.tsx:111     lookuptable.php?l=4735&s=2025-2026   ← hardcoded
app/watch/europa-league/page.tsx:112     eventspastleague.php?id=4735
```
Both standings will freeze on 2025-26 when the new season starts on 21 August 2026 — three weeks away.

### Required Change
**Step A** — add a shared season helper. `lib/api/unified-sports-api.ts:291` already contains the correct logic as a comment (*"season runs from August to May"*). Export it properly:
```ts
/** European football seasons run August–May. Returns e.g. "2026-2027". */
export function getCurrentSeason(date: Date = new Date()): string {
  const year = date.getFullYear()
  // Month is 0-indexed; July (6) and earlier still belongs to the season that started last year.
  const startYear = date.getMonth() >= 7 ? year : year - 1
  return `${startYear}-${startYear + 1}`
}
```
(Check whether an equivalent helper already exists in that file before adding a duplicate.)

**Step B** — replace the six direct `fetchWithTimeout` calls in both pages with the equivalent `UnifiedSportsAPI` methods so they inherit the rate limiter and cache. If no equivalent method exists, add one to `lib/api/unified-sports-api.ts` — do not leave the direct calls in place.

**Step C** — wherever the season is needed, call `getCurrentSeason()` instead of the literal `'2025-2026'`.

### Verification
```bash
grep -rn "s=2025-2026\|thesportsdb.com/api" --include=*.tsx app components
```
Expected: no output.
```bash
npx tsc --noEmit
```
Expected: 0 errors.
Then load `/watch/champions-league` and `/watch/europa-league` and confirm both still render standings.

- **Source**: Audit Layer 1 B-02; `.cursorrules` §2.

---

## Fix 15: Add mount guards to the 16 unguarded Framer Motion components

- **Severity**: 🟡 HIGH
- **Category**: Frontend
- **File(s)**: 16 files listed below

### Current State
`.cursorrules` line 32 makes the mounted guard non-negotiable, and Trouble Registry Bug 5 documents the production crash it prevents (`Failed to execute 'removeChild' on 'Node'` on Vercel). A shared `components/ui/client-only.tsx` wrapper already exists. These 16 components import `framer-motion` and render `motion.*` directly with **no** `mounted` state and **no** `<ClientOnly>`:

```
components/chat/WhatsAppFloat.tsx        components/layout/footer.tsx
components/consent/CookieBanner.tsx      components/layout/header.tsx
components/home/featured-news.tsx        components/league/league-detail-view.tsx
components/home/hero-section.tsx         components/match/match-tabs.tsx
components/home/sport-selector.tsx       components/news/news-card.tsx
components/homepage/service-pillars.tsx  components/search/command-palette.tsx
components/homepage/spotlight-events.tsx components/ui/LiveEventFloat.tsx
                                         components/ui/shimmer-button.tsx
                                         components/ui/stagger-in.tsx
```
`header.tsx` and `footer.tsx` render on **every** route, so this is the highest-exposure item.

> Three of these (`components/home/*`) are dead code — Fix 30 deletes them. Do Fix 30 first, then only 13 files need guarding.

### Required Change
For each file, add the standard guard. Pattern:
```diff
-import { useState, useEffect, memo, useRef } from "react"
+import { useState, useEffect, memo, useRef } from "react"
 import { motion, AnimatePresence } from "framer-motion"

 export function Header() {
+  const [mounted, setMounted] = useState(false)
+  useEffect(() => setMounted(true), [])
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
```
Then render a non-animated equivalent until mounted. For layout-critical components (`header.tsx`, `footer.tsx`) return the **same markup with plain elements** rather than `null` — returning `null` would cause layout shift (CLS) on every page load:
```jsx
if (!mounted) {
  return <header className={/* same classes */}>{/* same content, no motion.* */}</header>
}
```
For purely decorative components (`shimmer-button.tsx`, `stagger-in.tsx`, `LiveEventFloat.tsx`), wrapping the export in `<ClientOnly>` is sufficient.

### Verification
```bash
for f in $(grep -rl "framer-motion" --include=*.tsx components app); do
  grep -q "mounted\|ClientOnly" "$f" || echo "STILL UNGUARDED: $f"; done
```
Expected: no output.
```bash
npx tsc --noEmit
```
Expected: 0 errors.

- **Source**: Audit Persona 1 F-01; `.cursorrules` §2.

---

## Fix 16: Add metadata to `/teams`, `/events`, `/players`

- **Severity**: 🟡 HIGH
- **Category**: SEO
- **File(s)**: `app/teams/page.tsx`, `app/events/page.tsx`, `app/players/page.tsx`

### Current State
All three return **200** but export no `metadata`, so all three serve the identical root-layout fallback:
- title: `Smart Live TV` (13 chars)
- description: `Real-time live sports scores, match schedules, league standings, team stats, and global TV broadcast guides for all major sporting events.`

Three distinct pages sharing one title and one description is a direct Search Essentials duplicate-content issue.

### Required Change
Add to each file (import `Metadata` from `next` and `ENV` from `@/lib/config/env` if not already imported):

`app/teams/page.tsx`:
```ts
export const metadata: Metadata = {
  title: 'Football Teams — Squads, Stats & Fixtures | Smart Live TV',
  description: 'Browse football club profiles with current squads, season statistics, recent results and upcoming fixtures across Europe\'s major leagues.',
  alternates: { canonical: `${ENV.BASE_URL}/teams` },
}
```

`app/players/page.tsx`:
```ts
export const metadata: Metadata = {
  title: 'Football Players — Profiles & Season Stats | Smart Live TV',
  description: 'Player profiles with appearances, goals, assists and career history for squads across the Premier League, La Liga, Serie A and more.',
  alternates: { canonical: `${ENV.BASE_URL}/players` },
}
```

`app/events/page.tsx`:
```ts
export const metadata: Metadata = {
  title: 'Sports Fixtures & Results Calendar | Smart Live TV',
  description: 'Full fixture calendar and results archive across football, UFC and Formula 1, with kick-off times and official UK broadcast listings.',
  alternates: { canonical: `${ENV.BASE_URL}/events` },
}
```
Keep every title under 60 characters and every description under 155.

### Verification
```bash
for p in /teams /events /players; do
  curl -s "http://localhost:3000$p" | grep -o '<title>[^<]*</title>'; done
```
Expected: three **different** titles, none equal to `<title>Smart Live TV</title>`.

- **Source**: Audit Persona 4 S-12.

---

## Fix 17: Remove the duplicate Organization and WebSite schema

- **Severity**: 🟡 HIGH
- **Category**: SEO
- **File(s)**: `app/page.tsx`

### Current State
The homepage emits **2× Organization**, **2× WebSite**, **2× SearchAction**, **2× ImageObject**, **2× ContactPoint**. `app/layout.tsx:101` and `:126` emit both on *every* route; `app/page.tsx:146-147` emits them **again**. Both sets use the same `@id` (`#organization`, `#website`) but carry **conflicting** values:

| Property | `app/layout.tsx` | `app/page.tsx` |
|---|---|---|
| `logo` | `/favicon.svg` | `/og-default.png` (1200×630) |
| `availableLanguage` | `["English","Arabic"]` | `["English"]` |
| `foundingDate` | `"2024"` | absent |
| `areaServed` | absent | `"GB"` |
| `SearchAction.target` | `EntryPoint` object | plain string |

Two nodes sharing an `@id` with divergent property values is an ambiguous entity definition.

### Required Change
**Keep the site-wide definitions in `app/layout.tsx`** (they correctly apply to every page) and **delete the homepage duplicates**.

In `app/page.tsx`:
1. Delete the `organizationSchema` and `websiteSchema` constants entirely.
2. Delete these two render lines (146–147):
```diff
-      <SchemaMarkup schema={websiteSchema} />
-      <SchemaMarkup schema={organizationSchema} />
       <SchemaMarkup schema={homepageFAQSchema} />
       <SchemaMarkup schema={speakableSchema} />
```
3. Merge the *better* values from the deleted homepage version into `app/layout.tsx`: use `/og-default.png` (1200×630) as the `logo`, add `areaServed: 'GB'`, add the `knowsAbout` array, and **remove `"Arabic"`** from `availableLanguage` (no Arabic content exists on the site).
4. In the `sameAs` array being merged into layout, **remove the self-reference** `'https://smartlivetv.co.uk'` — `sameAs` is for external identity profiles only. Before keeping `twitter.com/SmartLiveTV`, `facebook.com/SmartLiveTV` and `instagram.com/smartlivetv`, **open each URL and confirm the profile exists**; delete any that 404.

### Verification
```bash
curl -s http://localhost:3000/ | grep -o '"@type":"Organization"' | wc -l
curl -s http://localhost:3000/ | grep -o '"@type":"WebSite"' | wc -l
```
Expected: `1` and `1`.

- **Source**: Audit Persona 4 S-09 and S-10.

---

## Fix 18: Add `SportsEvent` structured data to `/scores` and `/match/[id]`

- **Severity**: 🟡 HIGH
- **Category**: SEO
- **File(s)**: `app/scores/page.tsx`, `app/match/[id]/page.tsx`, `lib/schema.ts`

### Current State
`/scores` — the site's flagship page — ships **no** sports structured data. Its served JSON-LD contains only the inherited `WebSite`, `Organization`, `SearchAction`, `ImageObject`, `ContactPoint` and `EntryPoint`. There is no `SportsEvent`, no `ItemList`, no `BreadcrumbList` anywhere on the site.

Per [schema.org/SportsEvent](https://schema.org/SportsEvent) and [Google's Event structured data documentation](https://developers.google.com/search/docs/appearance/structured-data/event), `SportsEvent` requires `name`, `startDate` and `location`, and uses `competitor` (a `Person` or `SportsTeam`) for participants.

### Required Change
**Step A** — add a builder to `lib/schema.ts`:
```ts
export function buildSportsEventSchema(fixture: {
  homeTeam: string
  awayTeam: string
  startDate: string   // ISO 8601
  venue?: string
  league?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
    startDate: fixture.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: fixture.venue || 'To be confirmed',
    },
    competitor: [
      { '@type': 'SportsTeam', name: fixture.homeTeam },
      { '@type': 'SportsTeam', name: fixture.awayTeam },
    ],
    ...(fixture.league ? { superEvent: { '@type': 'SportsEvent', name: fixture.league } } : {}),
    url: fixture.url,
  }
}
```

**Step B** — on `app/match/[id]/page.tsx`, render one `<SchemaMarkup schema={buildSportsEventSchema(...)} />` for the fixture.

**Step C** — on `app/scores/page.tsx`, render an `ItemList` whose `itemListElement` is an array of `ListItem` entries, each with `item` set to a `SportsEvent` object from the same builder.

**Only emit `startDate` when a real kick-off timestamp is available.** Do not substitute the current time — an invalid `startDate` is worse than omitting the schema.

### Verification
```bash
curl -s http://localhost:3000/scores | grep -c '"@type":"SportsEvent"'
```
Expected: greater than `0`.
Then paste the rendered page source into Google's Rich Results Test and confirm zero errors.

- **Source**: Audit Persona 4 S-11; [schema.org/SportsEvent](https://schema.org/SportsEvent); [Google Event docs](https://developers.google.com/search/docs/appearance/structured-data/event).

---

## Fix 19: Correct the sitemap

- **Severity**: 🟡 HIGH
- **Category**: SEO
- **File(s)**: `app/sitemap.ts`

### Current State
Three separate problems:
1. **Missing real routes.** These return 200 but are absent: `/teams`, `/players`, `/events`, `/search`, `/favorites`. Dynamic hubs are also absent entirely: `/leagues/[id]`, `/teams/[id]`, `/players/[id]`, `/match/[id]`, `/ufc/events/[id]`, `/ufc/fighters/[id]`, `/watch/formula-1/race/[id]`.
2. **Wrong entries present.** Lines 31–32 submit `/llms.txt` and `/llms-full.txt` as indexable pages. These are machine-readable resources for AI crawlers, not pages for the Google index.
3. **Meaningless `lastModified`.** All 22 static entries use `new Date().toISOString()` — i.e. **build time**. Every rebuild tells Google that all 22 pages changed, which devalues the signal.

### Required Change
**Step A** — add the five missing static routes:
```diff
     { url: `${baseUrl}/leagues`, priority: 0.9, changeFrequency: 'daily' as const, lastModified: now },
+    { url: `${baseUrl}/teams`, priority: 0.8, changeFrequency: 'weekly' as const, lastModified: now },
+    { url: `${baseUrl}/players`, priority: 0.7, changeFrequency: 'weekly' as const, lastModified: now },
+    { url: `${baseUrl}/events`, priority: 0.8, changeFrequency: 'daily' as const, lastModified: now },
+    { url: `${baseUrl}/search`, priority: 0.4, changeFrequency: 'monthly' as const, lastModified: now },
```
Do **not** add `/favorites` — it is a personalised empty-state page with no indexable content.

**Step B** — remove the two `llms` entries:
```diff
-    { url: `${baseUrl}/llms.txt`, priority: 0.5, changeFrequency: 'daily' as const, lastModified: now },
-    { url: `${baseUrl}/llms-full.txt`, priority: 0.5, changeFrequency: 'daily' as const, lastModified: now },
```
(They remain fetchable at their URLs and referenced from `robots.txt` and the `<head>` — removing them from the sitemap does not hide them from AI crawlers.)

**Step C** — replace the build-time `lastModified` on **static content pages** (`/about`, `/faq`, `/contact`, `/privacy`, `/terms`) with a fixed date constant that is only bumped when the page actually changes:
```ts
const STATIC_PAGE_UPDATED = '2026-07-31T00:00:00.000Z'
```
Leave `now` on genuinely daily-changing pages (`/`, `/scores`, `/leagues`, `/news`, `/watch/*`).

**Step D** — after Fix 2, confirm the blog spread still generates. It will now emit 23 posts instead of 29.

### Verification
```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "llms"
```
Expected: `0`.
```bash
for p in teams players events search; do
  echo "$p: $(curl -s http://localhost:3000/sitemap.xml | grep -c "/$p<")"; done
```
Expected: `1` for each.

- **Source**: Audit Persona 4 S-13 and S-14.

---

## Fix 20: Resolve the duplicate `Cache-Control` header on live scores

- **Severity**: 🟡 HIGH
- **Category**: Backend / Performance
- **File(s)**: `next.config.mjs`, `app/api/scores/today/route.ts`

### Current State
`/api/scores/today` returns **two** conflicting headers:
```
cache-control: public, max-age=3600, stale-while-revalidate=86400   ← next.config.mjs blanket /api/(.*) rule
cache-control: public, s-maxage=30, stale-while-revalidate=90        ← the route's own header
```
Duplicate `Cache-Control` headers have undefined precedence. The practical result is that a page advertising "updated every 60 seconds" can be served an hour-old payload.

### Required Change
Fix 11 already lowers the blanket rule to `public, max-age=60, stale-while-revalidate=300`. That removes the worst of the conflict, but the duplication remains.

The clean fix is to let each route own its caching. In `next.config.mjs`, scope the general rule so it does not shadow routes that set their own header — narrow `source: '/api/(.*)'` to only the routes that need a default, or remove the blanket rule entirely and set `Cache-Control` explicitly in each `app/api/*/route.ts` handler.

**Recommended:** remove the blanket `/api/(.*)` rule and keep only the two `no-store` rules from Fix 11. Then audit each API route and ensure it sets its own `Cache-Control` matching the TTL policy in `PATTERNS.md` §2:
- static data (leagues, teams, players): `public, s-maxage=2592000, stale-while-revalidate=86400`
- scheduled events: `public, s-maxage=3600, stale-while-revalidate=600`
- live/today: `public, s-maxage=30, stale-while-revalidate=90`

### Verification
```bash
curl -s -D - -o /dev/null http://localhost:3000/api/scores/today | grep -ci "cache-control"
```
Expected: `1` (exactly one Cache-Control header), and its value must be the 30-second one.

- **Source**: Audit Layer 1 B-03.

---

## Fix 21: Replace `unsafe-inline` / `unsafe-eval` CSP with a nonce

- **Severity**: 🟡 HIGH
- **Category**: Security
- **File(s)**: `next.config.mjs`, `middleware.ts`

### Current State
`next.config.mjs:161`:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com
```
[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) and [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) both state that a CSP allowing `unsafe-inline` on `script-src` provides essentially no XSS mitigation. `img-src` also allows bare `http:`, permitting mixed content.

### Required Change
Follow the official [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy): generate a fresh nonce per response in `middleware.ts` and remove the static CSP from `next.config.mjs`.

**Step A** — in `middleware.ts`, generate the nonce and set the header on the response:
```ts
const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.thesportsdb.com https://*.upstash.io https://www.google-analytics.com https://newsdata.io",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')
```
Set `x-nonce` on the forwarded request headers and `Content-Security-Policy` on the response, per the Next.js guide.

**Step B** — extend the middleware `matcher` so it covers page routes, not just `/admin/:path*` and `/api/:path*`. Use the exclusion pattern from the Next.js guide so static assets are skipped.

**Step C** — remove the `Content-Security-Policy` entry from `next.config.mjs:158-170`. Leave all other security headers in place.

**Step D** — the eight `dangerouslySetInnerHTML` JSON-LD script tags must carry the nonce. Read `x-nonce` via `headers()` in the server component and pass `nonce={nonce}` to each `<script>`.

**Note:** `style-src 'unsafe-inline'` is retained deliberately — Next.js and Tailwind inject inline styles, and removing it will break rendering. `script-src` is where the security value is.

**Roll out with `Content-Security-Policy-Report-Only` first**, check the browser console for violations across `/`, `/scores`, `/blog/[slug]` and `/match/[id]`, and only then switch to the enforcing header.

### Verification
```bash
curl -s -D - -o /dev/null http://localhost:3000/ | grep -i "content-security-policy"
```
Expected: contains `nonce-` and does **not** contain `unsafe-inline` or `unsafe-eval` within `script-src`.
Then load `/`, `/scores` and a blog post in the browser and confirm **zero** CSP violations in the console and that all JSON-LD still parses.

- **Source**: Audit Layer 3 SEC-04; [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html); [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy).

---

## Fix 22: Patch the non-breaking dependency advisory

- **Severity**: 🟡 HIGH
- **Category**: Infrastructure
- **File(s)**: `package.json`, `package-lock.json`

### Current State
`npm audit` reports **5 high, 0 critical**. One is fixable without a breaking change; the rest require major upgrades.

| Package | Issue | Fix path |
|---|---|---|
| `brace-expansion` ≤5.0.7 | 2× DoS (exponential expansion, OOM) | `npm audit fix` — **non-breaking** |
| `next` ≤16.3.0-canary.5 | 21 advisories: RSC cache poisoning, SSRF via rewrites and WebSocket upgrades, request smuggling, XSS with CSP nonces, unauthenticated disclosure of internal Server Function endpoints | `next@16.2.12` — **major, breaking** |
| `postcss` ≤8.5.17 | XSS via unescaped `</style>`; path traversal via `sourceMappingURL` | via `next` upgrade |
| `sharp` <0.35.0 | libvips CVE-2026-33327/33328/35590/35591 | `sharp@0.35.3` — breaking |
| `undici` 7.0.0–7.27.2 | TLS bypass via SOCKS5 ProxyAgent; header injection via `Set-Cookie` | transitive |

### Required Change
**Now — apply only the safe fix:**
```bash
npm audit fix
```
Do **not** run `npm audit fix --force`. It would install `next@16.2.12`, a two-major-version jump from 14.2.35 with breaking App Router changes, in the middle of a remediation pass.

**Then** verify nothing regressed:
```bash
npx tsc --noEmit
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
```

**Separately, schedule the Next.js 14 → 16 upgrade as its own task.** The advisory list is serious (SSRF, cache poisoning, unauthenticated endpoint disclosure) and should not be deferred indefinitely — but it must not be bundled into this plan. Note that `sharp` and `postcss` resolve as part of that upgrade.

### Verification
```bash
npm audit --json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.stringify(JSON.parse(d).metadata.vulnerabilities)))"
```
Expected: `high` has decreased from `5` (`brace-expansion` resolved). The `next`/`postcss`/`sharp`/`undici` entries will remain until the major upgrade.

- **Source**: Audit Layer 8.

---

## Fix 23: Repair the failing unit test suite

- **Severity**: 🟡 HIGH
- **Category**: Testing
- **File(s)**: `tests/admin-metrics.test.ts`, `tests/admin-auth.test.ts`, `tests/mobile-responsiveness.test.ts`

### Current State
```
Test Files  3 failed | 1 passed (4)
     Tests  2 failed | 3 passed | 3 skipped (8)
```
- `tests/admin-metrics.test.ts` — **2/2 fail**. `expect(res.ok).toBe(true)` receives `false` at line 7 (`/api/admin/health`) and line 13 (`/api/admin/metrics`).
- `tests/admin-auth.test.ts` — all 3 tests **skipped**, plus a collection error at `createAdminToken` (line 7). Admin authentication has **zero** passing coverage.
- `tests/mobile-responsiveness.test.ts` — **0 tests collected**. It is a Playwright spec sitting in the Vitest directory, so Vitest crashes in `Function.describe`. It is silently testing nothing.

Only `tests/routes.test.ts` passes.

### Required Change
**Step A** — move the misplaced Playwright spec:
```bash
git mv tests/mobile-responsiveness.test.ts e2e/mobile-responsiveness-unit.spec.ts
```
Check first whether `e2e/mobile-responsiveness.spec.ts` already covers the same cases; if so, delete the duplicate instead.

**Step B** — fix `tests/admin-metrics.test.ts`. Investigate *why* `res.ok` is false: call the handler and log `res.status` and the response body. The likely cause is a missing env var (`JWT_SECRET` or an Upstash credential) in the Vitest environment. Either provide the env var via a Vitest setup file, or assert the correct status for an unauthenticated call (probably `401`/`500`) instead of asserting `ok`.

**Step C** — fix `tests/admin-auth.test.ts`. Resolve the `createAdminToken` collection error, then **un-skip** the 3 tests. Given Fix 12 changes this route's behaviour, add a test asserting a malformed payload returns `400`.

### Verification
```bash
npx vitest run
```
Expected: `Test Files 4 passed (4)`, zero failures, zero skipped.

- **Source**: Audit Persona 2 Q-01.

---

## Fix 24: Update the E2E spec, which still asserts the IPTV brand

- **Severity**: 🟡 HIGH
- **Category**: Testing
- **File(s)**: `e2e/smartlivetv.spec.ts`, `full-audit.mjs`

### Current State
`e2e/smartlivetv.spec.ts` still asserts IPTV facts and will fail against the cleaned site:
- line 486: `const prices = ['£12', '£24', '£36', '£54']`
- line 804: `sectionText.includes('£12')`
- lines 815–827: `test('channel counts are consistent (15k for live, 230k for total)')` with `expect(pageText).toContain('230,000')`

`full-audit.mjs:92` contains the inverse assertion — it flags a page as **CRITICAL** for *not* advertising `230,000+`.

### Required Change
**Step A** — in `e2e/smartlivetv.spec.ts`, delete the price array test (around line 486), the `£12` assertion (line 804) and the entire channel-count test block (lines 815–827). Replace them with assertions that match the current product:
```ts
test('homepage shows live score data, not subscription pricing', async ({ page }) => {
  await page.goto('/')
  const text = await page.textContent('body')
  expect(text).not.toMatch(/£\s?(12|29|54)\b/)
  expect(text).not.toMatch(/230,000/)
  expect(text).not.toMatch(/\bIPTV\b/i)
})
```

**Step B** — in `full-audit.mjs`, invert the line 92 check so it flags the presence of `230,000+` / `15,000+` as CRITICAL rather than its absence. Also update the script's page list to the current routes — it should include `/teams`, `/players`, `/events`, and drop `/channels`, `/setup/*`, `/subscribe`, `/iptv-vs-sky-sports` (all deleted).

**Step C** — install the Playwright browsers so the script can actually run:
```bash
npx playwright install chromium
```

### Verification
```bash
grep -c "£12\|230,000\|15,000" e2e/smartlivetv.spec.ts
```
Expected: only occurrences inside `not.toMatch` negative assertions.
```bash
node full-audit.mjs
```
Expected: runs to completion (dev server must be running).

- **Source**: Audit Persona 2 Q-02 and Q-04.

---

## Fix 25: Gate the IndexNow ping behind an explicit flag

- **Severity**: 🟡 HIGH
- **Category**: Infrastructure
- **File(s)**: `package.json`, `scripts/ping-indexnow.js`

### Current State
`package.json:8`:
```json
"build": "npm run generate-posts && node --max-old-space-size=8192 -r ./polyfill-self.cjs node_modules/next/dist/bin/next build && node scripts/ping-indexnow.js"
```
Every `npm run build` — including a developer's local test build and every CI run — submits URLs to the IndexNow API. This produces spurious submissions and can look like spam to the receiving search engines.

### Required Change
Add an early exit at the top of `scripts/ping-indexnow.js`:
```js
if (process.env.INDEXNOW_ENABLED !== 'true') {
  console.log('IndexNow ping skipped (set INDEXNOW_ENABLED=true to enable).');
  process.exit(0);
}
```
Then set `INDEXNOW_ENABLED=true` **only** in the production deployment environment (Vercel project environment variables, Production scope only — not Preview, not Development).

### Verification
```bash
node scripts/ping-indexnow.js
```
Expected: prints `IndexNow ping skipped (set INDEXNOW_ENABLED=true to enable).` and exits 0 without making a network request.

- **Source**: Audit Persona 2 Q-03.

---

## Fix 26: Replace or substantiate the hardcoded homepage statistics

- **Severity**: 🟡 HIGH
- **Category**: Content / SEO
- **File(s)**: `components/homepage/hero-section.tsx`, `components/homepage/LiveStats.tsx`

### Current State
Three unverifiable quantitative claims are hardcoded strings, not measurements:
- `components/homepage/hero-section.tsx:303` — `{ value: '2,500+', label: 'Monthly Matches Tracked' }`
- `components/homepage/LiveStats.tsx:6` — `"2,500+ live sports matches tracked this month"`
- `components/homepage/LiveStats.tsx:11` — `"Complete coverage across 45+ international sports leagues"`

The rendered "PLATFORM HIGHLIGHTS" panel also asserts `100% Official TV Listings`.

Unverifiable numeric claims on a homepage are exactly what a Search Quality Rater penalises under trustworthiness, and Google's 2026 core updates have favoured "data-rich sources" over sites making unsupported claims.

### Required Change
Pick **one** of two approaches. Do not leave the numbers as static strings.

**Option A (preferred) — make them real.** Derive each figure from the data the site already fetches: count distinct fixtures returned in the trailing 30 days, and count distinct leagues in the API response. Render the computed value.

**Option B — replace with claims that are true by construction:**
```diff
-  { value: '2,500+', label: 'Monthly Matches Tracked' },
+  { value: 'Live', label: 'Scores Updated Continuously' },
```
and in `LiveStats.tsx`:
```diff
-  "2,500+ live sports matches tracked this month",
+  "Live scores and fixtures across Europe's major football leagues",
...
-  "Complete coverage across 45+ international sports leagues",
+  "Football, UFC and Formula 1 — fixtures, results and official UK broadcast listings",
```
Also change `100% Official TV Listings` to `Official TV Listings` — dropping the unverifiable `100%`.

### Verification
```bash
grep -rn "2,500\|45+\|100%" components/homepage/
```
Expected: no output, **or** the values are computed from live data rather than string literals.

- **Source**: Audit Persona 3 U-03.

---

## Fix 27: Handle the 20 expired World Cup 2026 articles

- **Severity**: 🟡 HIGH
- **Category**: Content / SEO
- **File(s)**: `content/blog/*.mdx`, `app/watch/world-cup-2026/page.tsx`

### Current State
Of 29 blog articles, **20** are World Cup 2026 fixture guides for matches already played. The tournament ended 19 July 2026 (per `app/watch/world-cup-2026/page.tsx:8`). Titles still live and in the sitemap include `Watch England vs Panama Live Tonight — 10pm BST`, `Watch Brazil vs Norway Live — Sunday July 5`, `Watch Portugal vs Spain Live — Monday July 6`, plus the Round of 32 / Quarter-Finals / Semi-Finals / Final guides.

These promise "tonight" for fixtures weeks in the past. Fix 2 removes 6 of them; roughly 14 remain.

### Required Change
Do **not** delete them — they carry accrued link equity and search history. Convert them into a results archive.

For each expired single-fixture guide:
1. Change the `title` frontmatter from `Watch X vs Y Live — {date}` to `X vs Y — World Cup 2026 Result, Lineups & Report`.
2. Change the `description` to lead with the **final score**.
3. Rewrite the opening "Direct Answer" paragraph to state the result rather than how to watch.
4. Add a link back to a new archive hub.
5. Remove all "tonight", "kick-off in", and countdown language.

For the four stage guides (Round of 32, Quarter-Finals, Semi-Finals, Final), convert each into a completed-stage results table.

Then extend `app/watch/world-cup-2026/page.tsx` into the archive hub: final standings, full results by stage, and links to all the converted articles.

**If the real final scores are not available in the codebase, do not invent them.** Fetch them from TheSportsDB, or mark the affected articles `draft: true` in frontmatter so `generate-posts.js` can exclude them until the data is filled in. (If you take that route, add a `draft` filter to `scripts/generate-posts.js`.)

### Verification
```bash
grep -ril "tonight\|kick-off in" content/blog/ | wc -l
```
Expected: `0`.
```bash
curl -s http://localhost:3000/blog | grep -c "Live Tonight"
```
Expected: `0`.

- **Source**: Audit Persona 3 U-02; Persona 5 C-08.

---

## Fix 28: Fix the `/blog` meta description

- **Severity**: 🟡 HIGH
- **Category**: SEO
- **File(s)**: `app/blog/page.tsx`

### Current State
Currently served:
> *"Read our expert guides, device setup tutorials, and comparison articles. Learn how to stream your favorite sports on **Firestick**, Smart TV, and mobile."*

Title: `Sports Streaming Guides & TV Setup Tips | Smart Live TV`.

### Required Change
```diff
-  title: 'Sports Streaming Guides & TV Setup Tips | Smart Live TV',
-  description: 'Read our expert guides, device setup tutorials, and comparison articles. Learn how to stream your favorite sports on Firestick, Smart TV, and mobile.',
+  title: 'Sports Guides, Fixtures & TV Listings | Smart Live TV',
+  description: 'Editorial guides to football, UFC and Formula 1 fixtures — kick-off times, competition formats, and which official UK broadcaster is showing each event.',
```

### Verification
```bash
curl -s http://localhost:3000/blog | grep -o '<meta name="description" content="[^"]*"'
```
Expected: the new description; no `Firestick`.

- **Source**: Audit Persona 4 S-06.

---

# 🟢 PHASE 3 — MINOR (11 fixes)

---

## Fix 29: Replace the 21 bare `<img>` tags
- **Severity**: 🟢 MINOR · **Category**: Frontend / Performance
- **File(s)**: `app/match/[id]/page.tsx`, `app/watch/champions-league/page.tsx`, `app/watch/europa-league/page.tsx`, `app/watch/[slug]/page.tsx`, `components/homepage/league-tables.tsx`, `components/league/league-detail-view.tsx`, `components/match/match-tabs.tsx`, `components/search/command-palette.tsx`
- **Current State**: 21 raw `<img>` tags bypass Next.js image optimisation, violating `PATTERNS.md` §3 ("All images must use Next.js `Image` wrapper, preferably via `<OptimizedImage />`"). They skip AVIF/WebP conversion and responsive `srcset`, and — because they carry no intrinsic dimensions — contribute to CLS.
- **Required Change**: Replace each with `<OptimizedImage />`, supplying explicit `width` and `height`. All external hosts used (`r2.thesportsdb.com`, `www.thesportsdb.com`, `media.api-sports.io`) are already allow-listed in `next.config.mjs` `images.remotePatterns`, so no config change is needed. Keep the existing letter-avatar fallback behaviour required by `PATTERNS.md` §3.
- **Verification**: `grep -rc "<img " --include=*.tsx app components` → `0`. Then confirm each affected page still renders badges correctly.
- **Source**: Audit Persona 1 F-03.

## Fix 30: Delete the dead `components/home/` directory
- **Severity**: 🟢 MINOR · **Category**: Frontend
- **File(s)**: `components/home/featured-news.tsx`, `components/home/hero-section.tsx`, `components/home/sport-selector.tsx`
- **Current State**: A repo-wide grep for `components/home/` imports across `app/`, `components/` and `lib/` returns **zero** results. The live components are in `components/homepage/`. These three files are dead code that is still type-checked and still counted in Fix 15's guard list.
- **Required Change**: Re-confirm the grep returns nothing, then `git rm -r components/home/`. **Do this before Fix 15** — it removes 3 of the 16 files needing mount guards.
- **Verification**: `grep -rn "components/home/" --include=*.tsx --include=*.ts app components lib` → no output. Then `npx tsc --noEmit` → 0 errors, and `next build` succeeds.
- **Source**: Audit Persona 1 F-05.

## Fix 31: Give team badges meaningful `alt` text
- **Severity**: 🟢 MINOR · **Category**: Accessibility / SEO
- **File(s)**: `app/match/[id]/page.tsx:190`, `components/homepage/hero-section.tsx:172`, `components/homepage/spotlight-events.tsx:180`, `components/league/league-detail-view.tsx:143`, `components/league/league-detail-view.tsx:200`, `components/match/match-tabs.tsx:289`, `components/search/command-palette.tsx:158`
- **Current State**: 7 confirmed instances of `alt=""` on team crests and logos — meaningful imagery marked as decorative. Screen-reader users lose team identity in standings tables and search results, and the site forfeits image-search equity on team-name queries.
- **Required Change**: Replace each `alt=""` with the team or entity name, e.g. `alt={`${team.strTeam} crest`}` / `alt={`${result.title} logo`}`. Where the name may be undefined, fall back to a generic but non-empty string (`alt="Team crest"`). Combine this with Fix 29 — both touch the same lines.
- **Verification**: `grep -rn 'alt=""' --include=*.tsx app components` → no output.
- **Source**: Audit Persona 1 F-04.

## Fix 32: Add `error.tsx` to the remaining route segments
- **Severity**: 🟢 MINOR · **Category**: Frontend
- **File(s)**: create `app/match/error.tsx`, `app/events/error.tsx`, `app/players/error.tsx`, `app/watch/error.tsx`, `app/search/error.tsx`, `app/info/error.tsx`, `app/favorites/error.tsx`
- **Current State**: `error.tsx` exists for `app/`, `blog`, `leagues`, `news`, `scores`, `teams`, `ufc` but not the seven above. The root boundary catches their failures, so a single match-page error blanks the entire shell instead of just that segment.
- **Required Change**: Copy the existing `app/scores/error.tsx` into each location and adjust the copy. Per `PATTERNS.md` §3, the message must be the friendly placeholder (`"Data temporarily unavailable"`) — never a raw error stack.
- **Verification**: `find app -name "error.tsx" | wc -l` → `14`. Then `npx tsc --noEmit` → 0 errors.
- **Source**: Audit Persona 1 F-06.

## Fix 33: Set `<html lang="en-GB">`
- **Severity**: 🟢 MINOR · **Category**: SEO / Accessibility
- **File(s)**: `app/layout.tsx`
- **Current State**: The served HTML has `<html lang="en">` while the WebSite schema declares `inLanguage: "en-GB"`. The site is UK-targeted (BST times, £ pricing, Sky/TNT listings).
- **Required Change**: Change the `<html>` element's `lang` attribute from `"en"` to `"en-GB"`.
- **Verification**: `curl -s http://localhost:3000/ | grep -o '<html[^>]*>'` → contains `lang="en-GB"`.
- **Source**: Audit Persona 1 F-07.

## Fix 34: Trim over-length titles and descriptions
- **Severity**: 🟢 MINOR · **Category**: SEO
- **File(s)**: `app/layout.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`
- **Current State**: Homepage title is 73 chars — `Smart Live TV | Real-Time Live Sports Scores & Global Broadcast Guide` (>60). `/contact` description is 169 chars (>155). `/privacy` (14 chars) and `/terms` (16 chars) titles carry no brand suffix.
- **Required Change**: Homepage title → `Live Sports Scores, Fixtures & TV Guide | Smart Live TV` (55 chars). `/contact` description → `Contact the Smart Live TV editorial and technical team about broadcast guides, live score data, or platform issues.` (115 chars). `/privacy` title → `Privacy Policy | Smart Live TV`. `/terms` title → `Terms of Service | Smart Live TV`.
- **Verification**: re-run the title/description extraction loop; every title ≤60 chars and every description ≤155.
- **Source**: Audit Persona 4 S-16.

## Fix 35: Re-enable type checking and linting in the build
- **Severity**: 🟢 MINOR · **Category**: Infrastructure
- **File(s)**: `next.config.mjs`
- **Current State**: Lines 7–12 set `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`; the build log confirms `Skipping validation of types` / `Skipping linting`. `npx tsc --noEmit` currently passes with 0 errors, so these flags buy nothing today — but they guarantee the *next* type error reaches production silently.
- **Required Change**: Set `typescript.ignoreBuildErrors: false` **after** all phases pass `npx tsc --noEmit`. Then run `next lint`, fix or explicitly disable what it reports, and set `eslint.ignoreDuringBuilds: false`. Do type checking first — it is already green; linting may surface a backlog.
- **Verification**: `node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build` succeeds **without** printing `Skipping validation of types`.
- **Source**: Audit Persona 1 F-02.

## Fix 36: Raise `minimumCacheTTL` for optimised images
- **Severity**: 🟢 MINOR · **Category**: Performance
- **File(s)**: `next.config.mjs:91`
- **Current State**: `minimumCacheTTL: 60` — one minute. The images served are team badges, league logos and player photos, which change roughly once per season. Every 60 seconds Next.js may re-fetch and re-encode them.
- **Required Change**: `minimumCacheTTL: 2592000` (30 days), matching the static-data TTL policy in `PATTERNS.md` §2.
- **Verification**: Load a page with team badges twice, several minutes apart; the second load should serve `/_next/image` from cache. Confirm the `Cache-Control: public, max-age=31536000, immutable` header on `/_next/image` is unchanged.
- **Source**: Audit Layer 6.

## Fix 37: Add Redis reconnection with backoff
- **Severity**: 🟢 MINOR · **Category**: Backend
- **File(s)**: `middleware.ts`
- **Current State**: `getRatelimit()` (lines 15–41) caches the client on first success. If the first Upstash import or connection fails, it assigns the in-memory fallback to the module-level `ratelimit` variable **permanently** — every subsequent request uses the per-instance Map with no retry. A transient Upstash outage at cold start silently disables distributed rate limiting for the lifetime of that instance. (Open item M-04 in the previous tracker.)
- **Required Change**: Track the fallback separately from the real limiter. Record the timestamp when Upstash initialisation fails, and retry after a backoff window (start at 30 s, double to a 5-minute cap) rather than caching the fallback forever.
- **Verification**: Add a unit test that simulates a failed first initialisation followed by a successful retry after the backoff window, and assert the Upstash limiter is used on the second call.
- **Source**: Audit Layer 4.

## Fix 38: Remove the leftover remediation script
- **Severity**: 🟢 MINOR · **Category**: Infrastructure
- **File(s)**: `scripts/fix-iptv-ctas.py`
- **Current State**: A one-off Python remediation script (6 `iptv` matches) left in the repository. It is not referenced by `package.json` and serves no ongoing purpose; its presence implies the codebase still has IPTV CTAs to fix.
- **Required Change**: `git rm scripts/fix-iptv-ctas.py`. Do this **last**, after Phases 1–2 are complete and verified, in case it is useful during remediation.
- **Verification**: `ls scripts/fix-iptv-ctas.py` → `No such file or directory`.
- **Source**: Audit §STEP 4.

## Fix 39: Reconcile `X-Robots-Tag` with `robots.txt`
- **Severity**: 🟢 MINOR · **Category**: SEO
- **File(s)**: `next.config.mjs:125-128`
- **Current State**: `X-Robots-Tag: index, follow` is applied to `source: '/(.*)'` — every path, including `/api/*` and `/admin/*`, which `app/robots.ts` explicitly disallows. Harmless in practice (a disallowed path is not crawled, so the header is not read) but contradictory.
- **Required Change**: Narrow the header's `source` so it excludes `/api/` and `/admin/`, or drop the blanket `X-Robots-Tag` entirely — Google indexes by default, so the header is not doing any work.
- **Verification**: `curl -s -D - -o /dev/null http://localhost:3000/api/leagues | grep -i x-robots-tag` → no output.
- **Source**: Audit Persona 4 S-17.

---

# 💡 PHASE 4 — OPPORTUNITY (2 items to schedule, not execute now)

These are strategic and should be scoped as separate pieces of work. They are listed so they are not lost.

## Fix 40: Add author attribution and an editorial policy
- **Severity**: 💡 OPPORTUNITY · **Category**: Content / SEO
- **Current State**: The site has no author bios, no bylines, no editorial policy and no named humans anywhere. Google's 2026 core updates have consistently favoured brands, official sites and data-rich sources over undifferentiated aggregators.
- **Required Change**: Add an `author` field to blog frontmatter and render a byline with a short bio in `components/blog/BlogPostLayout.tsx`. Add `Person` schema for each author and reference it from the article schema. Create `/about/editorial-policy` covering data sources, refresh cadence, correction process and what the site does when a provider fails. Expand `/about` with named team members.
- **Verification**: Every blog post renders a visible byline; `/about/editorial-policy` returns 200 and is in the sitemap.
- **Source**: Audit Persona 5 C-03, C-09.

## Fix 41: Build the per-country broadcast matrix
- **Severity**: 💡 OPPORTUNITY · **Category**: SEO / Product
- **Current State**: `/watch/*` covers UK broadcasters only. No competitor owns the global, per-fixture, per-territory "where can I legally watch this" answer — and it is exactly the query shape AI answer engines are being asked and cannot currently resolve from a single authoritative source.
- **Required Change**: Extend to `/watch/[competition]/[country]` backed by real broadcast-rights data. Mark each page up with `BroadcastEvent` and `broadcastOfEvent` ([schema.org/BroadcastEvent](https://schema.org/BroadcastEvent)) linked to the `SportsEvent` from Fix 18. Only launch countries where the rights data is verified — a wrong broadcaster listing is worse than no page.
- **Verification**: Each generated page carries valid `BroadcastEvent` markup and passes Google's Rich Results Test.
- **Source**: Audit Persona 5 C-05, C-06.

---

# ✅ Final checklist

Run all of these after completing Phases 1–3. Every one must pass.

```bash
# 1 — types
npx tsc --noEmit                                    # expect: 0 errors

# 2 — unit tests
npx vitest run                                      # expect: 4 passed, 0 failed, 0 skipped

# 3 — domain separation across the whole live site
grep -ric "iptv\|230,000\|£12\|free 24-hour trial\|firestick" \
  app/ components/ lib/ content/ public/llms.txt public/llms-full.txt
                                                    # expect: 0 everywhere

# 4 — the generator's own guard
node scripts/generate-posts.js                      # expect: "Successfully generated N posts", exit 0

# 5 — build (stop the dev server first)
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
                                                    # expect: success, .next/BUILD_ID created

# 6 — commercial endpoints gone, redirects intact
for p in /api/orders /api/subscribe /api/speed-test /login; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)  $p"; done
                                                    # expect: 404 404 404 404
for p in /buy /pricing /free-trial; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)  $p"; done
                                                    # expect: 308 308 308

# 7 — auth responses are not publicly cacheable
curl -s -D - -o /dev/null http://localhost:3000/api/auth/admin/status | grep -i cache-control
                                                    # expect: private, no-store — never "public"

# 8 — schema entities are unique
curl -s http://localhost:3000/ | grep -o '"@type":"Organization"' | wc -l   # expect: 1
curl -s http://localhost:3000/ | grep -o '"@type":"WebSite"' | wc -l        # expect: 1
curl -s http://localhost:3000/scores | grep -c '"@type":"SportsEvent"'      # expect: > 0

# 9 — no duplicate page metadata
for p in /teams /events /players; do
  curl -s "http://localhost:3000$p" | grep -o '<title>[^<]*</title>'; done
                                                    # expect: 3 different titles

# 10 — motion guards
for f in $(grep -rl "framer-motion" --include=*.tsx components app); do
  grep -q "mounted\|ClientOnly" "$f" || echo "UNGUARDED: $f"; done
                                                    # expect: no output
```

---

# 📌 Notes for whoever runs this

- **Do not tick a box without pasting the verification output.** The previous remediation pass recorded C-01a…C-01h, C-04, H-01, H-08 and H-09 as complete when they were not — `app/terms/page.tsx` in particular was recorded as "verified clean" while still being an IPTV subscription contract. Require evidence per line item.
- **Fix 1 must land before Fix 2.** The guard is what stops the regression from recurring; without it, the next `npm run dev` regenerates everything you just cleaned.
- **Fix 30 before Fix 15** — deleting the dead `components/home/` directory removes 3 of the 16 files needing mount guards.
- **Fix 11 and Fix 20 both edit the same `headers()` block** in `next.config.mjs`. Read the file between them.
- **The Next.js 14 → 16 upgrade is deliberately out of scope here.** It is a real and serious security need (SSRF, cache poisoning, unauthenticated endpoint disclosure), but it is a breaking two-major-version jump and must be its own task with its own regression pass.
