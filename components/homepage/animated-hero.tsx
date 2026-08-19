"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Tv, Zap } from "lucide-react"
import { motion, useAnimation } from "framer-motion"

export function AnimatedHero() {
  const [mounted, setMounted] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    setMounted(true)
    controls.start("visible")
  }, [controls])

  if (!mounted) {
    return (
      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        style={{
          minHeight: '400px',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white opacity-100 mb-6" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>Sightline</h1>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '400px',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-green-900/40" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl px-6 text-center">
        <motion.div
          initial="visible"
          animate={controls}
          variants={{
            hidden: { opacity: 1, y: 0 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 1, scale: 1 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white opacity-100" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>Your Ultimate Sports Hub</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white opacity-100 mb-6 leading-tight"
            style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}
          >
            Your Ultimate
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 animate-gradient" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>
              Sports Hub
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="text-xl md:text-2xl text-white opacity-100 mb-10 max-w-3xl mx-auto leading-relaxed"
            style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}
          >
            Live scores, match results, standings and news for all major leagues
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 1, y: 0 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <a
              href="/scores"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white opacity-100 font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '18px', opacity: 1, visibility: 'visible' }}
            >
              <Tv className="w-5 h-5" aria-hidden="true" />
              View Live Scores
            </a>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white opacity-100 font-semibold px-8 py-6 text-lg shadow-lg shadow-blue-500/50"
              style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}
            >
              <Link href="/scores" className="flex items-center gap-2">
                Explore Scores
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white opacity-100 hover:bg-white/10 px-8 py-6 text-lg bg-transparent backdrop-blur-sm"
              style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}
            >
              <Link href="/news" className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Latest News
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 1 },
              visible: { opacity: 1 },
            }}
            className="flex items-center justify-center gap-8 text-sm text-white opacity-100"
            style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white opacity-100" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>Today's Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-white opacity-100" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>Breaking News</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-white opacity-100" style={{ color: '#ffffff', opacity: 1, visibility: 'visible' }}>Live Updates</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
