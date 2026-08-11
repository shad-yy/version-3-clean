export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 animate-pulse">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="h-4 w-40 bg-surface rounded mb-8" />
        {/* Title */}
        <div className="h-9 w-72 bg-surface rounded mb-4" />
        <div className="h-5 w-48 bg-surface rounded mb-10" />
        {/* Blog card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl overflow-hidden">
              <div className="h-44 w-full bg-[#1a1a2e]" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-[#1a1a2e] rounded-full" />
                <div className="h-5 w-full bg-[#1a1a2e] rounded" />
                <div className="h-5 w-3/4 bg-[#1a1a2e] rounded" />
                <div className="h-4 w-full bg-[#1a1a2e] rounded" />
                <div className="h-4 w-2/3 bg-[#1a1a2e] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
