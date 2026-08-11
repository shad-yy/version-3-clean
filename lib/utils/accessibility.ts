// Accessibility utilities
export class AccessibilityManager {
  private static instance: AccessibilityManager

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager()
    }
    return AccessibilityManager.instance
  }

  // Announce content changes to screen readers
  announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
    if (typeof window === "undefined") return

    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", priority)
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management
  trapFocus(element: HTMLElement): () => void {
    if (!element) return () => {}

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    element.addEventListener("keydown", handleTabKey)

    // Return cleanup function
    return () => {
      element.removeEventListener("keydown", handleTabKey)
    }
  }

  // Skip link functionality
  addSkipLinks(): void {
    if (typeof window === "undefined") return

    const skipLink = document.createElement("a")
    skipLink.href = "#main-content"
    skipLink.textContent = "Skip to main content"
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"

    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  // Color contrast checking (development helper)
  checkColorContrast(foreground: string, background: string): { ratio: number; wcagAA: boolean; wcagAAA: boolean } {
    // Simplified contrast ratio calculation
    const getLuminance = (color: string): number => {
      // This is a simplified version - in production, use a proper color library
      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
      const [r, g, b] = rgb.map((c) => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
    }
  }
}

// Keyboard navigation helpers
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void,
): void {
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      event.preventDefault()
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      onIndexChange(nextIndex)
      items[nextIndex]?.focus()
      break

    case "ArrowUp":
    case "ArrowLeft":
      event.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      onIndexChange(prevIndex)
      items[prevIndex]?.focus()
      break

    case "Home":
      event.preventDefault()
      onIndexChange(0)
      items[0]?.focus()
      break

    case "End":
      event.preventDefault()
      const lastIndex = items.length - 1
      onIndexChange(lastIndex)
      items[lastIndex]?.focus()
      break
  }
}
