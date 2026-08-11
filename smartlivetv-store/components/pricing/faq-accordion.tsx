"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: "Do I need a credit card for the free trial?",
    a: "No. Your 24-hour free trial requires zero payment details. Message us on WhatsApp and we activate your trial immediately."
  },
  {
    q: "How many screens can I watch on simultaneously?",
    a: "All plans support up to 2 simultaneous streams. If you need more, contact us — we can accommodate specific requirements."
  },
  {
    q: "What channels are included?",
    a: "All plans include identical content: 230,000+ live channels including all Sky Sports, TNT Sports, beIN Sports, BBC, ITV, Channel 4, UCL, UFC, F1, NBA, NFL, and 50+ country packages. No plan has fewer channels than another."
  },
  {
    q: "Is there a contract?",
    a: "No contract on any plan. Cancel at any time before your next billing date. No cancellation fees."
  },
  {
    q: "What's the difference between the plans?",
    a: "Only the duration and effective monthly price differ. The 1-month Basic is £12/mo. The 3-month Popular works out at £8/mo. The 6-month Standard is £6/mo. The 12-month Premium is £4.50/mo. Every plan has identical features."
  },
  {
    q: "What happens after the 24-hour trial?",
    a: "Nothing automatic. We contact you to confirm if you'd like to continue. You choose your plan and pay only when you're satisfied."
  },
  {
    q: "Which countries does this work in?",
    a: "Everywhere. No regional restrictions, no VPN needed. Works in the UK, Europe, the Middle East, USA — any country worldwide."
  },
  {
    q: "How do I get support?",
    a: "WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 5–10 minutes."
  }
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex justify-between items-center p-5 text-left cursor-pointer transition-colors hover:bg-[#12121a]/50"
            >
              <span className="font-bold text-white text-sm">{faq.q}</span>
              {isOpen ? (
                <Minus className="w-5 h-5 text-[#00e676] flex-shrink-0 ml-4" />
              ) : (
                <Plus className="w-5 h-5 text-[#00e676] flex-shrink-0 ml-4" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 pt-0 text-gray-400 text-sm">
                {faq.a}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
