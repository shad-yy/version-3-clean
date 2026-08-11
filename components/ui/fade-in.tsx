"use client"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
}

export function FadeIn({ 
  children, delay = 0, direction = 'up', className, once = true 
}: FadeInProps) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: "-50px" })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView 
        ? { opacity: 1 } 
        : { opacity: 0 }
      }
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      style={{ willChange: isInView ? 'auto' : 'opacity' }}
    >
      {children}
    </motion.div>
  )
}
