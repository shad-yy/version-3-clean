import { resolveSiteUrl } from '@/lib/config/site-url'

export const ENV = {
  get GA_MEASUREMENT_ID() {
    return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
  },
  get THESPORTSDB_KEY() {
    if (!process.env.THESPORTSDB_API_KEY) {
      console.warn('[ENV] THESPORTSDB_API_KEY not set')
      return "123"
    }
    return process.env.THESPORTSDB_API_KEY
  },
  get NEWS_API_KEY() {
    if (!process.env.NEWS_API_KEY) {
      console.warn('[ENV] NEWS_API_KEY not set')
      return ""
    }
    return process.env.NEWS_API_KEY
  },
  get NEXT_PUBLIC_APP_URL() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
    }
    return process.env.VERCEL_ENV === 'production'
      ? resolveSiteUrl()
      : 'http://localhost:3000'
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || ""
  },
  get BASE_URL() {
    return resolveSiteUrl()
  },
  get FOOTBALL_DATA_KEY() {
    return process.env.FOOTBALL_DATA_API_KEY || ''
  },
} as const
