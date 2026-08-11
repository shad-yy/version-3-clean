"use client"
import { useState } from "react"
import { Wifi, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"

type Quality = 'excellent' | 'good' | 'fair' | 'poor'

interface SpeedResult {
  mbps: number
  quality: Quality
  message: string
  color: string
  isEstimate: boolean
}

function classify(mbps: number, isEstimate: boolean): SpeedResult {
  const estimateNote = isEstimate
    ? ' (estimated by your browser)'
    : ''

  if (mbps >= 50) return {
    mbps, quality: 'excellent', isEstimate,
    message: `${mbps} Mbps — Excellent for 4K on multiple screens${estimateNote}`,
    color: '#00e676',
  }
  if (mbps >= 25) return {
    mbps, quality: 'good', isEstimate,
    message: `${mbps} Mbps — Perfect for 4K streaming${estimateNote}`,
    color: '#00e676',
  }
  if (mbps >= 10) return {
    mbps, quality: 'fair', isEstimate,
    message: `${mbps} Mbps — Good for HD streaming${estimateNote}`,
    color: '#f59e0b',
  }
  return {
    mbps, quality: 'poor', isEstimate,
    message: `${mbps} Mbps — May buffer on HD. Wired connection recommended.${estimateNote}`,
    color: '#ff1744',
  }
}

export function SpeedChecker() {
  const [status, setStatus] = useState<
    'idle' | 'testing' | 'done' | 'error'
  >('idle')
  const [result, setResult] = useState<SpeedResult | null>(null)
  const [progress, setProgress] = useState(0)

  const runTest = async () => {
    setStatus('testing')
    setResult(null)
    setProgress(0)

    // Animate progress bar independently of real measurement
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 90))
    }, 100)

    try {
      // Proceed directly to real download measurement since navigator.connection returns instant estimates rather than real performance.

      // Method 2: Download timing with own API endpoint
      // This measures real throughput but is affected by CDN
      const testStart = performance.now()
      let bytesReceived = 0

      // Download 3 chunks to get a stable average
      for (let i = 0; i < 3; i++) {
        const res = await fetch(
          `/api/speed-test?chunk=${i}&t=${Date.now()}`,
          { cache: 'no-store' }
        )
        const buf = await res.arrayBuffer()
        bytesReceived += buf.byteLength
        setProgress(30 + (i + 1) * 20)
      }

      const testEnd = performance.now()
      const durationSeconds = (testEnd - testStart) / 1000
      const bitsReceived = bytesReceived * 8
      const mbps = Math.round(
        (bitsReceived / durationSeconds) / 1_000_000
      )

      clearInterval(progressInterval)
      setProgress(100)

      if (mbps > 0 && mbps < 2000) {
        setResult(classify(mbps, false))
      } else {
        // Fallback — invalid result
        throw new Error('Invalid measurement')
      }
      setStatus('done')

    } catch {
      clearInterval(progressInterval)
      setProgress(100)
      // Graceful fallback — do not show wrong data
      setStatus('error')
    }
  }

  const inputBase = `w-full bg-[#00e676] text-black font-bold
    py-3 rounded-xl text-sm hover:bg-[#00ff87]
    transition-all touch-manipulation`

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a]
      rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#00e676]/10
          border border-[#00e676]/20 flex items-center
          justify-center flex-shrink-0">
          <Wifi className="w-5 h-5 text-[#00e676]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">
            Check your connection
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            HD needs 10 Mbps · 4K needs 25 Mbps
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button onClick={runTest} className={inputBase}>
          Test My Speed →
        </button>
      )}

      {status === 'testing' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm
            text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin
              text-[#00e676]" />
            <span>Measuring your connection...</span>
          </div>
          <div className="h-2 bg-[#2a2a3a] rounded-full
            overflow-hidden">
            <div
              className="h-full bg-[#00e676] rounded-full
                transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            This takes a few seconds for accuracy
          </p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="space-y-4">
          <div className="bg-[#0a0a0f] rounded-xl p-4">
            <div className="flex items-center
              justify-between mb-2">
              <span className="text-xs text-gray-500">
                Your speed{result.isEstimate
                  ? ' (browser estimate)'
                  : ''}
              </span>
              <span className="font-extrabold text-2xl"
                style={{ color: result.color }}>
                {result.mbps} Mbps
              </span>
            </div>
            <div className="h-2 bg-[#2a2a3a] rounded-full
              overflow-hidden">
              <div className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    (result.mbps / 100) * 100, 100
                  )}%`,
                  backgroundColor: result.color,
                }}
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            {result.quality === 'poor'
              ? <AlertTriangle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: result.color }} />
              : <CheckCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: result.color }} />
            }
            <p className="text-sm leading-relaxed"
              style={{ color: result.color }}>
              {result.message}
            </p>
          </div>

          {result.quality !== 'poor' && (
            <Link href="/buy" className={inputBase +
              " block text-center"}>
              Your Connection Is Ready — Get Access →
            </Link>
          )}

          {result.isEstimate && (
            <p className="text-[10px] text-gray-600
              text-center">
              Browser estimates vary. For an accurate test,
              use{' '}
              <a href="https://fast.com" target="_blank"
                rel="noopener noreferrer"
                className="text-[#00e676] underline">
                fast.com
              </a>
            </p>
          )}

          <button onClick={runTest}
            className="w-full text-center text-xs
              text-gray-600 hover:text-gray-400
              py-1 transition-colors">
            Test again
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Unable to measure automatically.
            UK average broadband is 79 Mbps — most UK
            connections easily support 4K streaming.
          </p>
          <a href="https://fast.com" target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center
              border border-[#2a2a3a] text-gray-300
              font-bold py-2.5 rounded-xl text-sm
              hover:border-[#00e676]/30 transition-all">
            Test with fast.com →
          </a>
          <Link href="/buy" className={inputBase +
            " block text-center"}>
            Get Access Now →
          </Link>
        </div>
      )}
    </div>
  )
}
