// Centralized API client with comprehensive error handling, rate limiting, and monitoring

interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
  retries?: number
  rateLimit?: {
    requests: number
    window: number
  }
}

interface ApiError {
  endpoint: string
  status: number
  message: string
  timestamp: string
  retryCount?: number
  details?: any
}

interface ApiMetrics {
  endpoint: string
  method: string
  status: number
  responseTime: number
  timestamp: string
  success: boolean
}

class ApiClient {
  private config: ApiConfig
  private metrics: ApiMetrics[] = []
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  private requestCache: Map<string, Promise<any>> = new Map()
  private batchQueue: Map<string, { requests: Array<{ resolve: Function; reject: Function; endpoint: string }> }> =
    new Map()

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      ...config,
    }
  }

  private getCacheKey(endpoint: string, options: RequestInit): string {
    return `${endpoint}:${JSON.stringify(options)}`
  }

  private processBatchRequests = debounce(() => {
    this.batchQueue.forEach(async (batch, batchKey) => {
      try {
        const results = await Promise.allSettled(batch.requests.map((req) => this.request(req.endpoint, {}, 0)))

        results.forEach((result, index) => {
          const request = batch.requests[index]
          if (result.status === "fulfilled") {
            request.resolve(result.value)
          } else {
            request.reject(result.reason)
          }
        })
      } catch (error) {
        batch.requests.forEach((req) => req.reject(error))
      }

      this.batchQueue.delete(batchKey)
    })
  }, 50) // Batch requests within 50ms window

  private checkRateLimit(endpoint: string): boolean {
    if (!this.config.rateLimit) return true

    const key = `${this.config.baseUrl}:${endpoint}`
    const now = Date.now()
    const limit = this.rateLimitStore.get(key)

    if (!limit || now > limit.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimit.window,
      })
      return true
    }

    if (limit.count >= this.config.rateLimit.requests) {
      return false
    }

    limit.count++
    return true
  }

  private recordMetrics(metrics: ApiMetrics): void {
    this.metrics.push(metrics)
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options)

    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!
    }

    const startTime = Date.now()
    const fullUrl = `${this.config.baseUrl}/${endpoint.replace(/^\//, "")}`

    // Rate limiting check
    if (!this.checkRateLimit(endpoint)) {
      throw new Error(`Rate limit exceeded for ${endpoint}`)
    }

    const requestPromise = this._executeRequest<T>(fullUrl, endpoint, options, retryCount, startTime)

    this.requestCache.set(cacheKey, requestPromise)

    requestPromise.finally(() => {
      setTimeout(() => this.requestCache.delete(cacheKey), 1000) // Keep cache for 1 second
    })

    return requestPromise
  }

  private async _executeRequest<T>(
    fullUrl: string,
    endpoint: string,
    options: RequestInit,
    retryCount: number,
    startTime: number,
  ): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "SmartLiveTV/1.0",
        ...(options.headers as Record<string, string>),
      }

      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseTime = Date.now() - startTime
      const success = response.ok

      this.recordMetrics({
        endpoint,
        method: options.method || "GET",
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        success,
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error")
        const apiError: ApiError = {
          endpoint: fullUrl,
          status: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          retryCount,
          details: errorBody,
        }

        // Retry logic for specific error codes
        if (retryCount < (this.config.retries || 0) && [408, 429, 500, 502, 503, 504].includes(response.status)) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return this.request<T>(endpoint, options, retryCount + 1)
        }

        throw new ApiClientError(apiError)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (error instanceof ApiClientError) {
        throw error
      }

      this.recordMetrics({
        endpoint,
        method: options.method || "GET",
        status: 0,
        responseTime,
        timestamp: new Date().toISOString(),
        success: false,
      })

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout for ${endpoint}`)
      }

      // Retry on network errors
      if (retryCount < (this.config.retries || 0)) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      throw error
    }
  }

  getMetrics(): ApiMetrics[] {
    return [...this.metrics]
  }

  getHealthStatus(): {
    totalRequests: number
    successRate: number
    averageResponseTime: number
    errorRate: number
    lastError?: ApiError
  } {
    const total = this.metrics.length
    const successful = this.metrics.filter((m) => m.success).length
    const avgResponseTime = total > 0 ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / total : 0

    return {
      totalRequests: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageResponseTime: Math.round(avgResponseTime),
      errorRate: total > 0 ? ((total - successful) / total) * 100 : 0,
    }
  }
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

class ApiClientError extends Error {
  constructor(public apiError: ApiError) {
    super(`API Error: ${apiError.message}`)
    this.name = "ApiClientError"
  }
}

export { ApiClient, ApiClientError }
export type { ApiConfig, ApiError, ApiMetrics }
