"use client"

import { motion } from "framer-motion"
import { useState, useEffect, type ReactNode } from "react"

interface MotionWrapperProps {
    children: ReactNode
    delay?: number
    className?: string
}

export function MotionWrapper({ children, delay = 0, className = "" }: MotionWrapperProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className={className}>{children}</div>
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
