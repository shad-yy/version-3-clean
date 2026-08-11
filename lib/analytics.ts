export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('config', 
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, 
    { page_path: url }
  )
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
