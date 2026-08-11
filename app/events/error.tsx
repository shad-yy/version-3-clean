"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Events] Error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-5xl">📅</div>
      <h2 className="text-2xl font-bold text-white">Fixtures temporarily unavailable</h2>
      <p className="text-gray-400 max-w-md">
        Data temporarily unavailable. This is usually a temporary issue — try refreshing or check back in a moment.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#00e676] text-black font-bold rounded-xl hover:bg-[#00ff87] transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-3 border border-border text-gray-300 rounded-xl hover:bg-surface transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
