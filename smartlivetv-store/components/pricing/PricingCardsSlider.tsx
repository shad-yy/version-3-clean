"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    id: "basic",
    label: "Basic",
    period: "1 Month",
    price: "£12",
    perMonth: null,
    badge: null,
    highlighted: false,
  },
  {
    id: "popular",
    label: "Popular",
    period: "3 Months",
    price: "£24",
    perMonth: "£8/mo",
    badge: "BEST VALUE",
    highlighted: true,
  },
  {
    id: "standard",
    label: "Standard",
    period: "6 Months",
    price: "£36",
    perMonth: "£6/mo",
    badge: null,
    highlighted: false,
  },
  {
    id: "premium",
    label: "Premium",
    period: "12 Months",
    price: "£54",
    perMonth: "£4.50/mo",
    badge: null,
    highlighted: false,
  },
]

const FEATURES = [
  "230,000+ Channels, Movies & Series",
  "Netflix, Disney+, Amazon Prime Included",
  "All Sky Sports Channels in 4K",
  "TNT Sports — Champions League Included",
  "UFC, F1, NBA, NFL — All Sports Live",
  "Anti-Buffer Technology",
]

interface PricingCardsSliderProps {
  /** Show all 15 features (pricing page). Default: false (6 features + link). */
  fullFeatures?: boolean
  showTrialCta?: boolean
}

export function PricingCardsSlider({
  fullFeatures = false,
  showTrialCta = true,
}: PricingCardsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(1) // default: Popular

  // Track which card is centred as user swipes
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / PLANS.length
    const idx = Math.round(el.scrollLeft / cardWidth)
    setActiveIndex(Math.min(Math.max(idx, 0), PLANS.length - 1))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Snap to "Popular" (index 1) on mount
    const cardWidth = el.scrollWidth / PLANS.length
    el.scrollLeft = cardWidth * 1
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [onScroll])

  const scrollTo = (idx: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / PLANS.length
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" })
    setActiveIndex(idx)
  }

  return (
    <div className="w-full">
      {/* ── MOBILE: snap-scroll slider ── */}
      <div className="lg:hidden">
        {/* Swipe hint */}
        <p className="text-center text-xs text-gray-500 mb-3 flex items-center justify-center gap-1.5">
          <span>←</span>
          <span>Swipe to compare plans</span>
          <span>→</span>
        </p>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto snap-x snap-mandatory",
            "pb-4 px-4",
            "hide-scrollbar",
          )}
          style={{ scrollPaddingLeft: "1rem" }}
        >
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              fullFeatures={fullFeatures}
              showTrialCta={showTrialCta}
              className={cn(
                // Each card = ~85vw so it peeks the next one
                "flex-none w-[85vw] max-w-[320px] snap-center",
              )}
            />
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {PLANS.map((plan, i) => (
            <button
              key={plan.id}
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${plan.label} plan`}
              className={cn(
                "rounded-full transition-all duration-200 touch-manipulation",
                activeIndex === i
                  ? "w-6 h-2 bg-[#00e676]"
                  : "w-2 h-2 bg-[#2a2a3a] hover:bg-gray-500",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: 4-column grid ── */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            fullFeatures={fullFeatures}
            showTrialCta={showTrialCta}
            className={plan.highlighted ? "scale-105 z-10" : ""}
          />
        ))}
      </div>
    </div>
  )
}

// ── Single plan card ────────────────────────────────────────────
interface PlanCardProps {
  plan: (typeof PLANS)[number]
  fullFeatures: boolean
  showTrialCta: boolean
  className?: string
}

function PlanCard({ plan, fullFeatures, showTrialCta, className }: PlanCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative rounded-2xl flex flex-col",
        "bg-[#12121a] border",
        plan.highlighted
          ? "border-2 border-[#00e676] shadow-[0_0_32px_rgba(0,230,118,0.15)]"
          : "border-[#2a2a3a] hover:border-[#00e676]/30",
        className,
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-[#00e676] text-black text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap shadow-lg">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Card header */}
      <div className="p-6 pb-4 border-b border-[#2a2a3a]/60">
        <p className={cn(
          "text-xs font-bold uppercase tracking-widest mb-3",
          plan.highlighted ? "text-[#00e676]" : "text-gray-400",
        )}>
          {plan.label}
        </p>

        <div className="flex items-end gap-2 mb-1">
          <span className="text-4xl font-extrabold text-white leading-none">
            {plan.price}
          </span>
          {plan.perMonth && (
            <span className="text-sm text-[#00e676] font-semibold mb-1">
              {plan.perMonth}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{plan.period}</p>
      </div>

      {/* Features */}
      <div className="flex-grow p-6 pt-4">
        <ul className="space-y-2.5">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00e676]/10 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#00e676]" />
              </div>
              <span className="text-xs text-gray-300 leading-snug">{f}</span>
            </li>
          ))}
          {!fullFeatures && (
            <li className="text-xs text-gray-500 pt-1">
              +{" "}
              <Link href="/pricing" className="text-[#00e676] hover:underline">
                9 more features →
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* CTAs */}
      <div className="p-6 pt-0 space-y-2">
        <Link
          href="/buy"
          className={cn(
            "block text-center w-full py-3.5 rounded-xl font-bold text-sm transition-all touch-manipulation",
            plan.highlighted
              ? "bg-[#00e676] text-black hover:bg-[#00ff87] shadow-[0_0_20px_rgba(0,230,118,0.3)]"
              : "border border-[#2a2a3a] text-white hover:border-[#00e676]/50 hover:bg-white/5",
          )}
        >
          Get Access Now →
        </Link>

        {showTrialCta && (
          <Link
            href="/free-trial"
            className="block text-center w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors touch-manipulation"
          >
            {plan.highlighted ? "Try Free First" : "or try free for 24h →"}
          </Link>
        )}
      </div>
    </motion.div>
  )
}
