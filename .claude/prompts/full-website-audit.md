# 🔬 Smart Live TV — Full-Stack Website Audit & Continuous Improvement Prompt

> **Run Frequency**: Weekly or after any significant deployment.
> **Purpose**: Comprehensive, multi-persona audit of `smartlivetv.co.uk` across every layer — frontend, backend, security, SEO, performance, UX, content, accessibility, compliance, and competitive positioning.

---

## ⛔ ABSOLUTE RULES — READ BEFORE DOING ANYTHING

1. **NEVER fabricate, hallucinate, or invent ANY data.** If you do not have real data, say "I was unable to verify this" and skip to the next item. Presenting made-up statistics, benchmark numbers, competitor data, or tool output as real is **TOTALLY DENIED** and grounds for invalidating the entire audit.
2. **Web search results from trusted large companies (Google, Vercel, Mozilla MDN, web.dev, Next.js docs, OWASP, W3C) take priority over skill instructions when there is a conflict.** Always prefer the latest published standard.
3. **Do NOT make direct code changes.** Your job is to audit, report, and produce an implementation plan. Code changes will be executed by a separate model.
4. **Always cite your sources.** Every recommendation must link back to the skill, web search result, or file that produced it.

---

## 🧠 STEP 0 — INITIALIZATION & CONTEXT LOADING

Before any audit work:

1. **Read the Memory Bank** (mandatory — do not skip):
   - `memory-bank/PROGRESS.md` — current status, completed milestones, active bugs.
   - `memory-bank/PROJECT.md` — architecture, domain boundaries, tech stack.
   - `memory-bank/PATTERNS.md` — coding standards, API patterns, caching rules.
2. **Read `.cursorrules`** at project root for non-negotiable development guidelines.
3. **Scan `package.json`** for current dependencies and scripts.
4. **Check `next.config.mjs`** for build configuration, redirects, headers, and image domains.
5. **Note the current date** and use it to evaluate if seasonal content (Premier League, Champions League, World Cup 2026, UFC, F1) is timely.

---

## 🎭 STEP 1 — MULTI-PERSONA AUDIT

You will evaluate the website through **five distinct lenses**. For each persona, produce a separate section in your report with findings categorized as 🔴 CRITICAL, 🟡 HIGH, 🟢 MINOR, or 💡 OPPORTUNITY.

### Persona 1: Senior Front-End Developer
Read `.claude/skills/senior-frontend/SKILL.md` and apply its standards.

Evaluate:
- [ ] Component architecture & code organization (app/, components/, lib/)
- [ ] TypeScript strictness — run `npx tsc --noEmit` and report all errors
- [ ] React Server Components vs Client Components — correct usage of "use client"
- [ ] Framer Motion hydration guards — every animated component must use `mounted` state
- [ ] Image optimization — all images use `<OptimizedImage />` or Next.js `<Image />`
- [ ] CSS quality — check `globals.css`, Tailwind config for unused utilities, inconsistencies
- [ ] Responsive design — test layouts at 320px, 768px, 1024px, 1440px, 1920px breakpoints
- [ ] Dark mode consistency — no broken contrast, missing theme variables
- [ ] Loading states — every async component has a skeleton/shimmer loader
- [ ] Error boundaries — `error.tsx` and `not-found.tsx` exist and are well-designed
- [ ] Font loading strategy — no CLS from font swap, using `next/font` properly
- [ ] Accessibility — semantic HTML, ARIA labels, keyboard navigation, focus rings
- [ ] Bundle size — check for unnecessary dependencies, tree-shaking issues

### Persona 2: Senior QA Tester
Read `.claude/skills/senior-qa/SKILL.md` and apply its standards.

