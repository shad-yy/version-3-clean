# API budget and caching policy

Every external provider this site depends on, what it costs us, and what protects the
budget. **Adding an external fetch without reading this is how a free tier gets
exhausted.**

Two protections, not interchangeable:

- **Caching** reduces how often we ask at all. This is the one that lowers volume.
- **Throttling** paces the asks we still make, so a burst cannot trip a per-second cap
  even on a cold cache.

A path with neither is an unbounded pipe to a third party's API on our key.

---

## Providers

| Provider | Limit | Protection | Notes |
|---|---|---|---|
| **TheSportsDB** | 30 req/min on the free tier | TTL cache + `RATE_LIMIT_MS = 2400` self-throttle to ~25/min | The tightest budget we have. Key not set, so we run on the shared public key `123`. |
| **TMDB** | ~50 req/sec, 20 connections per IP | TTL cache (6h availability, 7d reference), negative caching, in-flight dedupe | Answers **429** rather than banning. Verified against their docs. |
| **NewsData.io** | Plan-dependent | Module-level cache, 6h TTL | |
| **ESPN** | Undocumented public endpoints | TTL cache + throttle | No published limit; treat as fragile rather than free. |
| **RapidAPI (MMA)** | Plan-dependent | TTL cache + throttle | |
| **football-data.org** | 10 req/min free tier | TTL cache | Client exists but the key is unset, so it is inert. |

---

## What was wrong, and what it cost

`/api/fixtures/today` and `/api/spotlight` both declared `revalidate = 0` and fetched
with `cache: 'no-store'` — **three upstream calls each**. Both are requested by every
homepage visitor.

That is **six uncached TheSportsDB requests per homepage view**. Against a 30/min free
tier with a self-imposed 25/min ceiling, roughly four concurrent readers exhausted the
minute's budget, and every one after that got degraded or empty data.

Both now run through `swrGet`, which additionally **serves stale data while rate-limited**
— so a burst degrades to slightly old fixtures rather than to an empty page.

Measured after the change, five sequential requests each:

```
/api/fixtures/today   0.205s → 0.092 0.094 0.091 0.088   (first call warms, rest cached)
/api/spotlight        0.453s → 0.087 0.090 0.088 0.087
```

Upstream cost went from 6 calls per view to **6 calls per 90–120 second window,
regardless of traffic**.

---

## Rules for new code

1. **Every external fetch goes through the cache.** `swrGet` for anything a page renders;
   `cacheGet`/`cacheSet` where you need direct control.
2. **Pick a TTL from how fast the data actually changes**, not from how fresh you would
   like it to feel. Live scores are not the same as a rights listing that moves once a
   season.
3. **Cache negatives too.** A route that renders on demand for arbitrary input is an open
   relay without it — see `lib/api/tmdb.ts`, where the cache envelope `{ v: T | null }`
   exists because `cacheGet` cannot otherwise distinguish "not cached" from "cached null".
4. **Never cache a 429 or a network fault.** Both are transient; caching one freezes a
   blip into a TTL of wrong answers. A 404 *is* cacheable, because it is a fact.
5. **Set `Cache-Control` on the response as well.** The server cache protects the
   provider; the CDN header protects the server.
6. **No credentials in source.** Read them from the environment, always.

---

## Key rotation

**`RAPIDAPI_MMA_KEY` must be rotated.** A now-deleted debug route,
`app/api/test-mma/route.ts`, carried a live RapidAPI key **hardcoded in tracked source**.
The route was:

- publicly reachable with no authentication,
- uncached (`force-dynamic` plus `cache: 'no-store'`), so every request hit RapidAPI,
- referenced by nothing in the codebase.

The file is deleted, but **it remains in git history**, so the key must be treated as
disclosed. Rotating it in the RapidAPI dashboard and updating `RAPIDAPI_MMA_KEY` is the
fix; deleting the file is not.

No other hardcoded credential remains — a scan of `app`, `lib` and `scripts` for
key-shaped literals returns zero.

Nothing else needs rotation on current evidence. `TMDB_API_KEY`, `NEWS_API_KEY`,
`UPSTASH_REDIS_REST_TOKEN` and `JWT_SECRET` are all read from the environment and have
never appeared in tracked source.
