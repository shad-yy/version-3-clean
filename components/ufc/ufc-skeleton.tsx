/**
 * Loading skeleton for the UFC index.
 *
 * Was app/ufc/loading.tsx. Moved here and mounted via Suspense inside app/ufc/page.tsx,
 * because a segment-level loading.tsx also wraps /ufc/events/[id] and /ufc/fighters/[id]
 * and made both answer 200 for ids that do not exist.
 */
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UFCSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-950 min-h-screen">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Tabs Skeleton */}
      <div className="w-full">
        <Skeleton className="h-12 w-full mb-8" />

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-800">
              <div className="w-full h-48 bg-gray-800 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
