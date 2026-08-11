// tests/smartlivetv.spec.ts
import { test, expect, Page } from '@playwright/test'

const BASE = 'https://smartlivetv.co.uk'
// For local: const BASE = 'http://localhost:3000'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 1 — SEO CRITICAL (these failures = Google won't index you)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('SEO — Critical Indexing Requirements', () => {

    test('robots.txt must NOT block Googlebot', async ({ request }) => {
        const res = await request.get(`${BASE}/robots.txt`)
        expect(res.status()).toBe(200)
        const body = await res.text()

        // Must allow everything
        expect(body).not.toContain('Disallow: /')

        // Must block only these specific paths
        expect(body).toContain('Disallow: /api/')
        expect(body).toContain('Disallow: /admin/')

        // Must point to correct domain sitemap
        expect(body).toContain('smartlivetv.co.uk/sitemap.xml')

        // Must NOT reference vercel.app
        expect(body).not.toContain('vercel.app')

        console.log('Live robots.txt:\n', body)
    })

    test('canonical tags must point to .co.uk not .com', async ({ page }) => {
        const pagesToCheck = [
            '/',
            '/scores',
            '/leagues',
            '/teams',
            '/ufc',
            '/faq',
            '/watch/premier-league',
            '/watch/world-cup-2026',
            '/news',
            '/blog',
        ]

        for (const path of pagesToCheck) {
            await page.goto(`${BASE}${path}`)
            const canonical = await page.$eval(
                'link[rel="canonical"]',
                (el) => el.getAttribute('href')
            ).catch(() => null)

            expect(canonical, `No canonical on ${path}`).not.toBeNull()
            expect(
                canonical,
                `Canonical on ${path} points to wrong domain: ${canonical}`
            ).toContain('smartlivetv.co.uk')
            expect(
                canonical,
                `Canonical on ${path} still references .com: ${canonical}`
            ).not.toContain('smartlivetv.com')
            expect(
                canonical,
                `Canonical on ${path} still references vercel.app`
            ).not.toContain('vercel.app')
        }
    })

    test('sitemap.xml returns 200 and contains critical pages', async ({ request }) => {
        const res = await request.get(`${BASE}/sitemap.xml`)
        expect(res.status()).toBe(200)

        const body = await res.text()
        const criticalPages = [
            '/scores',
            '/leagues',
            '/teams',
            '/watch/premier-league',
            '/watch/world-cup-2026',
            '/ufc',
            '/faq',
            '/news',
            '/blog',
        ]

        for (const page of criticalPages) {
            expect(
                body,
                `Sitemap missing: ${page}`
            ).toContain(`smartlivetv.co.uk${page}`)
        }

        // Must NOT reference wrong domains
        expect(body).not.toContain('smartlivetv.com')
        expect(body).not.toContain('vercel.app')

        // Count URLs
        const urlCount = (body.match(/<loc>/g) || []).length
        console.log(`Sitemap URL count: ${urlCount}`)
        expect(urlCount).toBeGreaterThan(10)
    })

    test('every page has unique title and meta description', async ({ page }) => {
        const pages = [
            { path: '/', titleMustContain: 'Smart Live TV' },
            { path: '/scores', titleMustContain: 'Scores' },
            { path: '/leagues', titleMustContain: 'Leagues' },
            { path: '/watch/premier-league', titleMustContain: 'Premier League' },
            { path: '/ufc', titleMustContain: 'UFC' },
            { path: '/faq', titleMustContain: 'FAQ' },
        ]

        const titles = new Set<string>()
        const descriptions = new Set<string>()

        for (const { path, titleMustContain } of pages) {
            await page.goto(`${BASE}${path}`)

            const title = await page.title()
            const description = await page.$eval(
                'meta[name="description"]',
                (el) => el.getAttribute('content')
            ).catch(() => null)

            // Title must not be duplicate
            expect(
                titles.has(title),
                `Duplicate title found on ${path}: "${title}"`
            ).toBeFalsy()
            titles.add(title)

            // Title must contain relevant keyword
            expect(
                title,
                `Title on ${path} missing "${titleMustContain}"`
            ).toContain(titleMustContain)

            // Title must not have double suffix
            const doubleCount = (title.match(/Smart Live TV/g) || []).length
            expect(
                doubleCount,
                `Double brand suffix on ${path}: "${title}"`
            ).toBeLessThanOrEqual(1)

            // Meta description must exist
            expect(
                description,
                `No meta description on ${path}`
            ).not.toBeNull()

            // Meta description must be under 160 chars
            expect(
                description!.length,
                `Meta description too long on ${path}: ${description!.length} chars`
            ).toBeLessThanOrEqual(160)

            // No duplicates
            expect(
                descriptions.has(description!),
                `Duplicate description on ${path}`
            ).toBeFalsy()
            descriptions.add(description!)
        }
    })

    test('schema markup is present and valid on key pages', async ({ page }) => {
        const schemaTests = [
            {
                path: '/',
                expectedTypes: ['Organization', 'WebSite'],
                mustHaveId: true,
            },
            {
                path: '/pricing',
                expectedTypes: ['Product', 'FAQPage'],
                mustHaveId: true,
            },
            {
                path: '/faq',
                expectedTypes: ['FAQPage'],
                mustHaveId: false,
            },
            {
                path: '/setup/firestick',
                expectedTypes: ['HowTo', 'FAQPage'],
                mustHaveId: false,
            },
            {
                path: '/blog/is-iptv-legal-uk',
                expectedTypes: ['Article'],
                mustHaveId: false,
            },
        ]

        for (const { path, expectedTypes, mustHaveId } of schemaTests) {
            await page.goto(`${BASE}${path}`)

            const schemas = await page.$$eval(
                'script[type="application/ld+json"]',
                (scripts) => scripts.map((s) => {
                    try { return JSON.parse(s.textContent || '') }
                    catch { return null }
                }).filter(Boolean)
            )

            expect(
                schemas.length,
                `No schema found on ${path}`
            ).toBeGreaterThan(0)

            const allTypes = schemas.map((s: any) => s['@type']).flat()

            for (const expectedType of expectedTypes) {
                expect(
                    allTypes,
                    `Missing ${expectedType} schema on ${path}`
                ).toContain(expectedType)
            }

            if (mustHaveId) {
                const hasId = schemas.some((s: any) => s['@id'])
                expect(
                    hasId,
                    `Schema on ${path} missing @id (required for entity disambiguation)`
                ).toBeTruthy()
            }
        }
    })

    test('H1 exists and is unique on every page', async ({ page }) => {
        const pagesToCheck = [
            '/pricing',
            '/buy',
            '/free-trial',
            '/channels',
            '/watch/premier-league',
            '/watch/champions-league',
            '/watch/world-cup-2026',
            '/ufc',
            '/faq',
            '/about',
            '/contact',
        ]

        for (const path of pagesToCheck) {
            await page.goto(`${BASE}${path}`)

            const h1s = await page.$$('h1')
            expect(
                h1s.length,
                `No H1 on ${path}`
            ).toBeGreaterThan(0)

            expect(
                h1s.length,
                `Multiple H1s on ${path} — only one allowed`
            ).toBe(1)

            const h1Text = await h1s[0].textContent()
            expect(
                h1Text?.trim().length,
                `H1 is empty on ${path}`
            ).toBeGreaterThan(5)

            // Check for the known "UFCOCTAGON" bug
            expect(
                h1Text,
                `H1 still has concatenation bug on ${path}: "${h1Text}"`
            ).not.toContain('UFCOCTAGON')

            console.log(`${path} H1: "${h1Text?.trim()}"`)
        }
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 2 — DEAD LINKS & NAVIGATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Navigation — No Dead Ends', () => {

    test('no href="#" dead links anywhere on homepage', async ({ page }) => {
        await page.goto(BASE)

        const deadLinks = await page.$$eval('a[href="#"]', (links) =>
            links.map((l) => ({
                text: l.textContent?.trim(),
                href: l.getAttribute('href'),
                className: l.className,
            }))
        )

        if (deadLinks.length > 0) {
            console.error('Dead links found:', deadLinks)
        }

        expect(
            deadLinks.length,
            `Found ${deadLinks.length} dead href="#" links on homepage`
        ).toBe(0)
    })

    test('all header navigation links resolve to 200', async ({ page, request }) => {
        await page.goto(BASE)

        const navLinks = await page.$$eval(
            'header a[href^="/"]',
            (links) => [...new Set(links.map((l) => l.getAttribute('href')))]
        )

        for (const href of navLinks) {
            if (!href || href === '/') continue
            const res = await request.get(`${BASE}${href}`)
            expect(
                res.status(),
                `Header link ${href} returned ${res.status()}`
            ).toBeLessThan(400)
        }
    })

    test('footer links all resolve without 404', async ({ page, request }) => {
        await page.goto(BASE)

        const footerLinks = await page.$$eval(
            'footer a[href^="/"]',
            (links) => [...new Set(links.map((l) => l.getAttribute('href')))]
        )

        for (const href of footerLinks) {
            if (!href) continue
            const res = await request.get(`${BASE}${href}`)
            expect(
                res.status(),
                `Footer link ${href} returned ${res.status()}`
            ).not.toBe(404)
        }
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('Buy Now buttons go to /buy not /free-trial', async ({ page }) => {
        await page.goto(BASE)

        const buyButtons = await page.$$eval(
            'a',
            (links) => links
                .filter((l) => {
                    const text = l.textContent?.toLowerCase() || ''
                    return (
                        text.includes('get access') ||
                        text.includes('buy now') ||
                        text.includes('get instant access') ||
                        text.includes('watch now') ||
                        text.includes('start watching')
                    )
                })
                .map((l) => ({
                    text: l.textContent?.trim(),
                    href: l.getAttribute('href'),
                }))
        )

        for (const btn of buyButtons) {
            expect(
                btn.href,
                `"${btn.text}" should go to /buy not ${btn.href}`
            ).toBe('/buy')
        }
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('Free Trial buttons only go to /free-trial', async ({ page }) => {
        await page.goto(BASE)

        const trialButtons = await page.$$eval(
            'a',
            (links) => links
                .filter((l) => {
                    const text = l.textContent?.toLowerCase() || ''
                    return (
                        text.includes('free trial') ||
                        text.includes('try free') ||
                        text.includes('24h trial') ||
                        text.includes('24-hour trial')
                    )
                })
                .map((l) => ({
                    text: l.textContent?.trim(),
                    href: l.getAttribute('href'),
                }))
        )

        for (const btn of trialButtons) {
            expect(
                btn.href,
                `"${btn.text}" links to ${btn.href} instead of /free-trial`
            ).toBe('/free-trial')
        }
    })

    test('404 page exists and is helpful', async ({ page }) => {
        await page.goto(`${BASE}/this-page-does-not-exist-12345`)

        // Should not show a blank page
        const bodyText = await page.textContent('body')
        expect(bodyText?.length).toBeGreaterThan(100)

        // Should have a link back home
        const homeLink = await page.$('a[href="/"]')
        expect(homeLink, '404 page has no link back to homepage').not.toBeNull()

        // Should have a useful heading
        const h1 = await page.$('h1')
        expect(h1, '404 page has no H1').not.toBeNull()
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 3 — CONVERSION FUNNEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Conversion Funnel — Forms and CTAs', () => {

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('/buy page loads and has a functional form', async ({ page }) => {
        await page.goto(`${BASE}/buy`)

        // Page must load
        expect(page.url()).toContain('/buy')

        // Must have plan selector
        const planButtons = await page.$$('[data-plan], button:has-text("Month"), button:has-text("Popular")')
        expect(planButtons.length, 'No plan selector on /buy page').toBeGreaterThan(0)

        // Must have name field
        const nameInput = await page.$('input[type="text"], input[placeholder*="name" i]')
        expect(nameInput, 'No name field on /buy').not.toBeNull()

        // Must have email field
        const emailInput = await page.$('input[type="email"]')
        expect(emailInput, 'No email field on /buy').not.toBeNull()

        // Must have WhatsApp/phone field
        const phoneInput = await page.$('input[type="tel"]')
        expect(phoneInput, 'No WhatsApp/phone field on /buy').not.toBeNull()

        // Submit button must exist
        const submitBtn = await page.$('button:has-text("Access"), button:has-text("Get"), button[type="submit"]')
        expect(submitBtn, 'No submit button on /buy').not.toBeNull()
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('buy form validates required fields before submitting', async ({ page }) => {
        await page.goto(`${BASE}/buy`)

        // Click submit without filling anything
        const submitBtn = await page.$('button:has-text("Access"), button:has-text("Get"), button[type="submit"]')
        if (submitBtn) {
            await submitBtn.click()

            // Should show validation error, not submit
            await page.waitForTimeout(500)

            // Should not show success state
            const successState = await page.$('text=Order Received, text=credentials, text=WhatsApp within')
            expect(successState, 'Form submitted without required fields').toBeNull()

            // Should show error message
            const errorMsg = await page.$('[class*="red"], [class*="error"], text=required, text=Please fill')
            expect(errorMsg, 'No validation error shown for empty form').not.toBeNull()
        }
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('/free-trial page has form with correct fields', async ({ page }) => {
        await page.goto(`${BASE}/free-trial`)

        expect(page.url()).toContain('/free-trial')

        const nameInput = await page.$('input[placeholder*="name" i], input[name="name"]')
        expect(nameInput, 'No name field on /free-trial').not.toBeNull()

        const emailInput = await page.$('input[type="email"]')
        expect(emailInput, 'No email field on /free-trial').not.toBeNull()
    })

    test('commercial routes redirect off the main domain', async ({ page }) => {
        for (const path of ['/buy', '/pricing', '/free-trial']) {
            const res = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
            // Either a redirect chain landing off-domain, or a 3xx — never a
            // rendered commercial page on smartlivetv.co.uk.
            const finalUrl = page.url()
            expect(
                finalUrl.includes('smartlivetv-store.com') || (res?.status() ?? 0) >= 300,
                `${path} should redirect to the store domain, landed on ${finalUrl}`
            ).toBeTruthy()
        }
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 4 — API DATA QUALITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('API Data — No Stale or Mock Data', () => {

    test('news API returns real articles not blog fallbacks', async ({ request }) => {
        const res = await request.get(`${BASE}/api/news`)
        expect(res.status()).toBe(200)

        const data = await res.json()
        const articles = data?.articles || data?.results || []

        expect(articles.length, 'No articles returned').toBeGreaterThan(0)

        // Check for duplicates
        const titles = articles.map((a: any) => a.title)
        const uniqueTitles = new Set(titles)
        expect(
            uniqueTitles.size,
            `Duplicate articles: ${titles.length} total, ${uniqueTitles.size} unique`
        ).toBe(titles.length)

        // No dead links
        for (const article of articles.slice(0, 5)) {
            const link = article.link || article.url || ''
            expect(
                link,
                `Article "${article.title}" has dead link: ${link}`
            ).not.toBe('#')
            expect(link).not.toBe('')

            // Must not all point to same URL (the sky sports bug)
            expect(
                link,
                'All articles point to skysports.com (dedup collapse bug)'
            ).not.toBe('https://www.skysports.com/premier-league-transfers')
        }

        console.log(`News articles: ${articles.length} unique articles`)
        console.log('First 3 titles:', titles.slice(0, 3))
    })

    test('fixtures API returns valid dates not year 5998', async ({ request }) => {
        const res = await request.get(`${BASE}/api/fixtures/today`)

        if (res.status() !== 200) {
            console.log('Fixtures API status:', res.status())
            return // Skip if no fixtures today
        }

        const data = await res.json()
        const allFixtures = [
            ...(data?.upcoming || []),
            ...(data?.results || []),
        ]

        for (const fixture of allFixtures) {
            if (!fixture.date) continue
            const year = new Date(fixture.date).getFullYear()
            expect(
                year,
                `Invalid year ${year} in fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}`
            ).toBeGreaterThan(2020)
            expect(year).toBeLessThan(2030)
        }
    })

    test('league standings load real data for Premier League', async ({ page }) => {
        await page.goto(`${BASE}/watch/premier-league`)

        // Wait for standings to load
        await page.waitForTimeout(3000)

        // Should show team names — check for known PL teams
        const pageText = await page.textContent('body')
        const knownTeams = ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea']

        let teamsFound = 0
        for (const team of knownTeams) {
            if (pageText?.includes(team)) teamsFound++
        }

        expect(
            teamsFound,
            `No Premier League teams found in standings (found ${teamsFound}/4)`
        ).toBeGreaterThan(0)
    })

    test('UFC page shows events from 2025 or later not 2024', async ({ page }) => {
        await page.goto(`${BASE}/ufc`)
        await page.waitForTimeout(2000)

        const pageText = await page.textContent('body')

        // Must not show stale 2024 events
        expect(
            pageText,
            'UFC page still showing stale 2024 events'
        ).not.toContain('November 2024')
        expect(pageText).not.toContain('October 2024')
        expect(pageText).not.toContain('UFC 309')
        expect(pageText).not.toContain('UFC 308')

        console.log('UFC page excerpt:', pageText?.slice(0, 500))
    })

    test('speed test API returns adequate payload size', async ({ request }) => {
        const res = await request.get(`${BASE}/api/speed-test?t=${Date.now()}`)
        expect(res.status()).toBe(200)

        const body = await res.text()
        const sizeKB = Buffer.byteLength(body, 'utf8') / 1024

        // Must be at least 50KB for meaningful measurement
        expect(
            sizeKB,
            `Speed test payload too small: ${sizeKB.toFixed(1)}KB (need 50KB+)`
        ).toBeGreaterThan(50)

        // Must have no-cache headers
        const cacheControl = res.headers()['cache-control']
        expect(
            cacheControl,
            'Speed test not setting no-cache headers'
        ).toContain('no-store')

        console.log(`Speed test payload: ${sizeKB.toFixed(1)}KB`)
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 5 — MOBILE CRITICAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Mobile — iOS Safari Critical Issues', () => {

    test.use({
        viewport: { width: 390, height: 844 }, // iPhone 14 Pro
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    test('homepage scrolls — touch-action not blocked', async ({ page }) => {
        await page.goto(BASE)

        // Check globals.css did not re-add the scroll-killing rule
        const bodyStyle = await page.evaluate(() => {
            const body = document.body
            const overflowHiddenEls = document.querySelectorAll('.overflow-hidden')
            let touchActionKilled = false
            overflowHiddenEls.forEach((el) => {
                const style = window.getComputedStyle(el)
                if (style.touchAction === 'none') touchActionKilled = true
            })
            return touchActionKilled
        })

        expect(
            bodyStyle,
            'touch-action: none is blocking iOS scroll (globals.css regression)'
        ).toBeFalsy()
    })

    test('mobile menu opens and has solid background', async ({ page }) => {
        await page.goto(BASE)

        // Find and click hamburger
        const hamburger = await page.$('button[aria-label*="menu" i], button[aria-label*="Menu" i]')
        if (!hamburger) {
            console.log('No hamburger button found — may use different selector')
            return
        }

        await hamburger.click()
        await page.waitForTimeout(400)

        // Menu should be visible
        const menu = await page.$('nav, [role="navigation"], .mobile-menu')
        expect(menu).not.toBeNull()

        // Background color must be solid — not transparent
        const menuBg = await page.evaluate(() => {
            const menus = document.querySelectorAll('[class*="mobile"], [class*="menu"], nav')
            for (const menu of menus) {
                const style = window.getComputedStyle(menu)
                if (style.position === 'fixed' && parseInt(style.zIndex) > 10) {
                    return style.backgroundColor
                }
            }
            return null
        })

        console.log('Mobile menu background:', menuBg)
        // Background should not be transparent
        if (menuBg) {
            expect(
                menuBg,
                'Mobile menu background is transparent — iOS bug not fixed'
            ).not.toBe('rgba(0, 0, 0, 0)')
            expect(menuBg).not.toBe('transparent')
        }
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('mobile sticky CTA bar is present on pricing page', async ({ page }) => {
        await page.goto(`${BASE}/pricing`)
        await page.waitForTimeout(1000)

        // Scroll down to trigger sticky bar
        await page.evaluate(() => window.scrollBy(0, 400))
        await page.waitForTimeout(500)

        const stickyCTA = await page.$('.fixed.bottom-0, [class*="sticky"][class*="bottom"]')
        expect(stickyCTA, 'No mobile sticky CTA bar on pricing page').not.toBeNull()
    })

    test('text is readable without zooming on mobile', async ({ page }) => {
        await page.goto(BASE)

        // viewport meta must not disable zoom
        const viewportContent = await page.$eval(
            'meta[name="viewport"]',
            (el) => el.getAttribute('content')
        ).catch(() => '')

        expect(
            viewportContent,
            'Viewport blocks user zoom'
        ).not.toContain('user-scalable=no')

        expect(
            viewportContent,
            'Viewport has maximum-scale=1'
        ).not.toContain('maximum-scale=1')
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 6 — CONTENT QUALITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Content — No Outdated or Wrong Data', () => {

    test('no "James Harper" author anywhere on site', async ({ request }) => {
        // Check blog posts
        const slugs = [
            'is-iptv-legal-uk',
            'sky-sports-vs-iptv-honest-comparison',
            'how-to-install-iptv-firestick',
            'watch-champions-league-without-bt-sport',
        ]

        for (const slug of slugs) {
            const res = await request.get(`${BASE}/blog/${slug}`)
            if (res.status() !== 200) continue

            const body = await res.text()
            expect(
                body,
                `"James Harper" still appears on /blog/${slug}`
            ).not.toContain('James Harper')
        }
    })

    // SKIPPED 2026-07-31: targets a route removed from the main domain in the
    // domain-separation cleanup. Belongs with the store site, not smartlivetv.co.uk.
    // See reports/audit-2026-07-31.md and memory-bank/AUDIT-PROGRESS.md.
    test.skip('no "2025" year in setup page titles', async ({ request }) => {
        const devices = ['firestick', 'smart-tv', 'android', 'iphone']

        for (const device of devices) {
            const res = await request.get(`${BASE}/setup/${device}`)
            if (res.status() !== 200) continue

            const body = await res.text()
            const titleMatch = body.match(/<title>(.*?)<\/title>/)
            const title = titleMatch?.[1] || ''

            expect(
                title,
                `Setup page /setup/${device} still has 2025 in title: "${title}"`
            ).not.toContain('2025')

            console.log(`/setup/${device} title: "${title}"`)
        }
    })

    test('homepage does not show Morocco in commercial sections', async ({ page }) => {
        await page.goto(BASE)

        const commercialSections = await page.$$eval(
            'section, [class*="hero"], [class*="pricing"], [class*="why"]',
            (sections) => sections.map((s) => s.textContent?.toLowerCase() || '')
        )

        for (const sectionText of commercialSections) {
            // Blog section may reference Morocco (that is acceptable)
            // Commercial sections should not
            if (sectionText.includes('blog') || sectionText.includes('article')) continue

            // Check the hero, pricing preview, why-iptv sections
            if (
                sectionText.includes('replace sky') ||
                sectionText.includes('netflix') ||
                sectionText.includes('sky sports')
            ) {
                // This is a commercial section — should not have Morocco
                expect(
                    sectionText,
                    'Morocco referenced in commercial section'
                ).not.toContain('morocco')
            }
        }
    })

    test('homepage carries no subscription or channel-count claims', async ({ page }) => {
        await page.goto(BASE)

        const pageText = (await page.textContent('body')) || ''

        // The main domain is a sports-data site. Any of these strings appearing here
        // means commercial copy has leaked back in — see reports/audit-2026-07-31.md.
        expect(pageText).not.toMatch(/230,000/)
        expect(pageText).not.toMatch(/15,000\+/)
        expect(pageText).not.toMatch(/\bIPTV\b/i)
        expect(pageText).not.toMatch(/£\s?(12|29|54)\b/)
        expect(pageText).not.toMatch(/free\s+24-?hour\s+trial/i)
    })

    test('blog posts render with BlogPostLayout not raw text', async ({ page }) => {
        await page.goto(`${BASE}/blog/is-iptv-legal-uk`)

        // Must have breadcrumb
        const breadcrumb = await page.$('nav[aria-label="Breadcrumb"], [class*="breadcrumb"]')
        expect(breadcrumb, 'No breadcrumb on blog post').not.toBeNull()

        // Must have author section
        const author = await page.$('text=Smart Live TV')
        expect(author, 'No author on blog post').not.toBeNull()

        // Must NOT show "James Harper"
        const wrongAuthor = await page.$('text=James Harper')
        expect(wrongAuthor, 'James Harper still showing on blog').toBeNull()

        // Must have reading time
        const readingTime = await page.$('text=min read, [class*="reading"]')
        // This is a nice-to-have, log but don't fail
        console.log('Reading time visible:', readingTime !== null)
    })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 7 — PERFORMANCE SIGNALS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test.describe('Performance — Core Web Vitals Protection', () => {

    test('all league badge images have width and height attributes', async ({ page }) => {
        await page.goto(BASE)
        await page.waitForTimeout(2000)

        const imagesWithoutDimensions = await page.$$eval(
            'img[src*="thesportsdb"], img[src*="/leagues/"]',
            (imgs: any[]) => imgs
                .filter((img: any) => !img.width || !img.height ||
                    (!img.getAttribute('width') && !img.getAttribute('height')))
                .map((img: any) => ({
                    src: img.src,
                    hasWidth: !!img.getAttribute('width'),
                    hasHeight: !!img.getAttribute('height'),
                    alt: img.alt,
                }))
        )

        if (imagesWithoutDimensions.length > 0) {
            console.warn('Images missing dimensions (causes CLS):', imagesWithoutDimensions)
        }

        expect(
            imagesWithoutDimensions.length,
            `${imagesWithoutDimensions.length} images missing width/height (causes LCP/CLS)`
        ).toBe(0)
    })

    test('no images loading from wrong domains unexpectedly', async ({ page }) => {
        const loadedImages: string[] = []

        page.on('response', (response) => {
            const url = response.url()
            if (url.match(/\.(png|jpg|jpeg|webp|avif|gif|svg)$/i)) {
                loadedImages.push(url)
            }
        })

        await page.goto(BASE)
        await page.waitForTimeout(3000)

        const allowedDomains = [
            'smartlivetv.co.uk',
            'r2.thesportsdb.com',
            'www.thesportsdb.com',
            'newsdata.io',
            'vercel.app', // CDN delivery
        ]

        const unexpectedImages = loadedImages.filter((url) =>
            !allowedDomains.some((domain) => url.includes(domain))
        )

        if (unexpectedImages.length > 0) {
            console.log('Images from unexpected domains:', unexpectedImages)
        }
        // Log only — don't fail (news images come from external sources)
    })

    test('page loads within acceptable time', async ({ page }) => {
        const start = Date.now()
        await page.goto(BASE, { waitUntil: 'domcontentloaded' })
        const domLoad = Date.now() - start

        console.log(`DOM content loaded in ${domLoad}ms`)

        // Should load DOM in under 3 seconds
        expect(domLoad, `Page too slow: ${domLoad}ms`).toBeLessThan(3000)

        // Full page load
        const fullStart = Date.now()
        await page.goto(BASE, { waitUntil: 'load' })
        const fullLoad = Date.now() - fullStart

        console.log(`Full page loaded in ${fullLoad}ms`)
        // Log but don't fail — network speed varies in CI
    })

    test('no console errors on homepage', async ({ page }) => {
        const errors: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'error') errors.push(msg.text())
        })
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto(BASE)
        await page.waitForTimeout(2000)

        // Filter known acceptable errors
        const realErrors = errors.filter((e) =>
            !e.includes('favicon') &&
            !e.includes('net::ERR_ABORTED') &&
            !e.includes('404') // Missing images are caught elsewhere
        )

        if (realErrors.length > 0) {
            console.error('Console errors on homepage:', realErrors)
        }

        expect(
            realErrors.length,
            `Console errors detected: ${realErrors.join(', ')}`
        ).toBe(0)
    })
})