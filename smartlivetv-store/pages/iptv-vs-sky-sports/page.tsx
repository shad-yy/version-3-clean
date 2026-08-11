import type { Metadata } from 'next'
import Link from 'next/link'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { Check, X, Shield, Zap, Tv, Smartphone, RefreshCw, Star } from 'lucide-react'

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://smartlivetv-store.com'

export const metadata: Metadata = {
  title: 'Streaming vs Sky Sports UK (2026) — Live Sports Broadcast Guide',
  description: 'Compare traditional Sky Sports packages against unified global sports streaming directories. Honest feature and cost breakdown.',
  alternates: {
    canonical: `${ENV.BASE_URL}/iptv-vs-sky-sports`,
  },
  openGraph: {
    title: 'Streaming vs Sky Sports UK (2026) — Live Sports Broadcast Guide',
    description: 'Compare traditional Sky Sports packages against unified global sports streaming directories. Honest feature and cost breakdown.',
    url: `${ENV.BASE_URL}/iptv-vs-sky-sports`,
    siteName: 'Smart Live TV',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
  },
}

const COMPARISON_ROWS = [
  { feature: 'Monthly cost', sky: '£43/month', iptv: '£12/month', winner: 'iptv' },
  { feature: 'Annual cost', sky: '£516/year', iptv: '£144/year', winner: 'iptv' },
  { feature: 'Contract required', sky: 'Yes (18 months)', iptv: 'No contract', winner: 'iptv' },
  { feature: 'Sky Sports Premier League', sky: '✓', iptv: '✓ Included', winner: 'tie' },
  { feature: 'Sky Sports F1', sky: '✓', iptv: '✓ Included', winner: 'tie' },
  { feature: 'Sky Sports Cricket', sky: '✓', iptv: '✓ Included', winner: 'tie' },
  { feature: 'TNT Sports (Champions League)', sky: 'Extra £30.99/mo', iptv: '✓ Included', winner: 'iptv' },
  { feature: 'Netflix', sky: 'Extra £17.99/mo', iptv: '✓ Included', winner: 'iptv' },
  { feature: 'Disney+', sky: 'Extra £4.99/mo', iptv: '✓ Included', winner: 'iptv' },
  { feature: 'beIN Sports', sky: 'Not available', iptv: '✓ Included', winner: 'iptv' },
  { feature: 'UFC events (no PPV)', sky: 'Extra per event', iptv: '✓ Included', winner: 'iptv' },
  { feature: 'Streaming quality', sky: 'HD / 4K (some)', iptv: 'HD & 4K', winner: 'tie' },
  { feature: 'Works without a TV', sky: 'App required', iptv: 'Any device', winner: 'iptv' },
  { feature: 'Works without Sky broadband', sky: 'Limited', iptv: '✓ Any broadband', winner: 'iptv' },
  { feature: 'Catch-up TV', sky: 'Sky Go app only', iptv: '7-day replay', winner: 'tie' },
  { feature: '4K quality', sky: 'Some channels', iptv: 'Full 4K available', winner: 'tie' },
  { feature: 'Cancel anytime', sky: 'After contract', iptv: '✓ Anytime', winner: 'iptv' },
  { feature: 'Setup time', sky: 'Engineer visit', iptv: '5 minutes', winner: 'iptv' },
  { feature: '7-day money back', sky: 'No', iptv: '✓ Yes', winner: 'iptv' },
  { feature: 'Free trial', sky: 'No', iptv: '✓ 24H no card', winner: 'iptv' },
]

const faqs = [
  {
    q: "How does global streaming compare to traditional Sky Sports packages?",
    a: "Traditional satellite subscriptions limit viewers to region-restricted feeds. Modern unified streaming passes aggregate official global matchday feeds (including UK and international broadcasts) into one responsive dashboard."
  },
  {
    q: "Do I need Sky broadband to access global sports feeds?",
    a: "No. Unified streaming platforms work with any UK or international internet service provider (BT, Virgin Media, Sky, EE, Vodafone, etc.)."
  },
  {
    q: "What is the most cost-effective way to follow live sports?",
    a: "While stacking Sky Sports (£43/mo), TNT Sports (£30.99/mo), and sports channels exceeds £90+/month, unified digital passes start from £12/month via partner platforms like smartlivetv-store.com."
  }
]

