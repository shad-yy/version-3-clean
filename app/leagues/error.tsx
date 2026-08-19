"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function LeaguesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Leagues] Error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-[var(--sl-amber)]" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-sl-text">League data unavailable</h2>
      <p className="text-sl-mute max-w-md">
        We couldn&apos;t load league information right now. Our data provider may be temporarily unavailable.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-6 py-3 bg-[var(--sl-amber)] text-black font-bold rounded-xl hover:bg-[var(--sl-amber-hover)] transition-colors">
          Try again
        </button>
        <Link href="/" className="px-6 py-3 border border-sl-line text-sl-mid rounded-xl hover:bg-surface transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
