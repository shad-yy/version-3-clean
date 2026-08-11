import Link from "next/link"
import { Server, Zap, Clock, Globe, Tv, Trophy, Smartphone, PiggyBank } from "lucide-react"

import { StaggerChildren } from "@/components/ui/stagger-children"

const features = [
    {
        title: "Replaces Every Streaming Service",
        description: "Netflix, Disney+, Amazon Prime, Hulu, Apple TV+, Paramount+, Shahid — all included. Cancel every other subscription.",
        icon: Tv,
        gradient: "from-blue-500 to-cyan-500",
        glow: "group-hover:shadow-blue-500/20",
    },
    {
        title: "All Live Sports Included",
        description: "Sky Sports, TNT Sports, beIN Sports, Premier Sports, Eurosport — every Premier League, Champions League, UFC, and F1 match live in 4K.",
        icon: Trophy,
        gradient: "from-emerald-500 to-green-500",
        glow: "group-hover:shadow-emerald-500/20",
    },
    {
        title: "Works on Every Device",
        description: "Firestick, Smart TV, Android, iPhone, iPad, PC and Mac. Watch on up to 2 screens simultaneously.",
        icon: Smartphone,
        gradient: "from-purple-500 to-pink-500",
        glow: "group-hover:shadow-purple-500/20",
    },
    {
        title: "Save £100+ Every Month",
        description: "Sky Sports alone costs £43/month. Netflix is £18. Disney+ is £5. We include everything from £12/month total.",
        icon: PiggyBank,
        gradient: "from-amber-500 to-orange-500",
        glow: "group-hover:shadow-amber-500/20",
    },
]

export function WhyIPTV() {
    return (
        <section className="py-24 md:py-32 bg-[#070710] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00e676]/3 rounded-full blur-[200px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 bg-[#00e676]/10 border border-[#00e676]/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#00e676] mb-6">
                        <Zap className="w-3.5 h-3.5" />
                        Why Smart Live TV
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
                        Cancel Every Subscription
                        <br />
                        <span className="bg-gradient-to-r from-[#00e676] to-[#00b0ff] bg-clip-text text-transparent">You Have</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Sky Sports, Netflix, Disney+, Amazon Prime, Shahid — all replaced by one subscription at a fraction of the cost.
                    </p>
                </div>

                {/* Feature Cards */}
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.12}>
                    {features.map((feature, i) => {
                        const Icon = feature.icon
                        return (
                            <div key={i} className={`group relative bg-[#0c0c14] p-7 rounded-2xl border border-[#1a1a2a] hover:border-[#2a2a3a] transition-all duration-500 flex flex-col items-start gap-5 hover:-translate-y-1 ${feature.glow} hover:shadow-xl`}>
                                {/* Icon with gradient background */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] transition-transform duration-500 group-hover:scale-110`}>
                                    <div className="w-full h-full rounded-xl bg-[#0c0c14] flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white leading-snug">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </StaggerChildren>

                {/* Stats Row */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
                     {[
                         { 
                             value: "£372", 
                             label: "Average annual saving vs Sky Sports",
                             sub: "Based on Sky's 2026 pricing"
                         },
                         { 
                             value: "5 min", 
                             label: "Average setup time",
                             sub: "Firestick, Smart TV, Android, iPhone"
                         },
                         { 
                             value: "230K+", 
                             label: "Live channels included",
                             sub: "Every plan, no extras"
                         },
                         { 
                             value: "99.9%", 
                             label: "Service uptime target",
                             sub: "Anti-buffer technology"
                         },
                     ].map(stat => (
                         <div key={stat.value} 
                             className="relative bg-[#0c0c14] border border-[#1a1a2a] rounded-2xl p-3.5 sm:p-5 text-center overflow-hidden group hover:border-[#00e676]/20 transition-all duration-300">
                             <div className="absolute inset-0 bg-gradient-to-br from-[#00e676]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                             <div className="relative z-10">
                                 <div className="text-2xl font-extrabold text-[#00e676] mb-1">
                                     {stat.value}
                                 </div>
                                 <div className="text-white font-bold text-[10px] sm:text-xs mb-1 leading-tight">
                                     {stat.label}
                                 </div>
                                 <div className="text-gray-600 text-[9px] sm:text-[10px] leading-tight">{stat.sub}</div>
                             </div>
                         </div>
                     ))}
                 </div>
 
                 {/* CTA */}
                 <div className="mt-16 text-center px-4">
                     <Link
                         href="/free-trial"
                         className="inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-4 bg-[#00e676] hover:bg-[#00ff87] text-black font-bold rounded-xl text-sm sm:text-lg transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[#00e676]/20 hover:shadow-[#00e676]/30 max-w-full text-center"
                     >
                         Try Free For 24 Hours — No Card Required
                     </Link>
                 </div>

                {/* Infrastructure Stats */}
                <div className="mt-20 border-t border-[#1a1a2a] pt-14">
                    <p className="text-center text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mb-10">
                        Infrastructure &amp; Service Statistics
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
                        {[
                            {
                                value: '99.9%',
                                label: 'Server Uptime',
                                sub: 'Redundant server network',
                                icon: Server,
                            },
                            {
                                value: '10 Gbps',
                                label: 'Network Capacity',
                                sub: 'Per server bandwidth',
                                icon: Zap,
                            },
                            {
                                value: '< 1s',
                                label: 'Channel Load Time',
                                sub: 'Average zap time',
                                icon: Clock,
                            },
                            {
                                value: '50+',
                                label: 'Server Locations',
                                sub: 'Global CDN nodes',
                                icon: Globe,
                            },
                        ].map(stat => {
                            const Icon = stat.icon
                            return (
                                <div key={stat.value}
                                    className="bg-[#0c0c14] border border-[#1a1a2a] rounded-2xl p-6 text-center hover:border-[#2a2a3a] transition-colors">
                                    <div className="flex justify-center mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-[#00e676]" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-white font-bold text-xs mb-1">
                                        {stat.label}
                                    </div>
                                    <div className="text-gray-600 text-xs">{stat.sub}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
