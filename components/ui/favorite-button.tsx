"use client"

import { Heart } from "lucide-react"
import { useFavorites, type FavoriteItem } from "@/lib/hooks/use-favorites"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FavoriteButtonProps {
  item: FavoriteItem
  className?: string
  size?: "sm" | "default" | "icon"
  showLabel?: boolean
}

export function FavoriteButton({ item, className, size = "icon", showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites()

  const active = mounted && isFavorite(item.id, item.type)

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(item)
      }}
      className={cn(
        "transition-all duration-200",
        active
          ? "text-red-500 hover:text-red-400"
          : "text-text-muted hover:text-red-400",
        className
      )}
      aria-label={active ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
    >
      <Heart
        className={cn("w-4 h-4", active && "fill-current")}
      />
      {showLabel && (
        <span className="ml-1.5 text-sm">{active ? "Saved" : "Save"}</span>
      )}
    </Button>
  )
}
