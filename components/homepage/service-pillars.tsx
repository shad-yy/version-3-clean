"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Tv, Newspaper, BarChart3, ArrowRight } from "lucide-react"

const pillars = [
  {
    icon: Tv,
    title: "Broadcast Schedules",
    subtitle: "Official TV Directories",
    description: "Matchday timetables, kickoff times, and official broadcast channel listings for all major leagues.",
    cta: "View Broadcast Guides",
    href: "/news",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    subtitleColor: "text-emerald-400/80",
    borderHover: "hover:border-emerald-500/40",
    glowColor: "group-hover:shadow-emerald-500/10",
    accentRing: "group-hover:ring-emerald-500/20",
  },
  {
    icon: Newspaper,
    title: "Live Scores & News",
    subtitle: "Real-time updates",
    description: "Live match scores, breaking sports news, and results — updated every 60 seconds.",
    cta: "See Live Scores",
    href: "/scores",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
    subtitleColor: "text-blue-400/80",
    borderHover: "hover:border-blue-500/40",
    glowColor: "group-hover:shadow-blue-500/10",
    accentRing: "group-hover:ring-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "Stats & Data",
    subtitle: "Leagues, teams & players",
    description: "League tables, team profiles, player stats — your complete sports data hub.",
    cta: "Explore Stats",
    href: "/leagues",
    gradient: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
    subtitleColor: "text-purple-400/80",
    borderHover: "hover:border-purple-500/40",
    glowColor: "group-hover:shadow-purple-500/10",
    accentRing: "group-hover:ring-purple-500/20",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

export function ServicePillars() {
  return (
    <section className="relative py-6 md:py-8 bg-[var(--sl-ground)] border-t border-[var(--sl-raise)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--sl-ground)] via-[var(--sl-ground)] to-[var(--sl-ground)] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        {/* Section label */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sl-mute">
            Everything in One Place
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <motion.div key={pillar.title} variants={cardVariants}>
                <Link
                  href={pillar.href}
                  className={`group relative flex flex-col items-center text-center p-6 rounded-xl 
                    border border-[var(--sl-raise)] bg-[var(--sl-surface)]/80 backdrop-blur-sm 
                    transition-all duration-300 
                    ${pillar.borderHover} 
                    hover:-translate-y-1 hover:shadow-xl ${pillar.glowColor}
                    ring-1 ring-transparent ${pillar.accentRing}`}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-xl bg-[var(--sl-raise)] border border-[var(--sl-line)] flex items-center justify-center mb-4 group-hover:border-opacity-50 group-hover:scale-110 transition-all duration-300 ${pillar.iconColor}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-sl-text font-bold text-lg mb-1">
                      {pillar.title}
                    </h3>
                    <p className={`text-sm font-semibold ${pillar.subtitleColor} mb-2`}>
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-sl-mute leading-relaxed mb-4">
                      {pillar.description}
                    </p>

                    {/* CTA */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sl-mute group-hover:text-sl-text transition-colors">
                      {pillar.cta}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
