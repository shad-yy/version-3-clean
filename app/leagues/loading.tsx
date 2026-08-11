export default function LeaguesLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-40 bg-surface rounded mb-2" />
        <div className="h-4 w-64 bg-surface rounded mb-8" />
        {/* League grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#1a1a2e]" />
              <div className="h-4 w-20 bg-[#1a1a2e] rounded" />
              <div className="h-3 w-14 bg-[#1a1a2e] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