Execute these functional tests using the browser tool (run against `http://localhost:3000`):
- [ ] **Homepage** (`/`) — Hero renders, live scores widget loads, news section populates, navigation works, all CTAs lead to valid routes
- [ ] **Live Scores** (`/scores`) — Score data loads, auto-refresh works, league filtering works
- [ ] **Leagues** (`/leagues`) — League list renders, clicking a league loads standings/fixtures
- [ ] **Teams** (`/teams/[id]`) — Team profile loads with roster, badge renders or fallback avatar shows
- [ ] **Match Detail** (`/match/[id]`) — Match info loads, event timeline renders
- [ ] **News** (`/news`) — Articles load from API or fallback, pagination works
- [ ] **Blog** (`/blog`) — Blog post list renders, individual posts render with proper layout
- [ ] **UFC** (`/ufc`) — Fighter cards load, event schedule renders
- [ ] **Watch Pages** (`/watch/premier-league`, `/watch/champions-league`, etc.) — Broadcast guide content renders
- [ ] **About** (`/about`), **FAQ** (`/faq`), **Contact** (`/contact`), **Privacy** (`/privacy`), **Terms** (`/terms`) — All static pages render without errors
- [ ] **Search** (`/search`) — Command palette opens, search returns results
- [ ] **Favorites** (`/favorites`) — Empty state shows proper messaging
- [ ] **404 Page** — Navigate to invalid route, verify custom 404 renders
- [ ] **Sitemap** (`/sitemap.xml`) — Valid XML renders with all routes
- [ ] **robots.txt** (`/robots.txt`) — Proper crawl directives
- [ ] **All navigation links** — Click every nav link in header and footer, verify no broken links
- [ ] **Mobile responsiveness** — Test critical pages at mobile viewport
- [ ] **Console errors** — Check browser console for JavaScript errors on every page visited
- [ ] **Buy/Pricing/Free-Trial redirects** — Verify these redirect to external store domain, NOT show IPTV content

### Persona 3: End-User / Customer
Browse the site as a real sports fan would:
- [ ] Is it immediately clear what this website does within 3 seconds?
- [ ] Can I find live scores for today's matches within 2 clicks?
- [ ] Is the navigation intuitive? Can I find Premier League standings easily?
- [ ] Are the scores/data showing current, real information (not stale/cached from wrong season)?
- [ ] Does the season string show the correct current season (e.g., "2025-2026")?
- [ ] Is any content confusing, misleading, or feels "AI-generated filler"?
- [ ] Are there any dead-end pages where I get stuck with no way to navigate back?
- [ ] Is the dark mode comfortable to read? Any text hard to see?
- [ ] Do animations feel smooth or janky? Any layout shifts?
- [ ] Would I bookmark this site? What would make me come back?
- [ ] What features are competitors offering that this site lacks?

### Persona 4: Google Search Quality Rater / Webmaster Guidelines Reviewer
Read `.claude/skills/seo-audit/SKILL.md`, `.claude/skills/aeo/SKILL.md`, `.claude/skills/schema-markup/SKILL.md`, and `.claude/skills/site-architecture/SKILL.md`.

Evaluate:
- [ ] **E-E-A-T signals** — Experience, Expertise, Authoritativeness, Trustworthiness. Does the site demonstrate real editorial expertise?
- [ ] **Title tags** — Every page has a unique, descriptive title under 60 chars
- [ ] **Meta descriptions** — Every page has a unique description under 155 chars
- [ ] **Heading hierarchy** — Single H1 per page, proper H2→H6 nesting
- [ ] **Structured data / JSON-LD** — Check all schemas in `lib/schema.ts` and `lib/structured-data.ts`. Are they valid? Are they appropriate for a sports data site (SportsEvent, Organization, WebSite, FAQPage, BreadcrumbList, SpeakableSpecification)?
- [ ] **No IPTV remnants** — ZERO references to IPTV, illegal streaming, channel counts, or subscription sales on the main domain. Scan ALL component text, meta tags, alt text, schema descriptions, FAQ answers, and blog content.
- [ ] **Canonical URLs** — Proper canonical tags, no duplicate content
- [ ] **Internal linking** — Good link equity distribution, no orphan pages
- [ ] **Sitemap completeness** — `sitemap.ts` generates all public routes
- [ ] **robots.ts** — Proper allow/disallow rules
- [ ] **Core Web Vitals readiness** — LCP, FID/INP, CLS considerations in code
- [ ] **Mobile-first indexing readiness** — All critical content visible on mobile
- [ ] **IndexNow integration** — `scripts/ping-indexnow.js` properly pings on build
- [ ] **AEO/GEO readiness** — Answer-first content structures, speakable schema

