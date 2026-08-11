"use client"

import { useState, useEffect, useCallback } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiUsageMonitor } from "@/components/admin/api-usage-monitor"
import { Key, Shield, RefreshCw, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAdmin } from "@/lib/auth/admin"
import { UnifiedSportsApi } from "@/lib/api/unified-sports-api"

export default function ApiManagementPage() {
  const [mounted, setMounted] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()
  const { isAdmin, extendSession } = useAdmin()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect non-admin users
  useEffect(() => {
    if (mounted && !isAdmin) {
      redirect("/")
    }
  }, [mounted, isAdmin])

  // Load initial data
  useEffect(() => {
    if (mounted && isAdmin) {
      testApiConnection()
    }
  }, [mounted, isAdmin])

  // Extend admin session on activity
  useEffect(() => {
    const handleActivity = () => {
      if (isAdmin) {
        extendSession()
      }
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [isAdmin, extendSession])

  const testApiConnection = useCallback(async () => {
    setIsTesting(true)
    try {
      const { unifiedSportsAPI } = await import("@/lib/api/unified-sports-api")
      const result = await unifiedSportsAPI.testConnection()
      setConnectionStatus(result)

      toast({
        title: result.success ? "API Connection Successful" : "API Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("API test failed:", error)
      setConnectionStatus({
        success: false,
        message: "Connection test failed",
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      })

      toast({
        title: "Connection Test Failed",
        description: "Unable to test API connection",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
      setIsLoading(false)
    }
  }, [toast])

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-950 min-h-screen">
        <div className="space-y-4">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-950 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400">Administrator privileges required to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Admin Panel
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">API Management</h1>
          <p className="text-lg text-gray-400 mt-2">Unified Sports API with intelligent caching and rate limiting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={testApiConnection}
            disabled={isTesting}
            variant="outline"
            className="gap-2 border-gray-700 text-gray-300 hover:text-white bg-transparent"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <Card
          className={`bg-gray-900/50 border-gray-800 ${connectionStatus.success ? "border-green-500/30" : "border-red-500/30"}`}
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 ${connectionStatus.success ? "text-green-400" : "text-red-400"}`}
            >
              <Key className="w-5 h-5" />
              TheSportsDB Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={connectionStatus.success ? "default" : "destructive"}
                  className={connectionStatus.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                >
                  {connectionStatus.success ? "Connected" : "Failed"}
                </Badge>
                <span className="text-gray-300">{connectionStatus.message}</span>
              </div>

              {connectionStatus.details && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">Connection Details</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(connectionStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Usage Monitor */}
      <ApiUsageMonitor />

      {/* API Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">Smart Caching</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Static data cached for 24 hours</li>
              <li>• Semi-static data cached for 6 hours</li>
              <li>• Dynamic data cached for 1 hour</li>
              <li>• Live data cached for 5 minutes</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-400">Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• ~30 requests per minute (free tier)</li>
              <li>• Intelligent request prioritization</li>
              <li>• Automatic rate limit handling</li>
              <li>• Usage tracking and alerts</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400">Data Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Multi-sport support (Soccer, Motorsport, etc.)</li>
              <li>• Live scores and fixtures</li>
              <li>• Player statistics</li>
              <li>• Team and league information</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Tips */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">API Optimization Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-400">Cache Strategy</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Leagues and teams: Long-term cache (24h)</li>
                <li>• Standings and stats: Medium-term cache (6h)</li>
                <li>• Fixtures and scores: Short-term cache (1h)</li>
                <li>• Live events: Minimal cache (5m)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-400">Request Optimization</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Batch requests when possible</li>
                <li>• Prioritize popular leagues</li>
                <li>• Use season-specific caching</li>
                <li>• Implement graceful degradation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
