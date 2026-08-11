// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure API response times
  measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now()

    return apiCall().finally(() => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    })
  }

  // Record custom metrics
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  // Get performance statistics
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  }

  // Get all metrics
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}

    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name)
    }

    return stats
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear()
  }
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === "undefined") return

  // Track Core Web Vitals (API may vary by version)
  import("web-vitals").then((mod: unknown) => {
    const m = mod as Record<string, (fn: (metric: unknown) => void) => void>
    const report = (metric: unknown) => console.log(metric)
    if (typeof m.getCLS === "function") m.getCLS(report)
    if (typeof m.getFID === "function") m.getFID(report)
    if (typeof m.getFCP === "function") m.getFCP(report)
    if (typeof m.getLCP === "function") m.getLCP(report)
    if (typeof m.getTTFB === "function") m.getTTFB(report)
  })
    .catch(() => {
      // Silently fail if web-vitals is not available
    })
}

// Image loading optimization
export function preloadCriticalImages(urls: string[]): void {
  if (typeof window === "undefined") return

  urls.forEach((url) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = url
    document.head.appendChild(link)
  })
}

// Resource hints
export function addResourceHints(domains: string[]): void {
  if (typeof window === "undefined") return

  domains.forEach((domain) => {
    // DNS prefetch
    const dnsLink = document.createElement("link")
    dnsLink.rel = "dns-prefetch"
    dnsLink.href = `//${domain}`
    document.head.appendChild(dnsLink)

    // Preconnect for critical domains
    const preconnectLink = document.createElement("link")
    preconnectLink.rel = "preconnect"
    preconnectLink.href = `https://${domain}`
    document.head.appendChild(preconnectLink)
  })
}