### Persona 5: CEO — "My Life Depends on This Site Reaching Top 5"
Think analytically. Think out of the box. Your survival depends on this site outranking competitors.
- [ ] What is the site's unique competitive advantage vs ESPN, BBC Sport, FlashScore, SofaScore, LiveScore?
- [ ] What content/features would create a "10x moat" that competitors can't easily replicate?
- [ ] What quick wins could move rankings significantly with minimal effort?
- [ ] Are there any untapped search verticals or long-tail keyword clusters?
- [ ] Is the site's content fresh enough? Is the blog being updated regularly?
- [ ] What seasonal opportunities are coming up (transfer windows, new seasons, World Cup 2026 qualifiers, major UFC events, F1 calendar)?
- [ ] Are there any trust signals missing (About page depth, author bios, contact information, social proof)?
- [ ] What would make a sports journalist or broadcaster link to this site?
- [ ] Is the site monetization-ready if/when traffic hits critical mass?
- [ ] What partnerships or integrations would accelerate growth?

---

## 🌐 STEP 2 — WEB SEARCH FOR LATEST BEST PRACTICES

Perform web searches (minimum 5 separate searches) for the **latest** information. Focus on the niche of **sports data platforms, live scores websites, and broadcast guides** — **NOT IPTV** (IPTV traffic tunneling is handled by a separate prompt).

### Required Searches:
1. **"best practices live sports scores website SEO 2026"** — Latest SEO standards for sports data sites
2. **"Next.js 14 performance optimization best practices 2026"** — Framework-specific optimizations
3. **"Google Search algorithm updates 2026"** — Any recent algorithm changes affecting content sites
4. **"Core Web Vitals improvements Next.js 2026"** — Latest CWV optimization techniques
5. **"sports website structured data schema.org 2026"** — Latest schema markup for sports content
6. **"website security headers best practices 2026"** — Latest security header recommendations
7. **"Answer Engine Optimization AEO best practices 2026"** — How to optimize for AI search results
8. **Additional searches** as needed based on findings from the multi-persona audit

### Search Rules:
- Only use information from **trusted, authoritative sources**: Google (web.dev, developers.google.com), Mozilla MDN, Vercel docs, Next.js docs, Schema.org, OWASP, W3C, and major tech publications.
- If a web search result contradicts a `.claude/skills/` instruction, **the web search result wins** if it's from a trusted source and more recent.
- **Report every new finding** that the project might not already be following.
- **Flag any new standard** that the codebase has never implemented.

---

## 🔍 STEP 3 — DEEP LAYER-BY-LAYER TECHNICAL AUDIT

### Layer 1: Backend / API Layer
- [ ] Review `app/api/` routes — proper error handling, status codes, response formats
- [ ] Review `lib/api/unified-sports-api.ts` — rate limiting, caching, error recovery
- [ ] Review `lib/cache/apiCache.ts` — TTL values match PATTERNS.md specifications
- [ ] Check for any hardcoded API keys or secrets in source code (grep for patterns like `apikey=`, `Bearer `, `password`, `secret`)
- [ ] Verify `.env.local` variables are not committed to git
- [ ] Check API proxy routes for proper CORS headers
- [ ] Verify TheSportsDB rate limiter is enforcing 25 req/min

### Layer 2: Frontend / UI Layer
- [ ] Run TypeScript compilation check: `npx tsc --noEmit`
- [ ] Check for unused imports, dead code, commented-out blocks
- [ ] Verify all dynamic imports use proper loading fallbacks
- [ ] Check for proper error boundaries on every route segment
- [ ] Review animation performance — no heavy animations on scroll
- [ ] Check for proper `key` props in all `.map()` rendered lists

