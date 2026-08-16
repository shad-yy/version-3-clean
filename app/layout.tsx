import type React from "react"
import { headers } from "next/headers"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"
import { ENV } from "@/lib/config/env"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { WebVitals } from "@/components/analytics/WebVitals"
import { CookieBanner } from "@/components/consent/CookieBanner"
import { LiveEventFloat } from "@/components/ui/LiveEventFloat"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_SITE_URL),
  title: {
    default: "Smart Live TV",
    template: "%s",
  },
  description:
    "Real-time live sports scores, match schedules, league standings, team stats, and global TV broadcast guides for all major sporting events.",
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "SmartLiveTV",
    title: "Smart Live TV — Live Sports Scores & Global Broadcast Guide",
    description:
      "Real-time live sports scores, match schedules, league standings, team stats, and official broadcast guides for Premier League, Champions League, UFC, F1, and more.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Smart Live TV",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@smartlivetv',
    title: 'Smart Live TV — Real-Time Sports Scores & Broadcast Guide',
    description: 'Real-time live sports scores, match schedules, league standings, team stats, and official broadcast guides for Premier League, Champions League, UFC, F1, and more.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: ENV.BASE_URL,
    // x-default marks this as the fallback when no locale is a better match, which is
    // correct for a single global site. Add real locale entries here as translations
    // ship — and never use "UK": Google ignores it, the ISO code is "GB".
    languages: {
      "x-default": ENV.BASE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

import { SportThemeProvider } from "@/components/sport-theme-provider"
import { ThemeProvider } from 'next-themes'
import { PRODUCTION_SITE_URL, SITE_NAME } from '@/lib/config/site-url'

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Per-response CSP nonce, forwarded by middleware.ts.
  const nonce = headers().get("x-nonce") ?? undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="alternate" type="text/plain" href={`${PRODUCTION_SITE_URL}/llms.txt`} title="LLM Site Map" />
        <link rel="preconnect" href="https://www.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
        <link rel="preconnect" href="https://r2.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://r2.thesportsdb.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${PRODUCTION_SITE_URL}/#organization`,
              name: SITE_NAME,
              url: PRODUCTION_SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${PRODUCTION_SITE_URL}/og-default.png`,
                width: 1200,
                height: 630,
              },
              description:
                "Real-time live sports scores, match schedules, league standings, team stats, and official broadcast guides for all major sporting events.",
              foundingDate: "2024",
              knowsAbout: [
                "Live Sports Scores",
                "Football Fixtures",
                "League Standings",
                "Premier League",
                "Champions League",
                "UFC",
                "Formula 1",
                "Sports Broadcasting",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                availableLanguage: ["English"],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${PRODUCTION_SITE_URL}/#website`,
              name: SITE_NAME,
              url: PRODUCTION_SITE_URL,
              publisher: { "@id": `${PRODUCTION_SITE_URL}/#organization` },
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    `${PRODUCTION_SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

      </head>
      <body className={cn(inter.className, "antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} nonce={nonce}>
        <SportThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Skip to main content
          </a>

          <div className="flex flex-col min-h-screen transition-colors duration-500">
            <Header />
            <main id="main-content" className="flex-grow" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </SportThemeProvider>
        </ThemeProvider>

        <GoogleAnalytics measurementId={ENV.GA_MEASUREMENT_ID} />
        <WebVitals />
        <CookieBanner />
        <LiveEventFloat />
      </body>
    </html>
  )
}
