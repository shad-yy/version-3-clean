"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ShimmerButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  variant?: 'primary' | 'whatsapp' | 'ghost' | 'league'
  leagueColor?: string
}

export function ShimmerButton({ 
  href, children, className, external, variant = 'primary', leagueColor 
}: ShimmerButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-[var(--sl-amber)] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)]",
    whatsapp: "bg-[#25D366] text-black shadow-[0_0_20px_rgba(37,211,102,0.2)]",
    ghost: "border border-[var(--sl-line)] hover:border-[var(--sl-amber)] text-sl-text",
    league: "text-black",
  }

  const leagueStyle = variant === 'league' && leagueColor
    ? { backgroundColor: leagueColor, boxShadow: `0 0 20px ${leagueColor}44` }
    : undefined

  const content = (
    <motion.span
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "px-8 py-4 rounded-xl font-bold text-sm overflow-hidden",
        "transition-all duration-300",
        variants[variant],
        className
      )}
      style={leagueStyle}
      whileHover={{ scale: 1.03, y: -2, willChange: 'transform' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Shimmer overlay — primary only */}
      {variant === 'primary' && (
        <motion.span
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "linear" 
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.span>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  return <Link href={href}>{content}</Link>
}
