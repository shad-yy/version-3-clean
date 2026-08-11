"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type ConsentState = 'pending' | 'accepted' | 'declined'

const CONSENT_KEY = 'sltv_cookie_consent'
const CONSENT_VERSION = '1'

export function CookieBanner() {
  // Hydration guard (.cursorrules §2): Framer Motion must not initialise until the
  // client has mounted, otherwise SSR and hydration disagree and React can throw
  // "Failed to execute 'removeChild' on 'Node'" in production (Trouble Registry Bug 5).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [state, setState] = useState<ConsentState | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      const { version, choice } = JSON.parse(stored)
      if (version === CONSENT_VERSION) {
        setState(choice)
        return
      }
    }
    setState('pending')
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      choice: 'accepted',
      timestamp: new Date().toISOString()
    }))
    setState('accepted')
    // Enable GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      choice: 'declined',
      timestamp: new Date().toISOString()
    }))
    setState('declined')
    // Keep GA4 denied
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  if (!mounted || state !== 'pending') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6
          md:bottom-6 md:left-6 md:right-auto md:max-w-md"
      >
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl
          p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl flex-shrink-0">🍪</span>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                We use cookies
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                We use analytics cookies to understand how you use our site 
                and improve your experience. We never sell your data.
                {" "}
                <Link href="/privacy" 
                  className="text-[#00e676] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold
                border border-[#2a2a3a] hover:border-[#00e676]/40
                text-gray-400 hover:text-white transition-all
                touch-manipulation"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold
                bg-[#00e676] hover:bg-[#00ff87] text-black
                transition-all touch-manipulation"
            >
              Accept All
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
