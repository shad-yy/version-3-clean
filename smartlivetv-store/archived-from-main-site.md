# Archived Content from smartlivetv.co.uk (Main Site)
# Date: 2026-07-23
# Purpose: Content removed during sports-first pivot. Reuse for smartlivetv-store.com.

---

## 1. Hero Section — Platform Highlights Card (hero-section.tsx)
```
{ value: '£109', label: 'Monthly Saving vs Sky + Netflix' },
{ value: '4K', label: 'Ultra HD Quality' },
{ value: '∞', label: 'Netflix, Disney+, Shahid & more' },
{ value: '24H', label: 'Free Trial — No Card' },
```

### Hero — Trial Badge
```
Free 24H Trial · No Card · Works Worldwide
```

### Hero — Pricing CTA
```tsx
<ShimmerButton href="/pricing" variant="ghost">Premium TV Access Guide →</ShimmerButton>
```

---

## 2. LiveStats Ticker (LiveStats.tsx)
```typescript
const STATS = [
  "230,000+ channels streaming right now",
  "300+ live matches covered this week",
  "Netflix · Disney+ · Amazon Prime all included",
  "Works on Firestick · Smart TV · iPhone · Android",
  "4K Ultra HD streaming · No buffering",
  "£109 monthly saving vs Sky Sports + Netflix",
]
```

---

## 3. Header Store CTAs (header.tsx)

### Desktop ShimmerButton
```tsx
<ShimmerButton href={`${STORE_URL}/buy`} className="text-sm px-6 py-2.5">
  Official Store →
</ShimmerButton>
```

### Watch Dropdown Footer
```tsx
<a href={`${STORE_URL}/buy`} target="_blank" rel="noopener noreferrer">
  Official Access Store — smartlivetv-store.com
</a>
```

### Mobile Menu CTA
```tsx
<a href={`${STORE_URL}/buy`}>
  Official Access Store →
</a>
```

---

## 4. Footer — Official Store Column (footer.tsx)
```typescript
{
  title: "Official Store",
  links: [
    { name: "24H Trial Pass", href: `${STORE_URL}/free-trial` },
    { name: "Get Store Pass", href: `${STORE_URL}/buy` },
    { name: "Store Portal", href: STORE_URL },
  ],
}
```

### Footer — Payment Methods Section
```
Payment logos: Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, Crypto
```

---

## 5. LiveEventFloat — Free Trial CTAs (LiveEventFloat.tsx)
```tsx
href="/free-trial"
{isLive ? "Watch Now — Free Trial" : "Get Ready — Free 24h Trial"}
```

---

## 6. Command Palette Store Items (command-palette.tsx)
```typescript
{ type: 'page', title: 'Free Trial', subtitle: 'Start watching in 5 minutes', href: '/free-trial', icon: Gift, badge: 'No Card' },
{ type: 'page', title: 'Pricing', subtitle: 'Plans from £12/month', href: '/pricing', icon: CreditCard },
{ type: 'page', title: 'Channel List', subtitle: '230,000+ channels', href: '/channels', icon: Tv },
{ type: 'page', title: 'Setup Guides', subtitle: 'Firestick, Smart TV, Android, iPhone', href: '/setup/firestick', icon: Settings },
```

---

## 7. Page Schema — VideoObject (page.tsx)
```json
{
  "@type": "VideoObject",
  "name": "Smart Live TV — Replace Sky Sports, Netflix & Disney+ for £12/mo",
  "description": "230,000+ channels, 4K quality, free 24-hour trial. Watch Premier League, Champions League, UFC, F1 and more.",
  "thumbnailUrl": "https://smartlivetv.co.uk/og-default.png",
  "uploadDate": "2025-01-01",
  "contentUrl": "https://smartlivetv.co.uk/free-trial"
}
```

### Speakable Schema
```json
{
  "@type": "SpeakableSpecification",
  "cssSelector": ["#main-content h1", "#main-content p"],
  "name": "Smart Live TV — Sky Sports & Netflix for £12/mo | Free Trial"
}
```

---

## 8. Layout — BroadcastService Schema (layout.tsx)
```json
{
  "@context": "https://schema.org",
  "@type": "BroadcastService",
  "broadcastDisplayName": "Smart Live TV",
  "broadcastTimezone": "Europe/London",
  "broadcaster": { "@id": "https://smartlivetv.co.uk/#organization" },
  "area": { "@type": "Country", "name": "United Kingdom" },
  "broadcastFrequency": "Internet streaming"
}
```

---

## 9. All Blog Posts (lib/blog/posts.ts)

**ALL blog posts are IPTV-focused and should be migrated to the store site.**

Posts archived (by slug):
1. watch-ufc-fight-night-ankalaev-guskov-uk-guide
2. best-iptv-premier-league-2026-27-4k
3. is-iptv-legal-uk
4. sky-sports-tnt-prime-cost-premier-league-2026-27
5. tnt-sports-sd-discontinued-sky-alternatives
6. watch-premier-league-2026-27-live-channels-streaming
7. watch-world-cup-2026-final
8. watch-portugal-spain-world-cup-2026-uk
9. watch-brazil-norway-world-cup-2026-uk
10. watch-england-mexico-world-cup-2026-uk
11. watch-france-paraguay-world-cup-2026-uk
12. watch-morocco-canada-world-cup-2026-uk
13. watch-world-cup-2026-quarter-finals
14. watch-world-cup-2026-semi-finals
15. harry-kane-world-cup-goals-record-2026
16. watch-brazil-japan-world-cup-2026
17. watch-england-dr-congo-world-cup-2026
18. watch-netherlands-morocco-world-cup-2026
19. watch-england-panama-world-cup-2026
20. world-cup-2026-round-of-32-guide
21. watch-argentina-austria-world-cup-2026
22. watch-england-ghana-world-cup-2026
23. sky-sports-price-increase-2026-alternatives
24. world-cup-2026-firestick-complete-guide
25. watch-argentina-world-cup-2026-live-uk
26. cancel-sky-sports-save-money-2026

**Full blog post content is in `lib/blog/posts.ts` — copy that file directly to the store.**

---

## 10. Spotlight Events — /pricing Links (spotlight-events.tsx)
```tsx
<Link href="/pricing" className="absolute inset-0 z-20" aria-label={`Watch ${event.strEvent}`} />
```

## 11. Match Popup — /buy Link (match-popup.tsx)
```tsx
href="/buy"
```

## 12. Match Card — /pricing Link (match-card.tsx)
```tsx
href="/pricing"
```

## 13. LiveNowBanner — /buy Link (LiveNowBanner.tsx)
```tsx
href="/buy"
```

## 14. DynamicSEOContent IPTV References (DynamicSEOContent.tsx)
```
"Watch every ${leagueName} match live in HD and 4K on Smart Live TV. All UK broadcast channels showing ${leagueName} are included — Sky Sports, TNT Sports, and beIN Sports — from £12/month with no contract. Start a free 24-hour trial at smartlivetv.co.uk/free-trial."
```

## 15. Match Tabs — Store CTA (match-tabs.tsx)
```tsx
Stream in ultra HD 4K without blackouts or satellite delays. Sky Sports, TNT Sports, and...
href="/buy"
```

---

## Notes for Store Reuse
- All pricing (£12/mo, £54/yr, £4.50/mo annual) is consistent across content
- Free trial flow: /free-trial → WhatsApp contact → 24h credentials
- Key selling points: 230,000+ channels, 4K UHD, Firestick support, no contract
- Comparison tables (Sky vs TNT vs SmartLiveTV) are highly effective CTAs
- Blog posts serve as SEO funnels — repurpose on store domain with canonical URLs
