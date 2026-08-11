"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WhatsAppFloat() {
  // Hydration guard (.cursorrules §2): Framer Motion must not initialise until the
  // client has mounted, otherwise SSR and hydration disagree and React can throw
  // "Failed to execute 'removeChild' on 'Node'" in production (Trouble Registry Bug 5).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const waUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || null

  useEffect(() => {
    if (!waUrl) return
    // Show after 15 seconds or 40% scroll
    const timer = setTimeout(() => setShow(true), 15000)
    
    const handleScroll = () => {
      const scrollPct = window.scrollY / 
        (document.body.scrollHeight - window.innerHeight)
      if (scrollPct > 0.4) {
        setShow(true)
        clearTimeout(timer)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [waUrl])

  // Show tooltip after button appears
  useEffect(() => {
    if (!show || dismissed) return
    const t = setTimeout(() => setTooltipVisible(true), 1000)
    const t2 = setTimeout(() => setTooltipVisible(false), 5000)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [show, dismissed])

  if (!mounted || !waUrl || dismissed) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-40 flex flex-col items-end gap-2"
        >
          {/* Tooltip */}
          <AnimatePresence>
            {tooltipVisible && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-[#12121a] border border-[#2a2a3a] 
                  rounded-2xl px-4 py-3 shadow-xl mr-1 
                  max-w-[200px] text-right"
              >
                <p className="text-white text-xs font-bold mb-0.5">
                  Need help?
                </p>
                <p className="text-gray-400 text-xs">
                  We reply in under 5 minutes
                </p>
                <button
                  onClick={() => setTooltipVisible(false)}
                  className="absolute -top-2 -right-2 w-5 h-5 
                    bg-gray-700 rounded-full text-gray-400 
                    text-[10px] flex items-center justify-center"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-[#25D366] 
              flex items-center justify-center
              shadow-[0_4px_20px_rgba(37,211,102,0.4)]
              touch-manipulation"
            aria-label="Chat with us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>

            {/* Ping indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 
              bg-[#ff1744] rounded-full border-2 border-[#0a0a0f]" />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
