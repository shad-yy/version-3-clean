import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "FAQ - Smart Live TV",
  description: "Frequently asked questions about Smart Live TV services and features.",
}

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Smart Live TV?",
      answer: "Smart Live TV is your ultimate sports hub providing real-time scores, breaking news, and in-depth analysis for every sports fan."
    },
    {
      question: "How do I get live scores?",
      answer: "Simply navigate to the Scores page or use our search feature to find specific teams and matches. All scores are updated in real-time."
    },
    {
      question: "Is Smart Live TV free to use?",
      answer: "Yes! We offer a free tier with live scores, basic news articles, and limited team stats. Premium features are available with our Pro and Elite plans."
    },
    {
      question: "How accurate are the scores?",
      answer: "Our scores are sourced from official sports data providers and updated in real-time to ensure maximum accuracy."
    },
    {
      question: "Can I customize my experience?",
      answer: "Yes! You can follow your favorite teams, set up notifications, and customize your dashboard to focus on the sports and leagues you care about most."
    },
    {
      question: "Do you cover all sports?",
      answer: "We currently focus on football (soccer), UFC, and major sports leagues. We're constantly expanding our coverage based on user demand."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-800 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
            <a 
              href="/info/contact" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
