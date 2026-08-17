if (typeof self === 'undefined') {
  global.self = global;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        // TMDB poster and provider artwork, used by /watch/title/[slug].
        // Without this entry next/image throws at render time and the whole page
        // errors — the route still answers 200, so the failure is easy to miss.
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos.api-sports.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r2.thesportsdb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thesportsdb.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.newsdata.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.newsdata.io',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 30 days. These are team badges and league logos — they change about once a
    // season, so a 60s TTL meant needless re-fetching and re-encoding.
    minimumCacheTTL: 2592000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // unoptimized: false — using Next.js built-in image optimization for LCP
  },
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        // NOTE: X-Robots-Tag is deliberately absent here. Google indexes by default,
        // and a blanket 'index, follow' on /(.*) also covered /api/ and /admin/,
        // which app/robots.ts disallows — a contradictory signal for no benefit.
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // NOTE: Content-Security-Policy is set per-response in middleware.ts so it
          // can carry a fresh nonce. A static CSP here cannot do that, and the
          // previous one allowed 'unsafe-inline' + 'unsafe-eval' on script-src,
          // which per OWASP provides essentially no XSS mitigation.
        ],
      },
      // Authenticated surfaces must never be stored by a shared cache. These rules
      // are listed first because Next.js applies the first matching header rule.
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
        ],
      },
      // NOTE: no blanket Cache-Control for /api/(.*). A catch-all rule here emitted a
      // second, conflicting Cache-Control header on the 24 data routes that already set
      // their own (see PATTERNS.md §2 for the per-route TTL policy), and duplicate
      // Cache-Control headers have undefined precedence.
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/football',
        destination: '/watch/premier-league',
        permanent: true,
      },
      // NOTE: /buy, /pricing and /free-trial previously 301'd to
      // smartlivetv-store.com. That domain is not part of the plan any more —
      // the commercial store lives on smartlivetv.co.uk in a separate repo — and
      // linking there from here would rebuild exactly the association the domain
      // split exists to break. This site sells nothing, so those paths correctly
      // 404. Do not re-add a redirect to a commercial domain.
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const baseExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : []

      config.externals = [...baseExternals, 'cheerio', 'undici']
    }

    // Override hashFunction to prevent WasmHash crash in Node 22
    config.output = config.output || {}
    config.output.hashFunction = 'xxhash64'

    return config
  },
}

export default nextConfig
