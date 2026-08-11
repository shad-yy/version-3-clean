"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RefreshCw, Home, AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl bg-gray-900/50 border-gray-800 text-center">
        <CardHeader>
          <div className="w-20 h-20 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center border-2 border-orange-500/20 mb-4">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-orange-400">Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-300 mb-8">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8 text-left">
              <h3 className="text-red-400 font-semibold mb-2">Error Details (Development Only):</h3>
              <pre className="text-xs text-red-300 overflow-auto">{error.message}</pre>
              {error.digest && <p className="text-xs text-red-400 mt-2">Error ID: {error.digest}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