export default function IptvVsSkySportsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/iptv-vs-sky-sports#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Streaming vs Sky Sports', item: `${ENV.BASE_URL}/iptv-vs-sky-sports` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 pb-20">
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      {/* 1. HERO SECTION */}
      <section className="pt-28 md:pt-36 pb-16 px-4 text-center border-b border-[#2a2a3a]"
        style={{ background: 'linear-gradient(to bottom, #0d0d14, #0a0a0f)' }}>
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            2026 Sports Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Traditional Cable vs Global Streaming<br/>
            <span className="text-[#00e676]">
              2026 Sports Broadcast Analysis
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Compare monthly costs, channel availability, and device support across UK legacy satellite providers and global digital passes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={`${STORE_URL}/buy`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00e676] text-black font-extrabold px-8 py-4 rounded-xl hover:bg-[#00ff87] transition-all text-base shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              Get Store Pass — smartlivetv-store.com →
            </a>
            <a href={`${STORE_URL}/free-trial`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#2a2a3a] text-gray-300 font-bold px-8 py-4 rounded-xl text-base hover:border-[#00e676]/30 transition-all">
              Test 24H Trial Pass
            </a>
          </div>
        </div>
      </section>

      {/* 2. QUICK ANSWER SUMMARY BAR */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a] py-6">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-red-400">
              £43/mo
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Sky Sports alone
            </p>
          </div>
          <div className="border-x border-[#2a2a3a]">
            <p className="text-2xl md:text-3xl font-extrabold text-[#00e676]">
              £12/mo
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Smart Live TV (everything)
            </p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-[#00e676]">
              £372/yr
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Annual saving
            </p>
          </div>
        </div>
      </div>

      {/* 3. FULL COMPARISON TABLE SECTION */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Honest side-by-side comparison</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how the traditional subscription stack compares directly against a unified IPTV streaming service.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#2a2a3a] bg-[#12121a]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0d0d14]">
                <th className="p-4 md:p-5 text-sm md:text-base font-extrabold text-white">Feature / Channel</th>
                <th className="p-4 md:p-5 text-sm md:text-base font-extrabold text-white text-center">Sky Sports UK</th>
                <th className="p-4 md:p-5 text-sm md:text-base font-extrabold text-[#00e676] text-center">Smart Live TV (IPTV)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, index) => (
                <tr key={index} className="border-b border-[#1c1c28]/40 hover:bg-[#161622]/30 transition-colors">
                  <td className="p-4 md:p-5 text-sm md:text-base font-semibold text-gray-300">{row.feature}</td>
                  <td className={`p-4 md:p-5 text-sm md:text-base text-center transition-colors ${
                    row.winner === 'sky' ? 'bg-red-500/10 text-red-400 font-bold' : 'text-gray-400'
                  }`}>
                    {row.sky}
                  </td>
                  <td className={`p-4 md:p-5 text-sm md:text-base text-center transition-colors ${
                    row.winner === 'iptv' ? 'bg-[#00e676]/10 text-[#00e676] font-bold' : 'text-gray-200'
                  }`}>
                    {row.iptv}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. WHY SKY SPORTS IS GETTING HARDER TO JUSTIFY SECTION */}
      <section className="py-16 px-4 bg-[#12121a]/50 border-y border-[#2a2a3a]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">The Rising Cost of TV</span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-4">
                Sky Sports is getting harder to justify in 2026
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Sky has raised prices three times since 2024. A standalone Sky Sports subscription now costs £43/month. But that only covers a fraction of actual live sports.
              </p>
              <p className="text-gray-400 leading-relaxed">
                If you also want to watch European football (Champions League), enjoy Netflix movies, or watch Disney+ with family, you are forced into stacking subscriptions.
              </p>
            </div>
            <div className="bg-[#0d0d14] border border-[#2a2a3a] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-[#2a2a3a] pb-3">The £97 Subscription Stack</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between">
                  <span>Sky Sports (Premier League & F1)</span>
                  <span className="font-semibold text-red-400">£43.00/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>TNT Sports (UCL & Serie A)</span>
                  <span className="font-semibold text-red-400">£30.99/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Netflix Standard (no ads)</span>
                  <span className="font-semibold text-red-400">£17.99/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Disney+ Pack</span>
                  <span className="font-semibold text-red-400">£4.99/mo</span>
                </li>
                <li className="flex justify-between border-t border-[#2a2a3a] pt-3 font-bold text-white text-base">
                  <span>Total Monthly Cost</span>
                  <span>£96.98/mo</span>
                </li>
              </ul>
              <div className="mt-5 bg-[#00e676]/10 border border-[#00e676]/20 rounded-xl p-3 text-center">
                <p className="text-xs text-[#00e676] font-bold">
                  Replaced by Smart Live TV for just £12/month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT SMART LIVE TV INCLUDES THAT SKY DOESN'T */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">What Smart Live TV includes that Sky doesn't</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get complete freedom and access to all global entertainment without limits or geographical blockades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Netflix & Disney+ Included",
              desc: "Access complete library of streaming platforms. Watch movies, series, and documentaries directly on your streaming app.",
              icon: Tv
            },
            {
              title: "Global Sports Channels",
              desc: "beIN Sports 1-7, USA ESPN, Supersports, and sports networks from 50+ countries. Never miss a single game or broadcast.",
              icon: Star
            },
            {
              title: "No Blockout Restrictions",
              desc: "Watch 3:00 PM UK blackout matches live. No geoblocks or streaming limits whatsoever.",
              icon: Shield
            },
            {
              title: "No Contract or Hide Fees",
              desc: "Pay monthly and cancel whenever you want. We have zero cancelation fees or contract terms.",
              icon: RefreshCw
            },
            {
              title: "5-Minute Instant Setup",
              desc: "Start watching immediately on Firestick, Smart TV, Android, iPhone, Apple TV, or PC. No engineers needed.",
              icon: Zap
            },
            {
              title: "Multi-Device Coverage",
              desc: "Take your streaming package with you. Perfect for watching on mobile devices or tablets on the go.",
              icon: Smartphone
            }
          ].map((card, i) => (
            <div key={i} className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 hover:border-[#00e676]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center mb-4 group-hover:bg-[#00e676] group-hover:text-black transition-all text-[#00e676]">
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 px-4 bg-[#12121a]/30 border-t border-[#2a2a3a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-20 px-4 text-center border-t border-[#2a2a3a]"
        style={{ background: 'linear-gradient(to top, #0d0d14, #0a0a0f)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to stop overpaying for Sky?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Get instant access to every Sky Sports channel, TNT Sports, Netflix, Disney+, and 230,000+ live streams.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/buy"
              className="bg-[#00e676] text-black font-extrabold px-8 py-4 rounded-xl hover:bg-[#00ff87] transition-all text-base shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              Switch from Sky — £12/mo →
            </Link>
            <Link href="/free-trial"
              className="border border-[#2a2a3a] text-gray-300 font-bold px-8 py-4 rounded-xl text-base hover:border-[#00e676]/30 transition-all">
              Start 24H Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
