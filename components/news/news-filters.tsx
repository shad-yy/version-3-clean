"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewsFiltersProps {
  filters: {
    category: string | null
    source: string | null
    sortBy: string
  }
  onFiltersChange: (filters: Partial<{
    category: string | null
    source: string | null
    sortBy: string
  }>) => void
}

const CATEGORIES = [
  { value: "sports", label: "Sports" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "general", label: "General" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "technology", label: "Technology" }
]

const SOURCES = [
  { value: "espn", label: "ESPN" },
  { value: "bbc-sport", label: "BBC Sport" },
  { value: "fox-sports", label: "Fox Sports" },
  { value: "cnn", label: "CNN" },
  { value: "reuters", label: "Reuters" },
  { value: "associated-press", label: "Associated Press" },
  { value: "the-guardian", label: "The Guardian" },
  { value: "usa-today", label: "USA Today" }
]

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Latest" },
  { value: "relevancy", label: "Most Relevant" },
  { value: "popularity", label: "Most Popular" }
]

export function NewsFilters({ filters, onFiltersChange }: NewsFiltersProps) {
  const updateFilters = (key: string, value: string) => {
    if (value === "all") {
      onFiltersChange({ [key]: null })
    } else {
      onFiltersChange({ [key]: value })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter News</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={filters.category || undefined}
            onValueChange={(value) => updateFilters("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Source</label>
          <Select
            value={filters.source || undefined}
            onValueChange={(value) => updateFilters("source", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
