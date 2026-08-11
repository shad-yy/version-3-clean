"use client"
import { motion, useInView } from "framer-motion"
import { useRef, Children } from "react"
import React from "react"

interface StaggerInProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerIn({ 
  children, className, staggerDelay = 0.1 
}: StaggerInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const items = Children.toArray(children)

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ 
            duration: 0.45, 
            delay: i * staggerDelay,
            ease: [0.21, 0.47, 0.32, 0.98]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
