"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

type MetricName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'

function sendToAnalytics(metric: { name: MetricName; value: number; rating: string }) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  
  ;(window as any).gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.rating,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
    transport_type: 'beacon',
  })
}

export function WebVitals() {
  const pathname = usePathname()

  useEffect(() => {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onFCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    })
  }, [pathname])

  return null
}