### Layer 3: Security Layer
Read `.claude/skills/security-pen-testing/SKILL.md`.
- [ ] Review `middleware.ts` — JWT validation, rate limiting logic
- [ ] Check for XSS vulnerabilities in user-input rendering
- [ ] Verify all external links use `rel="noopener noreferrer"`
- [ ] Check Content Security Policy headers in `next.config.mjs`
- [ ] Verify no sensitive data in client-side bundles
- [ ] Check for CSRF protection on form submissions
- [ ] Review admin auth flow for vulnerabilities
- [ ] Check HTTP security headers: HSTS, X-Frame-Options, X-Content-Type-Options

### Layer 4: Caching Layer
- [ ] Review Redis/Upstash configuration and connection handling
- [ ] Verify in-memory cache TTLs match documentation
- [ ] Check Next.js ISR/SSG revalidation intervals
- [ ] Review CDN cache headers for static assets
- [ ] Check for cache stampede protection
- [ ] Verify stale-while-revalidate patterns are used correctly

### Layer 5: SEO & Content Layer
Read `.claude/skills/seo-audit/SKILL.md`, `.claude/skills/content-strategy/SKILL.md`, `.claude/skills/programmatic-seo/SKILL.md`.
- [ ] Run the existing audit script: `node full-audit.mjs` and analyze results
- [ ] Check all pages have unique titles and meta descriptions
- [ ] Verify structured data is valid (test with Google Rich Results Test mentally)
- [ ] Check internal linking structure
- [ ] Verify blog content is high-quality and E-E-A-T compliant
- [ ] Check for thin content pages
- [ ] Verify all images have descriptive alt text
- [ ] Review `sitemap.ts` for completeness
- [ ] Check hreflang tags if applicable

### Layer 6: Performance & Infrastructure
Read `.claude/skills/performance-profiler/SKILL.md`.
- [ ] Review `next.config.mjs` for optimization settings
- [ ] Check image optimization pipeline (sharp, formats, sizing)
- [ ] Review bundle size — identify heavy dependencies
- [ ] Check for render-blocking resources
- [ ] Verify server-side rendering is working correctly
- [ ] Check for memory leaks in long-running processes
- [ ] Review Vercel deployment configuration

### Layer 7: Testing & CI/CD
Read `.claude/skills/senior-qa/SKILL.md`.
- [ ] Review existing tests in `tests/` and `e2e/`
- [ ] Identify untested critical paths
- [ ] Check Playwright E2E test coverage
- [ ] Review Vitest unit test coverage
- [ ] Check if `full-audit.mjs` page list matches current routes (update if needed)
- [ ] Verify build pipeline: `npm run build` completes without errors

### Layer 8: Dependency & Supply Chain
Read `.claude/skills/dependency-auditor/SKILL.md`.
- [ ] Check for outdated dependencies: compare against latest versions
- [ ] Identify known security vulnerabilities in dependencies
- [ ] Check for unused dependencies that increase bundle size
- [ ] Verify devDependencies vs dependencies classification is correct

---

## 🛡️ STEP 4 — DOMAIN SEPARATION COMPLIANCE CHECK

This is a **non-negotiable** check. Scan the ENTIRE codebase for any remnants of IPTV/commercial content on the main domain:

```
Forbidden terms to grep (case-insensitive):
- "iptv" (except in smartlivetv-store/ directory and memory-bank/)
- "subscribe now"
- "free trial" (as sales CTA, not as redirect stub)
- "channel library"
- "230,000" or "230K" (channel count claims)
- "15,000" or "15K" (old channel count)
- "firestick setup" (as main-domain content)
- "illegal streaming"
- "cord-cutting"
- "cable replacement"
- Pricing tiers: "Starter", "Sports Fan", "Ultimate" (as product plans)
- "£12", "£29", "£54" (subscription prices)
```

Report ANY match found outside of `smartlivetv-store/`, `memory-bank/`, and legitimate redirect stubs.

---

## 📊 STEP 5 — GSC DATA ANALYSIS (if available)

If Google Search Console MCP tools are available, run:
1. `site_snapshot` — Overall performance metrics
2. `check_alerts` — Any SEO alerts or drops
3. `quick_wins` — Keywords close to page 1
4. `content_gaps` — Missing content opportunities
5. `content_decay` — Pages losing traffic
6. `traffic_drops` — Recent traffic losses
7. `ctr_opportunities` — Pages with low CTR for their position
8. `cannibalization_check` — Pages competing against each other
9. `content_recommendations` — Prioritized action items

