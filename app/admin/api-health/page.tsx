"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { ApiHealthDashboard } from "@/components/admin/api-health-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdmin } from "@/lib/auth/admin"
import { Activity, Download, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function ApiHealthPage() {
  const [mounted, setMounted] = useState(false)
  const [healthReport, setHealthReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const { isAdmin } = useAdmin()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect non-admin users
  useEffect(() => {
    if (mounted && !isAdmin) {
      redirect("/")
    }
  }, [mounted, isAdmin])

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await fetch("/api/admin/health/report", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to generate report")
      const report = await res.text()
      setHealthReport(report)
    } catch (error) {
      console.error("Failed to generate health report:", error)
    } finally {
      setGeneratingReport(false)
    }
  }

  const downloadReport = () => {
    if (!healthReport) return

    const blob = new Blob([healthReport], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `api-health-report-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Loading state
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 bg-sl-ground min-h-screen">
        <div className="space-y-4">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="container mx-auto px-4 py-8 bg-sl-ground min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-sl-dim mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-sl-mute">Administrator privileges required to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-sl-ground min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Admin Panel
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">API Health Monitor</h1>
          <p className="text-lg text-sl-mute mt-2">Real-time monitoring and diagnostics for all system APIs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={generateReport}
            disabled={generatingReport}
            variant="outline"
            className="gap-2 border-sl-line text-sl-mid hover:text-white bg-transparent"
          >
            <Activity className="w-4 h-4" />
            {generatingReport ? "Generating..." : "Generate Report"}
          </Button>
          {healthReport && (
            <Button onClick={downloadReport} className="gap-2 bg-green-500 hover:bg-green-600">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Main Dashboard */}
      <ApiHealthDashboard />

      {/* Health Report */}
      {healthReport && (
        <Card className="bg-sl-surface/50 border-sl-line">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Generated Health Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-sl-raise/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-sl-mid whitespace-pre-wrap font-mono">{healthReport}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Production Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sl-mid text-sm mb-4">All APIs are operational and ready for production deployment.</p>
            <Button variant="outline" size="sm" className="bg-transparent border-green-500/30 text-green-400">
              Deploy to Production
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sl-mid text-sm mb-4">Set up alerts and monitoring for production environment.</p>
            <Button variant="outline" size="sm" className="bg-transparent border-yellow-500/30 text-yellow-400">
              Configure Alerts
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Clock className="w-5 h-5" />
              Scheduled Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sl-mid text-sm mb-4">Automated API health checks run every 5 minutes.</p>
            <Button variant="outline" size="sm" className="bg-transparent border-blue-500/30 text-blue-400">
              View Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
