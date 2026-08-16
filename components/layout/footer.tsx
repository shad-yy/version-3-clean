"use client"

import Link from "next/link"
import { memo } from "react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { motion } from "framer-motion"

const footerLinks = [
  {
    title: "Watch Live",
    links: [
      { name: "Premier League", href: "/watch/premier-league" },
      { name: "Champions League", href: "/watch/champions-league" },
      { name: "Europa League", href: "/watch/europa-league" },
      { name: "La Liga", href: "/watch/la-liga" },
      { name: "Serie A", href: "/watch/serie-a" },
      { name: "Bundesliga", href: "/watch/bundesliga" },
      { name: "Ligue 1", href: "/watch/ligue-1" },
      { name: "World Cup 2026", href: "/watch/world-cup-2026" },
      { name: "Formula 1", href: "/watch/formula-1" },
      { name: "UFC / MMA", href: "/ufc" },
    ],
  },
  {
    title: "Broadcast Guides",
    links: [
      // Named by competition, not by one country's broadcaster. These links appear on
      // every page, so a UK broadcaster label framed the whole site as UK-only.
      { name: "Premier League", href: "/watch/premier-league" },
      { name: "Champions League", href: "/watch/champions-league" },
      { name: "DAZN & Global Channels", href: "/watch/la-liga" },
    ],
  },
  {
    title: "Sports Hub",
    links: [
      { name: "Live Scores", href: "/scores" },
      { name: "League Tables", href: "/leagues" },
      { name: "Sports News", href: "/news" },
      { name: "UFC / MMA", href: "/ufc" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
]

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-500 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-10 mb-12">
          <div className="space-y-6 col-span-2 sm:col-span-3 md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Smart Live TV"
                width={180}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-text-secondary leading-relaxed max-w-sm">
              Real-time live sports scores, match schedules, league standings, and global TV broadcast guides for all major sporting events.
            </p>
            <div className="flex space-x-4">
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-text-primary mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-text-muted">
          <p>&copy; {currentYear} SmartLiveTV. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-text-primary transition-colors">Sitemap</Link>
            <Link href="/llms.txt" className="hover:text-text-primary transition-colors">LLM Map</Link>
          </div>
        </div>
      </div>
    </footer>
  )
})
