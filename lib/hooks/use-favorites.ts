"use client"

import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "smart-live-tv-favorites"

export interface FavoriteItem {
  id: string
  type: "team" | "league" | "event" | "channel"
  name: string
  image?: string
}

function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveFavorites(favorites: FavoriteItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavorites(loadFavorites())
  }, [])

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id && f.type === item.type)) return prev
      const next = [...prev, item]
      saveFavorites(next)
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string, type: FavoriteItem["type"]) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => !(f.id === id && f.type === type))
      saveFavorites(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id && f.type === item.type)
      const next = exists
        ? prev.filter((f) => !(f.id === item.id && f.type === item.type))
        : [...prev, item]
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: string, type: FavoriteItem["type"]) => {
      return favorites.some((f) => f.id === id && f.type === type)
    },
    [favorites]
  )

  const getFavoritesByType = useCallback(
    (type: FavoriteItem["type"]) => {
      return favorites.filter((f) => f.type === type)
    },
    [favorites]
  )

  return {
    favorites,
    mounted,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
  }
}
