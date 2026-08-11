"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Database, Zap } from "lucide-react"

export function ApiUsageMonitor() {
  const [usage, setUsage] = useState({
    used: 0,
    remaining: 100,
    limit: 100,
    cacheSize: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = () => {
    setLoading(true)
    setError(null)
    try {
      const stats = unifiedSportsAPI.getApiUsage()
      // Transform TheSportsDB metrics to expected format
      setUsage({
        used: stats.requests || 0,
        remaining: 30 - (stats.requests || 0), // Free tier limit
        limit: 30,
        cacheSize: stats.cacheSize || 0,
      })
    } catch (err) {
      console.error("Failed to fetch API usage:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch usage data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsage()
    const interval = setInterval(fetchUsage, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const usagePercentage = (usage.used / usage.limit) * 100
  const getUsageColor = () => {
    if (usagePercentage >= 90) return "text-red-400"
    if (usagePercentage >= 70) return "text-yellow-400"
    return "text-green-400"
  }

  const getUsageStatus = () => {
    if (usagePercentage >= 90) return { icon: AlertTriangle, text: "Critical", color: "bg-red-500" }
    if (usagePercentage >= 70) return { icon: AlertTriangle, text: "Warning", color: "bg-yellow-500" }
    return { icon: CheckCircle, text: "Healthy", color: "bg-green-500" }
  }

  const status = getUsageStatus()
  const StatusIcon = status.icon

  const clearCache = () => {
    try {
      unifiedSportsAPI.clearCache()
      fetchUsage()
    } catch (err) {
      console.error("Failed to clear cache:", err)
      setError("Failed to clear cache")
    }
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">API Usage Monitor Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          {error.includes("JWT_SECRET") && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-400">
                <strong>Development Mode:</strong> Add JWT_SECRET to your .env.local file or environment variables.
              </p>
            </div>
          )}
          <Button onClick={fetchUsage} variant="outline" className="bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* API Usage Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Usage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usage.used}/{usage.limit}
          </div>
          <Progress value={usagePercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{usage.remaining} requests remaining</p>
        </CardContent>
      </Card>

      {/* Usage Status */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <StatusIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={status.color}>{status.text}</Badge>
          </div>
          <p className={`text-2xl font-bold mt-2 ${getUsageColor()}`}>{Math.round(usagePercentage)}%</p>
          <p className="text-xs text-muted-foreground">of daily limit used</p>
        </CardContent>
      </Card>

      {/* Cache Information */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usage.cacheSize}</div>
          <p className="text-xs text-muted-foreground mt-2">cached responses</p>
          <Button onClick={clearCache} variant="outline" size="sm" className="mt-2 w-full bg-transparent">
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Controls</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              onClick={fetchUsage}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
