"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Loader2, Send, TestTube, Database, Globe, Download, XCircle } from "lucide-react"
import { API_CONFIG, ALLOWED_DOMAINS, BATCH_LIMITS, RESPONSE_LIMITS } from "@/lib/config"
import { getCache as getClientCache, setCache as setClientCache } from "@/lib/cache"

const getCacheKey = (url: string) => `cache:${url}`;

interface ApiTestResult {
  success: boolean
  message: string
  data?: any
  responseTime?: number
}

interface BatchTestResult {
  api: string
  method: string
  endpoint: string
  success: boolean
  message: string
  responseTime: number
  timestamp: string
}

// Security: RISK-002 - Use config from environment variables instead of hardcoded URLs
const API_ENDPOINTS = {
  "the-sports-db": {
    name: "TheSportsDB",
    baseUrl: API_CONFIG.thesportsdb.baseUrl,
    icon: Database,
    color: "text-blue-400",
    methods: [
      { name: "Search Teams", endpoint: "/searchteams.php?t=", param: "team name" },
      { name: "Lookup Team", endpoint: "/lookupteam.php?id=", param: "team ID" },
      { name: "Search Players", endpoint: "/searchplayers.php?p=", param: "player name" },
      { name: "Lookup Player", endpoint: "/lookupplayer.php?id=", param: "player ID" },
      { name: "Team Events Next", endpoint: "/eventsnext.php?id=", param: "team ID" },
      { name: "Events Season", endpoint: "/eventsseason.php?id=&s=", param: "leagueId + season (YYYY-YYYY)" },
      { name: "All Leagues", endpoint: "/all_leagues.php", param: "none" },
      // add whichever endpoints you need; always use endpoints that append params, not hard-coded full URLs
    ],
  },
  "news-api": {
    name: "NewsData.io",
    baseUrl: API_CONFIG.newsdata.baseUrl,
    icon: Globe,
    color: "text-green-400",
    methods: [
      { name: "Latest News", endpoint: "/news?apikey=API_KEY&category=sports", param: "none" },
      { name: "Search News", endpoint: "/news?apikey=API_KEY&q=football", param: "search query" },
      { name: "News by Country", endpoint: "/news?apikey=API_KEY&country=us", param: "country code" },
    ],
  },
  "ufc-api": {
    name: "UFC Scraper",
    baseUrl: API_CONFIG.ufc.baseUrl,
    icon: TestTube,
    color: "text-red-400",
    methods: [
      { name: "Fighter Search", endpoint: "/athletes/all?search=mcgregor", param: "fighter name" },
      { name: "Event Listings", endpoint: "/events", param: "none" },
      { name: "Rankings", endpoint: "/rankings", param: "none" },
    ],
  },
}

// Security: RISK-003 - URL validation helper to prevent SSRF
function validateUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return ALLOWED_DOMAINS.some((domain) => u.hostname === domain || u.hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}

// Security: RISK-005 - Sanitize JSON data before rendering
function sanitizeJsonData(data: any): any {
  if (typeof data === "string") {
    return data.slice(0, 10000) // Limit size
  }
  return data
}

// Security: RISK-013 - Standardized error sanitization
function sanitizeError(error: unknown): string {
  return "Test failed: API request unsuccessful. Please check the endpoint and try again."
}