Report ALL findings with exact numbers. Do NOT speculate about causes unless the data explicitly supports it.

---

## 📋 STEP 6 — CONSOLIDATED FINDINGS & IMPLEMENTATION PLAN

### 6A. Save Audit Results
Save the complete audit findings to `reports/audit-YYYY-MM-DD.md` with:
- Date and time of audit
- Summary statistics (total issues by severity)
- All persona findings
- All technical findings
- All web search discoveries
- GSC data analysis (if available)

### 6B. Generate Implementation Plan
Create a **crystal-clear implementation plan** at `reports/implementation-plan-YYYY-MM-DD.md` that a **fast, less-capable model can execute without ambiguity**. 

The plan MUST follow this format for EVERY item:

```markdown
## Fix [N]: [Title]
- **Severity**: 🔴 CRITICAL / 🟡 HIGH / 🟢 MINOR / 💡 OPPORTUNITY
- **Category**: Frontend / Backend / Security / SEO / Performance / Content / Infrastructure
- **File(s)**: Exact file path(s) to modify
- **Current State**: What the code/content currently looks like (include line numbers if possible)
- **Required Change**: Exact description of what to change
- **Code Example** (if applicable):
  ```diff
  - old code
  + new code
  ```
- **Verification**: How to confirm the fix works
- **Source**: Skill name, web search URL, or audit finding that produced this recommendation
```

### Priority Order:
1. 🔴 CRITICAL — Security vulnerabilities, broken functionality, compliance violations
2. 🟡 HIGH — SEO issues, performance problems, major UX issues
3. 🟢 MINOR — Code quality, minor UI polish, documentation
4. 💡 OPPORTUNITY — New features, competitive advantages, growth opportunities

---

## 🧠 STEP 7 — MEMORY BANK UPDATE

After completing the audit, update the memory bank:

1. **Update `memory-bank/PROGRESS.md`**:
   - Add a new section under "Active Context" with audit date and key findings summary
   - Update "Next Steps" with the top 5 most impactful action items
   - Add any new bugs discovered to the Trouble Registry

2. **Update `memory-bank/PROJECT.md`** (only if the audit revealed):
   - New tech stack components
   - Changed repository structure
   - New third-party integrations
   - Updated domain boundaries

3. **Update `memory-bank/PATTERNS.md`** (only if the audit revealed):
   - New coding patterns that should be standardized
   - Updated API patterns or gotchas
   - New non-negotiable rules

---

## 💾 STEP 8 — TOKEN OPTIMIZATION

To minimize token usage in future sessions:
1. Save all verbose audit data to the `reports/` directory — do NOT keep it in memory bank
2. Memory bank files should contain only **distilled summaries** and **actionable next steps**
3. The implementation plan should be self-contained — a new model reading ONLY the implementation plan should be able to execute every fix without reading the full audit
4. Use the `reports/audit-YYYY-MM-DD.md` file as the "source of truth" archive — memory bank points to it but doesn't duplicate it

---

## ✅ COMPLETION CHECKLIST

Before finishing, confirm:
- [ ] All 5 personas have provided their findings
- [ ] Minimum 5 web searches were performed for latest best practices
- [ ] All 8 technical layers were audited
- [ ] Domain separation compliance check was performed with grep
- [ ] GSC data was analyzed (if available)
- [ ] Implementation plan is saved with clear, executable instructions
- [ ] Memory bank is updated
- [ ] No data was fabricated — every claim is backed by real evidence
- [ ] TypeScript compilation was checked
- [ ] Browser testing was performed on critical pages
- [ ] The implementation plan is clear enough for a junior developer to follow

---

> **Remember**: You are a CEO whose life depends on this website reaching the top 5. Every detail matters. Every pixel matters. Every millisecond of load time matters. Think analytically. Think creatively. Find opportunities that no one else would think of. But NEVER make up data to support your recommendations.
