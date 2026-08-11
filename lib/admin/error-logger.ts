// Error and warning logger for admin monitoring
export interface LogEntry {
  id: string
  timestamp: string
  type: "error" | "warning" | "info" | "api_call"
  source: string
  message: string
  details?: any
  stack?: string
  statusCode?: number
  endpoint?: string
  responseTime?: number
}

class ErrorLogger {
  private logs: LogEntry[] = []
  private readonly MAX_LOGS = 1000 // Keep last 1000 entries

  logError(error: Error, source: string, details?: any) {
    const entry: LogEntry = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: "error",
      source,
      message: error.message,
      details,
      stack: error.stack,
    }

    this.logs.unshift(entry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    console.error(`[${source}]`, error.message, details)
    return entry
  }

  logWarning(message: string, source: string, details?: any) {
    const entry: LogEntry = {
      id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: "warning",
      source,
      message,
      details,
    }

    this.logs.unshift(entry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    console.warn(`[${source}]`, message, details)
    return entry
  }

  logApiCall(endpoint: string, statusCode: number, responseTime: number, details?: any) {
    const entry: LogEntry = {
      id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: "api_call",
      source: "api",
      message: `${endpoint} - ${statusCode}`,
      endpoint,
      statusCode,
      responseTime,
      details,
    }

    this.logs.unshift(entry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    return entry
  }

  logInfo(message: string, source: string, details?: any) {
    const entry: LogEntry = {
      id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: "info",
      source,
      message,
      details,
    }

    this.logs.unshift(entry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    return entry
  }

  getLogs(filters?: { type?: LogEntry["type"]; source?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logs]

    if (filters?.type) {
      filtered = filtered.filter((log) => log.type === filters.type)
    }

    if (filters?.source) {
      filtered = filtered.filter((log) => log.source === filters.source)
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  getStats() {
    const errors = this.logs.filter((l) => l.type === "error").length
    const warnings = this.logs.filter((l) => l.type === "warning").length
    const apiCalls = this.logs.filter((l) => l.type === "api_call").length
    const recentErrors = this.logs.filter((l) => l.type === "error" && this.isRecent(l.timestamp, 24)).length
    const recentWarnings = this.logs.filter((l) => l.type === "warning" && this.isRecent(l.timestamp, 24)).length

    return {
      total: this.logs.length,
      errors,
      warnings,
      apiCalls,
      recentErrors,
      recentWarnings,
    }
  }

  private isRecent(timestamp: string, hours: number): boolean {
    const logTime = new Date(timestamp).getTime()
    const now = Date.now()
    return now - logTime < hours * 60 * 60 * 1000
  }

  clearLogs() {
    this.logs = []
  }

  clearLogsByType(type: LogEntry["type"]) {
    this.logs = this.logs.filter((log) => log.type !== type)
  }
}

export const errorLogger = new ErrorLogger()

