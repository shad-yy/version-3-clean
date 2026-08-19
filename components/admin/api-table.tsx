"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ApiEndpoint {
  id: string
  name: string
  method: string
  endpoint: string
  status: "active" | "inactive" | "error"
  lastCalled: string
  responseTime: number
  successRate: number
  callCount: number
}

const mockEndpoints: ApiEndpoint[] = [
  {
    id: "1",
    name: "Search Teams",
    method: "GET",
    endpoint: "/api/teams/search",
    status: "active",
    lastCalled: "2 minutes ago",
    responseTime: 245,
    successRate: 98.5,
    callCount: 1247,
  },
  {
    id: "2",
    name: "Get Team Details",
    method: "GET",
    endpoint: "/api/teams/{id}",
    status: "active",
    lastCalled: "5 minutes ago",
    responseTime: 180,
    successRate: 99.2,
    callCount: 892,
  },
  {
    id: "3",
    name: "Search Players",
    method: "GET",
    endpoint: "/api/players/search",
    status: "error",
    lastCalled: "1 hour ago",
    responseTime: 1200,
    successRate: 89.2,
    callCount: 156,
  },
  {
    id: "4",
    name: "Get News",
    method: "GET",
    endpoint: "/api/news/latest",
    status: "active",
    lastCalled: "1 minute ago",
    responseTime: 320,
    successRate: 97.8,
    callCount: 2341,
  },
  {
    id: "5",
    name: "UFC Events",
    method: "GET",
    endpoint: "/api/ufc/events",
    status: "inactive",
    lastCalled: "2 hours ago",
    responseTime: 850,
    successRate: 94.1,
    callCount: 67,
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "inactive":
      return <Clock className="w-4 h-4 text-sl-mute" />
    case "error":
      return <XCircle className="w-4 h-4 text-red-400" />
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "text-green-400 bg-green-400/10 border-green-400/20"
    case "inactive":
      return "text-sl-mute bg-sl-mute/10 border-sl-outline/20"
    case "error":
      return "text-red-400 bg-red-400/10 border-red-400/20"
    default:
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
  }
}

function getMethodColor(method: string) {
  switch (method) {
    case "GET":
      return "text-green-400 bg-green-400/10"
    case "POST":
      return "text-blue-400 bg-blue-400/10"
    case "PUT":
      return "text-yellow-400 bg-yellow-400/10"
    case "DELETE":
      return "text-red-400 bg-red-400/10"
    default:
      return "text-sl-mute bg-sl-mute/10"
  }
}

export function ApiTable() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(mockEndpoints)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || endpoint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    // Simulate data refresh
    setEndpoints((prev) =>
      prev.map((endpoint) => ({
        ...endpoint,
        lastCalled: "Just now",
        responseTime: endpoint.responseTime + Math.floor(Math.random() * 20 - 10),
        callCount: endpoint.callCount + Math.floor(Math.random() * 5),
      })),
    )
  }

  const handleExport = () => {
    const csvContent = [
      ["Name", "Method", "Endpoint", "Status", "Response Time", "Success Rate", "Call Count"],
      ...filteredEndpoints.map((endpoint) => [
        endpoint.name,
        endpoint.method,
        endpoint.endpoint,
        endpoint.status,
        endpoint.responseTime.toString(),
        endpoint.successRate.toString(),
        endpoint.callCount.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "api-endpoints.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-sl-surface/50 border-sl-line">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>API Endpoints</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sl-mute w-4 h-4" />
            <Input
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-sl-raise border-sl-line"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive", "error"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "All" : status}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-sl-line overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-sl-line">
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Last Called</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.map((endpoint) => (
                <TableRow key={endpoint.id} className="border-sl-line">
                  <TableCell>
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-sl-mute font-mono">{endpoint.endpoint}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(endpoint.status)}>
                      {getStatusIcon(endpoint.status)}
                      <span className="ml-1 capitalize">{endpoint.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        endpoint.responseTime > 1000
                          ? "text-red-400"
                          : endpoint.responseTime > 500
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                    >
                      {endpoint.responseTime}ms
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        endpoint.successRate < 95
                          ? "text-red-400"
                          : endpoint.successRate < 98
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                    >
                      {endpoint.successRate}%
                    </span>
                  </TableCell>
                  <TableCell>{endpoint.callCount.toLocaleString()}</TableCell>
                  <TableCell className="text-sl-mute">{endpoint.lastCalled}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-sl-raise border-sl-line">
                        <DropdownMenuItem>Test Endpoint</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuItem>Configure</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">Disable</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-8 text-sl-mute">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No endpoints found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
