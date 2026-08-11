// Comprehensive API monitoring and health dashboard
import { testConnection as testTheSportsDbConnection, getMetrics as getTheSportsDbMetrics } from "./the-sports-db"
// Removed testNewsApiConnection, getNewsApiMetrics, getNewsApiHealth from "./news"
import { getApiBaseUrl } from "@/lib/utils/url"
// UFC is checked via HTTP fetch to /api/ufc/events to avoid pulling cheerio/ufc-scraper into the bundle
// REMOVED: Claude API - All AI features removed per requirements

function getTheSportsDbHealth(status: any): "healthy" | "degraded" | "down" {
  if (status.success && status.responseTime < 1000) return "healthy"
  if (status.success && status.responseTime < 3000) return "degraded"
  return "down"
}

export interface ApiStatus {
  name: string
  endpoint: string
  status: "healthy" | "degraded" | "down" | "unknown"
  responseTime: number
  lastChecked: string
  errorMessage?: string
  details?: any
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "down"
  apis: ApiStatus[]
  metrics: {
    totalRequests: number
    successRate: number
    averageResponseTime: number
    errorRate: number
  }
  lastUpdated: string
}

class ApiMonitor {
  private healthData: SystemHealth = {
    overall: "down",
    apis: [],
    metrics: {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
    },
    lastUpdated: new Date().toISOString(),
  }

  async checkAllApis(): Promise<SystemHealth> {
    console.log("[API MONITOR] Starting comprehensive API health check...")

    const startTime = Date.now()
    const apiChecks = await Promise.allSettled([
      this.checkTheSportsDb(),
      this.checkNewsApi(),
      this.checkUfcApi(),
    ])

    const apis: ApiStatus[] = apiChecks.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        const apiNames = ["TheSportsDB", "NewsData.io", "UFC"]
        return {
          name: apiNames[index],
          endpoint: "Unknown",
          status: "down" as const,
          responseTime: 0,
          lastChecked: new Date().toISOString(),
          errorMessage: result.reason?.message || "Unknown error",
        }
      }
    })

    // Calculate overall system health
    const healthyApis = apis.filter((api) => api.status === "healthy").length
    const degradedApis = apis.filter((api) => api.status === "degraded").length
    const downApis = apis.filter((api) => api.status === "down").length

    let overall: "healthy" | "degraded" | "down"
    if (downApis === apis.length) {
      overall = "down"
    } else if (downApis > 0 || degradedApis > healthyApis) {
      overall = "degraded"
    } else {
      overall = "healthy"
    }

    // Aggregate metrics from API checks
    const healthyCount = apis.filter((api) => api.status === "healthy").length
    const totalCount = apis.length
    const metrics = getTheSportsDbMetrics()
    const averageResponseTime =
      apis.length > 0 ? apis.reduce((sum, api) => sum + api.responseTime, 0) / apis.length : 0

    this.healthData = {
      overall,
      apis,
      metrics: {
        totalRequests: metrics.requests || 0,
        successRate: healthyCount / totalCount,
        averageResponseTime,
        errorRate: (totalCount - healthyCount) / totalCount,
      },
      lastUpdated: new Date().toISOString(),
    }

    const totalTime = Date.now() - startTime
    console.log(`[API MONITOR] Health check completed in ${totalTime}ms. Overall status: ${overall}`)

    return this.healthData
  }

  private async checkTheSportsDb(): Promise<ApiStatus> {
    const startTime = Date.now()

    try {
      const result = await testTheSportsDbConnection()
      const responseTime = Date.now() - startTime
      const health = getTheSportsDbHealth(result)

      return {
        name: "TheSportsDB",
        endpoint: "https://www.thesportsdb.com/api/v1/json",
        status: health,
        responseTime: result.responseTime,
        lastChecked: new Date().toISOString(),
        errorMessage: result.success ? undefined : result.message,
      }
    } catch (error) {
      return {
        name: "TheSportsDB",
        endpoint: "https://www.thesportsdb.com/api/v1/json",
        status: "down",
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkNewsApi(): Promise<ApiStatus> {
    return {
      name: "NewsData.io",
      endpoint: "https://newsdata.io/api/1",
      status: "unknown",
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      errorMessage: "Health check removed in simplified API",
    }
  }

  private async checkUfcApi(): Promise<ApiStatus> {
    const startTime = Date.now()
    const baseUrl = getApiBaseUrl()

    try {
      const res = await fetch(`${baseUrl}/api/ufc/events`, { cache: "no-store" })
      const responseTime = Date.now() - startTime
      const ok = res.ok
      let errorMessage: string | undefined
      if (!ok) {
        try {
          const data = await res.json().catch(() => ({}))
          errorMessage = data.error || res.statusText
        } catch {
          errorMessage = res.statusText
        }
      }

      return {
        name: "UFC",
        endpoint: "https://www.ufc.com",
        status: ok ? "healthy" : "down",
        responseTime,
        lastChecked: new Date().toISOString(),
        errorMessage,
      }
    } catch (error) {
      return {
        name: "UFC",
        endpoint: "https://www.ufc.com",
        status: "down",
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // REMOVED: checkClaudeApi() - All AI features removed per requirements

  getCurrentHealth(): SystemHealth {
    return this.healthData
  }

  getApiMetrics() {
    return {
      theSportsDb: getTheSportsDbMetrics(),
      news: { requestCount: 0, errorCount: 0, averageResponseTime: 0, uptime: 0 },
      ufc: { requestCount: 0, errorCount: 0, averageResponseTime: 0, uptime: 0 },
    }
  }

  async generateHealthReport(): Promise<string> {
    const health = await this.checkAllApis()
    const metrics = this.getApiMetrics()

    let report = `# API Health Report\n\n`
    report += `**Generated:** ${new Date().toLocaleString()}\n`
    report += `**Overall Status:** ${health.overall.toUpperCase()}\n\n`

    report += `## System Metrics\n`
    report += `- Total Requests: ${health.metrics.totalRequests}\n`
    report += `- Success Rate: ${health.metrics.successRate.toFixed(1)}%\n`
    report += `- Average Response Time: ${health.metrics.averageResponseTime.toFixed(0)}ms\n`
    report += `- Error Rate: ${health.metrics.errorRate.toFixed(1)}%\n\n`

    report += `## API Status\n\n`

    for (const api of health.apis) {
      report += `### ${api.name}\n`
      report += `- **Status:** ${api.status.toUpperCase()}\n`
      report += `- **Endpoint:** ${api.endpoint}\n`
      report += `- **Response Time:** ${api.responseTime}ms\n`
      report += `- **Last Checked:** ${new Date(api.lastChecked).toLocaleString()}\n`

      if (api.errorMessage) {
        report += `- **Error:** ${api.errorMessage}\n`
      }

      if (api.details) {
        report += `- **Details:** ${JSON.stringify(api.details, null, 2)}\n`
      }

      report += `\n`
    }

    return report
  }
}

// Singleton instance
const apiMonitor = new ApiMonitor()

export { apiMonitor }