export function ApiForm() {
  const [selectedApi, setSelectedApi] = useState<string>("the-sports-db")
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [parameter, setParameter] = useState<string>("")
  const [customEndpoint, setCustomEndpoint] = useState<string>("")
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [batchResults, setBatchResults] = useState<BatchTestResult[]>([])
  const [batchProgress, setBatchProgress] = useState(0)
  const [isBatchTesting, setIsBatchTesting] = useState(false)
  const [batchComplete, setBatchComplete] = useState(false)

  const currentApi = API_ENDPOINTS[selectedApi as keyof typeof API_ENDPOINTS]
  const currentMethod = currentApi?.methods.find((m) => m.name === selectedMethod)

  const handleApiTest = async () => {
    if (!selectedApi || (!selectedMethod && !customEndpoint)) {
      setTestResult({
        success: false,
        message: "Please select an API and method or provide a custom endpoint",
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const startTime = Date.now()

      let testUrl = ""
      if (customEndpoint) {
        // Security: RISK-003 - Validate custom endpoint URL
        if (!validateUrl(customEndpoint)) {
          setTestResult({
            success: false,
            message: `Invalid URL. Allowed domains: ${ALLOWED_DOMAINS.join(", ")}`,
          })
          setIsLoading(false)
          return
        }
        testUrl = customEndpoint
      } else if (currentMethod) {
        // Security: RISK-004 - Encode parameter safely
        const encodedParam = parameter ? encodeURIComponent(parameter.trim()) : ""
        testUrl = `${currentApi.baseUrl}${currentMethod.endpoint}${encodedParam}`
      }

      // Security: RISK-008 - API key replacement moved to server-side (/api/test-endpoint)
      // API_KEY placeholder will be replaced server-side

      // Security: RISK-012 - Check cache first
      const cacheKey = getCacheKey(testUrl)
      const cached = getClientCache<any>(cacheKey)
      if (cached) {
        setTestResult({
          success: cached.success,
          message: cached.message + " (cached)",
          data: cached.data,
          responseTime: cached.responseTime || 0,
        })
        setIsLoading(false)
        return
      }

      // Security: RISK-010 - Add timeout with AbortController
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), RESPONSE_LIMITS.timeoutMs)

      try {
        const response = await fetch(`/api/test-endpoint?url=${encodeURIComponent(testUrl)}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const result = await response.json()
        const responseTime = Date.now() - startTime

        const testResult = {
          success: response.ok && result.success,
          message: result.message || (response.ok ? "API test successful" : "API test failed"),
          data: result.data ? sanitizeJsonData(result.data) : undefined, // Security: RISK-005
          responseTime,
        }

        setTestResult(testResult)

        // Cache successful results (5 minutes)
        if (testResult.success && testResult.data) {
          setClientCache(cacheKey, testResult, 5 * 60 * 1000)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          setTestResult({
            success: false,
            message: "Request timeout. Please try again.",
          })
        } else {
          throw fetchError
        }
      }
    } catch (error) {
      // Security: RISK-006 - Use sanitized error message
      setTestResult({
        success: false,
        message: sanitizeError(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchTest = async () => {
    setIsBatchTesting(true)
    setBatchResults([])
    setBatchProgress(0)
    setBatchComplete(false)

    const allTests: Array<{ api: string; method: string; endpoint: string }> = []

    // Collect all test endpoints
    Object.entries(API_ENDPOINTS).forEach(([apiKey, apiConfig]) => {
      apiConfig.methods.forEach((method) => {
        allTests.push({
          api: apiConfig.name,
          method: method.name,
          endpoint: `${apiConfig.baseUrl}${method.endpoint}`,
        })
      })
    })

    // Security: RISK-007 - Enforce batch size limit
    if (allTests.length > BATCH_LIMITS.maxBatchSize) {
      setTestResult({
        success: false,
        message: `Batch size (${allTests.length}) exceeds maximum of ${BATCH_LIMITS.maxBatchSize}. Please reduce the number of endpoints.`,
      })
      setIsBatchTesting(false)
      return
    }

    const results: BatchTestResult[] = []

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i]
      const startTime = Date.now()

      try {
        let testUrl = test.endpoint

        // Security: RISK-008 - API key replacement moved to server-side
        // API_KEY placeholder will be replaced server-side

        // Security: RISK-010 - Add timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), RESPONSE_LIMITS.timeoutMs)

        try {
          const response = await fetch(`/api/test-endpoint?url=${encodeURIComponent(testUrl)}`, {
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          const result = await response.json()
          const responseTime = Date.now() - startTime

          const testResult: BatchTestResult = {
            api: test.api,
            method: test.method,
            endpoint: test.endpoint,
            success: response.ok && result.success,
            message: result.message || (response.ok ? "Success" : "Failed"),
            responseTime,
            timestamp: new Date().toISOString(),
          }

          results.push(testResult)
          setBatchResults([...results])
        } catch (fetchError) {
          clearTimeout(timeoutId)
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            throw new Error("Request timeout")
          }
          throw fetchError
        }
      } catch (error) {
        // Security: RISK-013 - Use sanitized error message
        const testResult: BatchTestResult = {
          api: test.api,
          method: test.method,
          endpoint: test.endpoint,
          success: false,
          message: sanitizeError(error),
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }

        results.push(testResult)
        setBatchResults([...results])
      }

      // Update progress
      setBatchProgress(((i + 1) / allTests.length) * 100)

      // Security: RISK-007 - Increased delay between tests
      await new Promise((resolve) => setTimeout(resolve, BATCH_LIMITS.minDelayMs))
    }

    setBatchComplete(true)
    setIsBatchTesting(false)
  }

  const downloadBatchResults = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    const successCount = batchResults.filter((r) => r.success).length
    const totalCount = batchResults.length
    const avgResponseTime = batchResults.reduce((sum, r) => sum + r.responseTime, 0) / totalCount

    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests: totalCount,
        successfulTests: successCount,
        failedTests: totalCount - successCount,
        successRate: `${((successCount / totalCount) * 100).toFixed(1)}%`,
        averageResponseTime: `${avgResponseTime.toFixed(0)}ms`,
      },
      results: batchResults,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `api-health-report-${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleQuickTest = async (apiKey: string) => {
    setSelectedApi(apiKey)
    setSelectedMethod(API_ENDPOINTS[apiKey as keyof typeof API_ENDPOINTS].methods[0].name)
    setParameter("")

    // Auto-run test after a short delay
    setTimeout(() => {
      handleApiTest()
    }, 500)
  }

  const successfulTests = batchResults.filter((r) => r.success).length
  const failedTests = batchResults.length - successfulTests
  const avgResponseTime =
    batchResults.length > 0 ? batchResults.reduce((sum, r) => sum + r.responseTime, 0) / batchResults.length : 0

  return (
    <div className="space-y-6">
      {/* Quick Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(API_ENDPOINTS).map(([key, api]) => {
          const Icon = api.icon
          return (
            <Button
              key={key}
              variant="outline"
              onClick={() => handleQuickTest(key)}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-gray-900/50 border-gray-700 hover:border-gray-600"
            >
              <Icon className={`w-6 h-6 ${api.color}`} />
              <span className="font-medium">{api.name}</span>
              <span className="text-xs text-gray-400">Quick Test</span>
            </Button>
          )
        })}
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="batch">Batch Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                API Endpoint Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-select">Select API</Label>
                  <Select value={selectedApi} onValueChange={setSelectedApi}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an API" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(API_ENDPOINTS).map(([key, api]) => (
                        <SelectItem key={key} value={key}>
                          {api.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method-select">Select Method</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a method" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentApi?.methods.map((method) => (
                        <SelectItem key={method.name} value={method.name}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parameter Input */}
              {currentMethod && currentMethod.param !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="parameter">Parameter ({currentMethod.param})</Label>
                  {/* Security: RISK-014 - Add input length validation */}
                  <Input
                    id="parameter"
                    value={parameter}
                    onChange={(e) => setParameter(e.target.value)}
                    placeholder={`Enter ${currentMethod.param}`}
                    className="bg-gray-800 border-gray-700"
                    maxLength={200}
                  />
                </div>
              )}

              {/* Custom Endpoint */}
              <div className="space-y-2">
                <Label htmlFor="custom-endpoint">Or use custom endpoint URL</Label>
                {/* Security: RISK-014 - Add input length validation */}
                <Input
                  id="custom-endpoint"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="bg-gray-800 border-gray-700"
                  maxLength={500}
                />
              </div>

              {/* Test Button */}
              <Button onClick={handleApiTest} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isLoading ? "Testing..." : "Test API Endpoint"}
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResult && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  Test Results
                  {testResult.responseTime && (
                    <Badge variant="secondary" className="ml-auto">
                      {testResult.responseTime}ms
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`p-3 rounded-lg ${testResult.success ? "bg-green-900/20 border border-green-500/20" : "bg-red-900/20 border border-red-500/20"}`}
                  >
                    <p className={testResult.success ? "text-green-400" : "text-red-400"}>{testResult.message}</p>
                  </div>

                  {testResult.data && (
                    <div className="space-y-2">
                      <Label>Response Data</Label>
                      {/* Security: RISK-005 - Data is sanitized before rendering */}
                      <Textarea
                        value={JSON.stringify(sanitizeJsonData(testResult.data), null, 2)}
                        readOnly
                        className="bg-gray-800 border-gray-700 font-mono text-sm h-40"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Batch API Testing
                {batchComplete && (
                  <Button
                    onClick={downloadBatchResults}
                    variant="outline"
                    size="sm"
                    className="ml-auto bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">Run comprehensive tests across all API endpoints to verify system health.</p>

              <Button onClick={handleBatchTest} disabled={isBatchTesting} className="w-full">
                {isBatchTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                {isBatchTesting ? "Running Tests..." : "Run Full API Test Suite"}
              </Button>

              {isBatchTesting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Testing Progress</span>
                    <span>{Math.round(batchProgress)}%</span>
                  </div>
                  <Progress value={batchProgress} className="w-full" />
                </div>
              )}

              {batchResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{successfulTests}</div>
                    <div className="text-xs text-gray-400">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{failedTests}</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{Math.round(avgResponseTime)}ms</div>
                    <div className="text-xs text-gray-400">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {batchResults.length > 0 ? Math.round((successfulTests / batchResults.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {batchResults.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${result.success
                          ? "bg-green-900/20 border border-green-500/20"
                          : "bg-red-900/20 border border-red-500/20"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="font-medium text-sm">
                            {result.api} - {result.method}
                          </div>
                          <div className="text-xs text-gray-400">{result.message}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.responseTime}ms
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
