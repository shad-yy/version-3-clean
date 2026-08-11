export default function ScoresLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-surface rounded mb-6" />
        {/* Sport filter tabs skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 bg-surface rounded-full" />
          ))}
        </div>
        {/* Match cards skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-full bg-[#1a1a2e]" />
                <div className="h-5 w-32 bg-[#1a1a2e] rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-7 w-14 bg-[#00e676]/10 rounded-lg" />
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-5 w-32 bg-[#1a1a2e] rounded" />
                <div className="h-8 w-8 rounded-full bg-[#1a1a2e]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
