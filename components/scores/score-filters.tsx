"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, Clock, Trophy } from "lucide-react"

const leagues = [
  { id: "all", name: "All Leagues", count: 156 },
  { id: "premier-league", name: "Premier League", count: 20 },
  { id: "la-liga", name: "La Liga", count: 18 },
  { id: "bundesliga", name: "Bundesliga", count: 16 },
  { id: "serie-a", name: "Serie A", count: 22 },
  { id: "nba", name: "NBA", count: 12 },
  { id: "nfl", name: "NFL", count: 8 },
]

const timeFilters = [
  { id: "live", name: "Live Now", icon: Clock, color: "bg-red-500" },
  { id: "today", name: "Today", icon: Calendar, color: "bg-blue-500" },
  { id: "yesterday", name: "Yesterday", icon: Calendar, color: "bg-gray-500" },
  { id: "this-week", name: "This Week", icon: Calendar, color: "bg-green-500" },
]

const statusFilters = [
  { id: "all", name: "All Matches", count: 156 },
  { id: "live", name: "Live", count: 8 },
  { id: "finished", name: "Finished", count: 124 },
  { id: "scheduled", name: "Scheduled", count: 24 },
]

interface ScoreFiltersProps {
  onFiltersChange?: (filters: {
    league: string
    timeFilter: string
    status: string
  }) => void
}

export function ScoreFilters({ onFiltersChange }: ScoreFiltersProps) {
  const [activeLeague, setActiveLeague] = useState("all")
  const [activeTimeFilter, setActiveTimeFilter] = useState("today")
  const [activeStatus, setActiveStatus] = useState("all")

  const handleFilterChange = (type: "league" | "timeFilter" | "status", value: string) => {
    const newFilters = {
      league: activeLeague,
      timeFilter: activeTimeFilter,
      status: activeStatus,
    }

    switch (type) {
      case "league":
        setActiveLeague(value)
        newFilters.league = value
        break
      case "timeFilter":
        setActiveTimeFilter(value)
        newFilters.timeFilter = value
        break
      case "status":
        setActiveStatus(value)
        newFilters.status = value
        break
    }

    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setActiveLeague("all")
    setActiveTimeFilter("today")
    setActiveStatus("all")
    onFiltersChange?.({
      league: "all",
      timeFilter: "today",
      status: "all",
    })
  }

  return (
    <div className="space-y-6">
      {/* Time Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timeFilters.map((filter) => {
            const Icon = filter.icon
            const isActive = activeTimeFilter === filter.id
            return (
              <Button
                key={filter.id}
                variant="ghost"
                onClick={() => handleFilterChange("timeFilter", filter.id)}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "text-white bg-gray-800 border border-blue-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                <Icon className="w-4 h-4" />
                {filter.name}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* League Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leagues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leagues.map((league) => {
            const isActive = activeLeague === league.id
            return (
              <Button
                key={league.id}
                variant="ghost"
                onClick={() => handleFilterChange("league", league.id)}
                className={`w-full justify-between ${
                  isActive
                    ? "text-white bg-gray-800 border border-blue-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{league.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {league.count}
                </Badge>
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* Status Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Match Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusFilters.map((status) => {
            const isActive = activeStatus === status.id
            return (
              <Button
                key={status.id}
                variant="ghost"
                onClick={() => handleFilterChange("status", status.id)}
                className={`w-full justify-between ${
                  isActive
                    ? "text-white bg-gray-800 border border-blue-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{status.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {status.count}
                </Badge>
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full bg-transparent border-gray-700" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent border-gray-700"
            onClick={() => {
              // TODO: Implement save preferences functionality
              console.log("Save preferences clicked")
            }}
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
