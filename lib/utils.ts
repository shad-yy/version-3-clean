import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSocialMediaUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null

  // Remove any whitespace
  const cleanUrl = url.trim()
  if (!cleanUrl) return null

  // If it already starts with http/https, return as is
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl
  }

  // If it starts with www., add https://
  if (cleanUrl.startsWith("www.")) {
    return `https://${cleanUrl}`
  }

  // For social media handles or usernames, construct proper URLs
  if (
    cleanUrl.includes("facebook.com") ||
    cleanUrl.includes("twitter.com") ||
    cleanUrl.includes("instagram.com") ||
    cleanUrl.includes("youtube.com")
  ) {
    return cleanUrl.startsWith("//") ? `https:${cleanUrl}` : `https://${cleanUrl}`
  }

  // Default: assume it needs https://
  return `https://${cleanUrl}`
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
