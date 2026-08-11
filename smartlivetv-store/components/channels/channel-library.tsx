'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { CHANNELS, REGIONS, CATEGORIES } from './channelData'

import Link from 'next/link'

export default function ChannelLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>()
  
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('UK')
  const [displayedCount, setDisplayedCount] = useState(48)

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 150)
  }, [])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const filteredChannels = useMemo(() => {
    return CHANNELS.filter(channel => {
      const matchesSearch = debouncedSearch === '' || channel.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory
      const matchesRegion = selectedRegion === 'All regions' || channel.region === selectedRegion
      return matchesSearch && matchesCategory && matchesRegion
    })
  }, [debouncedSearch, selectedCategory, selectedRegion])

  const visibleChannels = useMemo(() => {
    if (debouncedSearch.trim() !== '') {
      return filteredChannels.slice(0, 100)
    }
    return filteredChannels.slice(0, displayedCount)
  }, [filteredChannels, debouncedSearch, displayedCount])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getAvatarColor = (category: string) => {
    switch (category) {
      case 'Football': return 'bg-blue-600'
      case 'UFC / MMA': return 'bg-red-600'
      case 'Basketball': return 'bg-orange-500'
      case 'Tennis': return 'bg-green-600'
      case 'Cricket': return 'bg-teal-600'
      case 'Boxing': return 'bg-cyan-600'
      case 'Motorsport': return 'bg-purple-600'
      case 'Entertainment': return 'bg-pink-600'
      case 'News': return 'bg-gray-600'
      case 'Sport': return 'bg-blue-600'
      case 'Movies': return 'bg-indigo-600'
      case 'Kids': return 'bg-yellow-600'
      case 'Documentary': return 'bg-emerald-600'
      case 'Music': return 'bg-fuchsia-600'
      case 'Radio': return 'bg-stone-600'
      default: return 'bg-indigo-600'
    }
  }

  const handleShowMore = () => {
    setDisplayedCount(prev => prev + 48)
  }

  const showMoreButtonVisible = debouncedSearch.trim() === '' && displayedCount < filteredChannels.length

  return (
    <section className="bg-[#0a0a0f] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* FILTER BAR  */}
        <div className="sticky top-[56px] md:top-[64px] z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-[#2a2a3a] py-3 mb-8 flex flex-col gap-3 justify-between items-start">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2 text-white w-full sm:max-w-xs focus:outline-none focus:border-[#00e676]/50 transition-colors"
            />
            <select
              value={selectedRegion}
              onChange={(e) => { setSelectedRegion(e.target.value); setDisplayedCount(48); }}
              className="bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-2 text-white w-full sm:w-auto focus:outline-none focus:border-[#00e676]/50 transition-colors"
            >
              <option value="All regions">All regions</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setDisplayedCount(48); }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#00e676] text-black font-bold'
                    : 'bg-[#12121a] border border-[#2a2a3a] text-gray-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* CHANNEL GRID  */}
        {visibleChannels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleChannels.map((channel, idx) => (
                <div 
                  key={`${channel.name}-${idx}`}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 150px' }}
                  className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#00e676]/40 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white text-sm ${getAvatarColor(channel.category)}`}>
                      {getInitials(channel.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{channel.name}</h3>
                      <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        <span>{channel.category}</span>
                        <span>•</span>
                        <span>{channel.region}</span>
                        <span>•</span>
                        <span className="text-white/70">{channel.quality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between mt-auto pt-4">
                    <span className="text-xs font-bold text-[#00e676] bg-[#00e676]/10 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]"></span>
                      INCLUDED
                    </span>
                    
                    <Link
                      href="/buy"
                      className="text-xs font-bold text-black bg-[#00e676] px-3 py-1.5 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Watch →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {debouncedSearch.trim() !== '' && filteredChannels.length > 100 && (
              <div className="mt-8 text-center text-gray-400">
                Showing top 100 results. Please refine your search to see more.
              </div>
            )}

            {showMoreButtonVisible && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleShowMore}
                  className="px-8 py-3 bg-[#12121a] border border-[#2a2a3a] hover:border-[#00e676] rounded-xl text-white font-bold transition-all"
                >
                  Show More Channels ({filteredChannels.length - displayedCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-[#2a2a3a] px-4">
            <h3 className="text-xl font-bold text-white mb-2">No channels match your filters.</h3>
            <p className="text-gray-400">All 230,000+ channels are available in your subscription.</p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setDebouncedSearch('')
                setSelectedCategory('All')
                setSelectedRegion('All regions')
                setDisplayedCount(48)
              }}
              className="mt-6 text-[#00e676] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
