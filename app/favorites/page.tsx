import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Favourites | Smart Live TV',
  robots: { index: false, follow: false },
}

export default function FavouritesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col 
      items-center justify-center px-4 pt-28 pb-20">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#00e676]/10 
          border border-[#00e676]/20 flex items-center 
          justify-center mx-auto mb-6 text-3xl">
          ♥
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">
          Favourites
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Save your favourite leagues and matches for quick access. 
          This feature is coming soon.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { name: 'Premier League', href: '/watch/premier-league' },
            { name: 'Champions League', href: '/watch/champions-league' },
            { name: 'World Cup 2026', href: '/watch/world-cup-2026' },
            { name: 'UFC', href: '/ufc' },
          ].map(l => (
            <Link key={l.name} href={l.href}
              className="bg-[#12121a] border border-[#2a2a3a] 
                hover:border-[#00e676]/30 rounded-xl p-3 text-sm 
                font-semibold text-gray-300 hover:text-white 
                transition-all text-center">
              {l.name}
            </Link>
          ))}
        </div>
        <Link href="/scores"
          className="inline-flex items-center gap-2 
            bg-[#00e676] text-black font-bold px-8 py-3.5 
            rounded-xl text-sm hover:bg-[#00ff87] transition-all">
          Browse Live Scores →
        </Link>
      </div>
    </div>
  )
}
