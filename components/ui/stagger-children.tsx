"use client"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, Children } from "react"

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  childClassName?: string
}

export function StaggerChildren({
  children, className, staggerDelay = 0.1, childClassName
}: StaggerChildrenProps) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  const childArray = Children.toArray(children)

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, i) => (
        <motion.div
          key={i}
          className={childClassName}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.45,
            delay: i * staggerDelay,
            ease: [0.21, 0.47, 0.32, 0.98]
          }}
          style={{ willChange: isInView ? 'auto' : 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
