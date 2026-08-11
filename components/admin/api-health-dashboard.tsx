"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingUp, Zap, Shield, Database, Globe } from "lucide-react"
import type { SystemHealth } from "@/lib/api/api-monitor"

export function ApiHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchHealth = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setRefreshing(true)

    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 500 && errorData.error?.includes("JWT_SECRET")) {
          throw new Error("JWT_SECRET_MISSING")
        }
        throw new Error("Failed to load health")
      }
      const healthData: SystemHealth = await res.json()
      setHealth(healthData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Failed to fetch API health:", error)
      setHealth(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHealth()

    // Auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        fetchHealth(false)
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "degraded":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      case "down":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />
      case "degraded":
        return <AlertTriangle className="w-4 h-4" />
      case "down":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!health) {
    // Check if this is a JWT_SECRET missing error
    const isJwtSecretMissing = loading === false && !refreshing
    
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            {isJwtSecretMissing ? "JWT_SECRET Missing" : "Failed to Load API Health"}
          </h3>
          <p className="text-gray-400 mb-4">
            {isJwtSecretMissing 
              ? "JWT_SECRET environment variable is required for admin authentication. Please set JWT_SECRET in your environment variables."
              : "Unable to retrieve system health information"
            }
          </p>
          {isJwtSecretMissing ? (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-400">
                <strong>Development Mode:</strong> Add JWT_SECRET to your .env.local file or environment variables.
              </p>
            </div>
          ) : null}
          <Button onClick={() => fetchHealth()} variant="outline" className="bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Health Dashboard</h2>
          <p className="text-gray-400">Real-time monitoring of all system APIs</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-sm text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          )}
          <Button
            onClick={() => fetchHealth(false)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${getStatusColor(health.overall)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health.overall)}`}>{getStatusIcon(health.overall)}</div>
            <div>
              <span className="text-2xl">System Status: </span>
              <Badge className={getStatusColor(health.overall)}>{health.overall.toUpperCase()}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{health.metrics.totalRequests}</div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{health.metrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{health.metrics.averageResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{health.metrics.errorRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual API Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {health.apis.map((api) => (
          <Card key={api.name} className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(api.status)}`}>
                    {api.name === "TheSportsDB" && <Database className="w-5 h-5" />}
                    {api.name === "NewsData.io" && <Globe className="w-5 h-5" />}
                    {api.name === "UFC" && <Zap className="w-5 h-5" />}
                    {api.name === "Claude AI" && <Shield className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{api.name}</h3>
                    <p className="text-sm text-gray-400">{api.endpoint}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(api.status)}>{api.status.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Response Time</span>
                  <span className="font-mono text-sm text-white">{api.responseTime}ms</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Last Checked</span>
                  <span className="text-sm text-white">{new Date(api.lastChecked).toLocaleTimeString()}</span>
                </div>

                {api.responseTime > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Performance</span>
                      <span className="text-sm text-white">
                        {api.responseTime < 1000
                          ? "Excellent"
                          : api.responseTime < 3000
                            ? "Good"
                            : api.responseTime < 5000
                              ? "Fair"
                              : "Poor"}
                      </span>
                    </div>
                    <Progress value={Math.min((5000 - api.responseTime) / 50, 100)} className="h-2" />
                  </div>
                )}

                {api.errorMessage && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Error</p>
                        <p className="text-sm text-gray-300">{api.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {api.details && api.status === "healthy" && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-400">Details</p>
                        <div className="text-xs text-gray-300 mt-1">
                          {typeof api.details === "string" ? (
                            <p>{api.details}</p>
                          ) : (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(api.details, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Metrics Chart */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Success Rate</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current</span>
                  <span className="text-sm font-mono text-green-400">{health.metrics.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={health.metrics.successRate} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Response Time</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Average</span>
                  <span className="text-sm font-mono text-blue-400">
                    {health.metrics.averageResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <Progress value={Math.min((5000 - health.metrics.averageResponseTime) / 50, 100)} className="h-2" />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Error Rate</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current</span>
                  <span className="text-sm font-mono text-red-400">{health.metrics.errorRate.toFixed(1)}%</span>
                </div>
                <Progress value={health.metrics.errorRate} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
