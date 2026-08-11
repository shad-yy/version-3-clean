import Link from "next/link"
import { PricingCardsSlider } from "@/components/pricing/PricingCardsSlider"

export function PricingPreview() {
  return (
    <section className="py-20 md:py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-block bg-[#00e676]/10 border border-[#00e676]/20 text-[#00e676] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            Premium TV Access Guide
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Unified Global Sports Access
          </h2>
          <p className="text-base md:text-lg text-gray-400">
            Compare subscription options for 4K live sports, 230k+ global channels, and full streaming platform access.
          </p>
        </div>

        {/* Pricing cards — slider on mobile, grid on desktop */}
        <PricingCardsSlider fullFeatures={false} showTrialCta />

        {/* Bottom disclaimer */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-sm text-gray-500 font-medium bg-[#12121a] inline-block px-6 py-2 rounded-full border border-[#2a2a3a]">
            <span className="text-[#00e676] mr-2">✓</span>
            Multi-device support · 4K Ultra HD Streams · Instant Digital Activation
          </p>
          <p className="text-center text-xs text-gray-600">
            Looking for setup guides or trial details?{" "}
            <Link href="/pricing" className="text-[#00e676] hover:underline">
              View the full Access Guide &amp; Plan comparison →
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
