import { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import ChannelLibrary from '@/components/channels/channel-library'

export const metadata: Metadata = {
  title: 'Netflix, Sky Sports & 230,000+ Channels | Smart Live TV',
  description: 'Browse our full channel library. Netflix, Disney+, Amazon Prime, Sky Sports, TNT Sports and 230,000+ channels all included from £12/month.',
  alternates: { canonical: `${ENV.BASE_URL}/channels` },
  openGraph: {
    title: 'Netflix, Sky Sports & 230,000+ Channels | Smart Live TV',
    description: 'Browse our full channel library. Netflix, Disney+, Amazon Prime, Sky Sports, TNT Sports and 230,000+ channels all included from £12/month.',
    images: ['/og-default.png'],
  },
}

const TOP_10_CHANNELS = [
  { name: "Sky Sports Premier League", description: "Live Premier League coverage, highlights and analysis." },
  { name: "Sky Sports Football", description: "24/7 football news, matches and exclusive coverage." },
  { name: "BT Sport 1", description: "Champions League, Europa League and top football." },
  { name: "BT Sport 2", description: "More live football including Bundesliga." },
  { name: "La Liga TV", description: "Dedicated Spanish football channel." },
  { name: "Serie A Pass", description: "Every Serie A match live from Italy." },
  { name: "Bundesliga Live", description: "German Bundesliga matches and highlights." },
  { name: "beIN Sports", description: "Ligue 1, international football and more." },
  { name: "ESPN FC", description: "Football news, analysis and live matches." },
  { name: "TNT Sports", description: "Champions League and top European football." },
]

export default function ChannelsPage() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || '/contact'

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Smart Live TV Channel List",
    "description": "Complete list of 230,000+ channels available with Smart Live TV IPTV subscription",
    "numberOfItems": 230000,
    "itemListElement": TOP_10_CHANNELS.map((ch, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": ch.name,
      "description": ch.description
    }))
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${ENV.BASE_URL}/channels#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Channel List', item: `${ENV.BASE_URL}/channels` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#00e676] selection:text-black">
        <section className="bg-[#0a0a0f] pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center">
              <span className="bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 px-4 py-1.5 rounded-full text-sm font-bold">
                230,000+ Channels Included
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Every Channel, Every Streaming Service. <br className="hidden sm:block" />
              One Subscription.
            </h1>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
              Netflix, Disney+, Amazon Prime, Hulu, Shahid and 230,000+ live channels, movies and series — all included from £12/month. Browse a sample of what&apos;s available below.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/free-trial"
                className="w-full md:w-auto bg-[#00e676] hover:bg-[#00ff87] text-black font-bold px-8 py-4 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] text-center flex items-center justify-center whitespace-nowrap"
              >
                Get My Free 24H Trial →
              </Link>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-[#25D366] hover:brightness-110 text-black font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                💬 Ask on WhatsApp
              </a>
              
              <a
                href="/pricing"
                className="w-full md:w-auto border border-[#2a2a3a] hover:border-[#00e676] text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-base transition-all text-center flex items-center justify-center whitespace-nowrap"
              >
                View Pricing Plans
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
              <span className="text-sm text-gray-500 font-medium">✓ No contract</span>
              <span className="text-sm text-gray-500 font-medium">✓ 4K streaming</span>
              <span className="text-sm text-gray-500 font-medium">✓ All devices</span>
              <span className="text-sm text-gray-500 font-medium">✓ Cancel anytime</span>
            </div>
          </div>
        </section>

        <ChannelLibrary />
      </div>
    </>
  )
}
