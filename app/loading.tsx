import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Zap } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 text-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <Zap className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading Sports Data...</h2>
              <p className="text-gray-400">Getting the latest scores and updates</p>
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="mt-2">Fetching live data from multiple sources</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
