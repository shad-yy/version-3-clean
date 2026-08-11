"use client"

import * as React from "react"

export type Sport = "default" | "football" | "ufc" | "basketball" | "tennis" | "boxing"

interface SportThemeContextType {
  sport: Sport
  setSport: (sport: Sport) => void
}

const SportThemeContext = React.createContext<SportThemeContextType | undefined>(undefined)

export function SportThemeProvider({ children }: { children: React.ReactNode }) {
  const [sport, setSport] = React.useState<Sport>("default")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedSport = localStorage.getItem("sport-theme") as Sport
    if (savedSport) {
      setSport(savedSport)
    }
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    // Remove old themes
    root.classList.remove("theme-football", "theme-ufc", "theme-basketball", "theme-tennis", "theme-boxing")
    
    if (sport !== "default") {
      root.classList.add(`theme-${sport}`)
    }
    
    localStorage.setItem("sport-theme", sport)
  }, [sport, mounted])

  // Prevent hydration mismatch by not rendering theme-dependent UI until mounted
  // But for the provider itself, we just pass children. The effect handles the class.
  
  return (
    <SportThemeContext.Provider value={{ sport, setSport }}>
      {children}
    </SportThemeContext.Provider>
  )
}

export const useSportTheme = () => {
  const context = React.useContext(SportThemeContext)
  if (context === undefined) {
    throw new Error("useSportTheme must be used within a SportThemeProvider")
  }
  return context
}
