import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"

// ---------------------------------------------------------------------------
// Rate limiting — uses @upstash/ratelimit when Redis is configured,
// falls back to in-memory Map for local development without Upstash.
// ---------------------------------------------------------------------------

let ratelimit: { limit: (id: string) => Promise<{ success: boolean }> } | null = null

// Lazy-initialise Upstash ratelimit only when env vars are present.
// This prevents import errors in environments without Redis credentials.
async function getRatelimit() {
  if (ratelimit) return ratelimit

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken && !redisUrl.includes('placeholder')) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit')
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({ url: redisUrl, token: redisToken })
      ratelimit = new Ratelimit({
        redis,
        // 5 admin login attempts per 15-minute sliding window per IP
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        prefix: 'rl:admin',
      })
    } catch {
      // Upstash package not yet installed or import failed — use fallback
      ratelimit = createInMemoryFallback()
    }
  } else {
    ratelimit = createInMemoryFallback()
  }

  return ratelimit
}

// In-memory fallback for local dev (not suitable for production multi-instance)
const adminAttempts = new Map<string, { count: number; resetAt: number }>()

function createInMemoryFallback() {
  return {
    limit: async (ip: string) => {
      const now = Date.now()
      const record = adminAttempts.get(ip)
      if (!record || now > record.resetAt) {
        adminAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
        return { success: true }
      }
      if (record.count >= 5) return { success: false }
      record.count++
      return { success: true }
    },
  }
}

// ---------------------------------------------------------------------------
// Content Security Policy — nonce-based.
//
// A CSP whose script-src contains 'unsafe-inline' provides essentially no XSS
// mitigation, because an injected inline <script> satisfies the policy. The
// documented remedy is a per-response nonce, which is what this builds.
//
//   https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
//   https://nextjs.org/docs/app/guides/content-security-policy
//
// Notes on the specific choices below:
//
//  - 'strict-dynamic' lets a nonced script load its own dependencies (this is
//    how the GA tag loads gtag.js). CSP3 browsers ignore the host allowlist
//    when it is present; the hosts are kept for older browsers that don't.
//  - style-src keeps 'unsafe-inline' deliberately. Next.js and Tailwind inject
//    inline styles, and removing it breaks rendering. script-src is where the
//    security value is.
//  - 'unsafe-eval' is dev-only — the Next.js dev server needs it for HMR.
//  - Set CSP_REPORT_ONLY=true to emit Content-Security-Policy-Report-Only
//    instead, so violations are logged without breaking the page. Use this for
//    the first production rollout, then remove it.
// ---------------------------------------------------------------------------

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.thesportsdb.com https://*.upstash.io https://www.google-analytics.com https://www.googletagmanager.com https://newsdata.io",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }

  // Protect /admin routes (legacy admin - can be removed later)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-session")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      if (!ENV.JWT_SECRET) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      await jwtVerify(adminToken, new TextEncoder().encode(ENV.JWT_SECRET))
    } catch {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    // CORS headers for public API endpoints
    const origin = request.headers.get('origin') || '*'
    const isAllowedOrigin = origin === 'https://smartlivetv.co.uk' || origin === 'https://smartlivetv-store.com' || process.env.NODE_ENV !== 'production'
    const allowOrigin = isAllowedOrigin ? origin : 'https://smartlivetv.co.uk'

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // The admin *login* route is /api/auth/admin — it does NOT live under /api/admin/,
    // which holds only health and metrics. Both surfaces must be rate limited.
    const isAdminSurface =
      request.nextUrl.pathname.startsWith('/api/admin/') ||
      request.nextUrl.pathname.startsWith('/api/auth/admin')

    if (isAdminSurface) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
        || request.headers.get('x-real-ip')
        || '0.0.0.0'

      const limiter = await getRatelimit()
      const { success } = await limiter.limit(ip)

      if (!success) {
        return NextResponse.json(
          { error: 'Too many attempts. Please wait 15 minutes before trying again.' },
          { status: 429 }
        )
      }
    }

    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', allowOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  // ---- Document responses: attach a fresh CSP nonce -------------------------
  // Must be cryptographically random and different on every response, or an
  // attacker can predict it and the policy is worthless.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // Forward the nonce to the render so server components can stamp it onto any
  // inline <script> they emit (see components/SchemaMarkup.tsx).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  const headerName =
    process.env.CSP_REPORT_ONLY === 'true'
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'
  response.headers.set(headerName, csp)

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    /*
     * Every document route, so the CSP nonce is applied to real pages.
     * Excluded: API (handled above), Next.js static output, the image
     * optimiser, and static file extensions — none of which execute scripts,
     * and all of which would waste middleware invocations.
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|json|webmanifest)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
