"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, CheckCircle, XCircle, TrendingUp, Database, Globe, Zap, AlertTriangle } from "lucide-react"

interface ApiMetrics {
  name: string
  status: "healthy" | "degraded" | "down"
  responseTime: number
  successRate: number
  requestCount: number
  errorCount: number
  lastChecked: string
  uptime: number
}

const mockMetrics: ApiMetrics[] = [
  {
    name: "TheSportsDB",
    status: "healthy",
    responseTime: 245,
    successRate: 98.5,
    requestCount: 1247,
    errorCount: 18,
    lastChecked: "2 minutes ago",
    uptime: 99.2,
  },
  {
    name: "NewsData.io",
    status: "healthy",
    responseTime: 180,
    successRate: 97.8,
    requestCount: 892,
    errorCount: 20,
    lastChecked: "1 minute ago",
    uptime: 98.9,
  },
  {
    name: "UFC Scraper",
    status: "degraded",
    responseTime: 1200,
    successRate: 89.2,
    requestCount: 156,
    errorCount: 17,
    lastChecked: "5 minutes ago",
    uptime: 94.1,
  },
  {
    name: "Claude AI",
    status: "healthy",
    responseTime: 850,
    successRate: 99.1,
    requestCount: 234,
    errorCount: 2,
    lastChecked: "3 minutes ago",
    uptime: 99.8,
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "degraded":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case "down":
      return <XCircle className="w-4 h-4 text-red-400" />
    default:
      return <Activity className="w-4 h-4 text-sl-mute" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "text-green-400 bg-green-400/10 border-green-400/20"
    case "degraded":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    case "down":
      return "text-red-400 bg-red-400/10 border-red-400/20"
    default:
      return "text-sl-mute bg-sl-mute/10 border-sl-outline/20"
  }
}

function getApiIcon(name: string) {
  switch (name) {
    case "TheSportsDB":
      return <Database className="w-5 h-5 text-blue-400" />
    case "NewsData.io":
      return <Globe className="w-5 h-5 text-green-400" />
    case "UFC Scraper":
      return <Zap className="w-5 h-5 text-red-400" />
    case "Claude AI":
      return <TrendingUp className="w-5 h-5 text-purple-400" />
    default:
      return <Activity className="w-5 h-5 text-sl-mute" />
  }
}

export function ApiStats() {
  const [metrics, setMetrics] = useState<ApiMetrics[]>(mockMetrics)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [usingRealData, setUsingRealData] = useState(false)

  const fetchRealMetrics = async () => {
    try {
      setIsLoading(true)

      // Get aggregated metrics from server endpoint
      const res = await fetch("/api/admin/metrics", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed")
      const aggregatedMetrics = await res.json()

      // Transform the real data into our component format
      const realMetrics: ApiMetrics[] = Object.entries(aggregatedMetrics).map(([apiName, data]: [string, any]) => {
        const totalRequests = data?.totalRequests || 0
        const totalErrors = data?.totalErrors || 0
        const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100

        // Determine status based on success rate and response time
        let status: "healthy" | "degraded" | "down" = "healthy"
        if (successRate < 50 || (data?.avgResponseTime || 0) > 5000) {
          status = "down"
        } else if (successRate < 90 || (data?.avgResponseTime || 0) > 2000) {
          status = "degraded"
        }

        return {
          name: apiName,
          status,
          responseTime: Math.round(data?.avgResponseTime || 0),
          successRate: Math.round(successRate * 10) / 10,
          requestCount: totalRequests,
          errorCount: totalErrors,
          lastChecked: data?.lastChecked || "Unknown",
          uptime: Math.round((data?.uptime || 99.0) * 10) / 10,
        }
      })

      if (realMetrics.length > 0) {
        setMetrics(realMetrics)
        setUsingRealData(true)
      } else {
        // No real data available, use mock data
        setMetrics(mockMetrics)
        setUsingRealData(false)
      }
    } catch (error) {
      console.error("Failed to fetch real API metrics:", error)
      // Fallback to mock data on error
      setMetrics(mockMetrics)
      setUsingRealData(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRealMetrics()

    // Set up interval to refresh data
    const interval = setInterval(() => {
      if (usingRealData) {
        fetchRealMetrics()
      } else {
        // Simulate real-time updates for mock data
        setMetrics((prev) =>
          prev.map((metric) => ({
            ...metric,
            responseTime: Math.max(50, metric.responseTime + Math.floor(Math.random() * 20 - 10)),
            requestCount: metric.requestCount + Math.floor(Math.random() * 5),
            lastChecked: "Just now",
          })),
        )
      }
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [usingRealData])

  const overallHealth = (metrics.filter((m) => m.status === "healthy").length / metrics.length) * 100
  const avgResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length
  const totalRequests = metrics.reduce((acc, m) => acc + m.requestCount, 0)
  const totalErrors = metrics.reduce((acc, m) => acc + m.errorCount, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-sl-surface/50 border-sl-line">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-sl-raise rounded w-20 mb-2"></div>
                  <div className="h-8 bg-sl-raise rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      {!usingRealData && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Using simulated data - Real API monitoring unavailable</span>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sl-mute">System Health</p>
                <p className="text-2xl font-bold text-green-400">{overallHealth.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sl-mute">Avg Response</p>
                <p className="text-2xl font-bold text-blue-400">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sl-mute">Total Requests</p>
                <p className="text-2xl font-bold text-purple-400">{totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sl-surface/50 border-sl-line">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sl-mute">Error Rate</p>
                <p className="text-2xl font-bold text-red-400">
                  {totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : "0.00"}%
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed API Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name} className="bg-sl-surface/50 border-sl-line">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getApiIcon(metric.name)}
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {getStatusIcon(metric.status)}
                  <span className="ml-1 capitalize">{metric.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Response Time */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sl-mute">Response Time</span>
                  <span className="font-medium">{metric.responseTime}ms</span>
                </div>
                <Progress value={Math.min((metric.responseTime / 1000) * 100, 100)} className="h-2" />
              </div>

              {/* Success Rate */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sl-mute">Success Rate</span>
                  <span className="font-medium">{metric.successRate}%</span>
                </div>
                <Progress value={metric.successRate} className="h-2 [&>*]:bg-green-500" />
              </div>

              {/* Uptime */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sl-mute">Uptime</span>
                  <span className="font-medium">{metric.uptime}%</span>
                </div>
                <Progress value={metric.uptime} className="h-2 [&>*]:bg-blue-500" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sl-line">
                <div>
                  <p className="text-xs text-sl-mute">Requests</p>
                  <p className="font-semibold">{metric.requestCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-sl-mute">Errors</p>
                  <p className="font-semibold text-red-400">{metric.errorCount}</p>
                </div>
              </div>

              <div className="text-xs text-sl-mute pt-2 border-t border-sl-line">
                Last checked: {metric.lastChecked}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Update Info */}
      <div className="text-center text-sm text-sl-mute">
        Last updated: {lastUpdate.toLocaleTimeString()}
        {usingRealData && <span className="ml-2 text-green-400">(Live Data)</span>}
        {!usingRealData && <span className="ml-2 text-yellow-400">(Simulated Data)</span>}
      </div>
    </div>
  )
}
