import type { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { SUPPORT_EMAIL } from '@/lib/config/site-url'

export const metadata: Metadata = {
  title: 'Privacy Policy | Smart Live TV',
  description: 'Smart Live TV privacy policy — how we collect, use and protect your personal data under UK GDPR.',
  alternates: { canonical: `${ENV.BASE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100 pt-28 md:pt-36 pb-16 md:pb-20">
      <FadeIn>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sl-text mb-4 md:mb-6">Privacy Policy</h1>
        <p className="text-sl-mute text-sm mb-8 md:mb-12">Last updated: May 2026</p>

        <div className="space-y-8 text-sl-mid leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">1. Data We Collect</h2>
            <p className="mb-4">We collect the following data:</p>

            <h3 className="text-lg font-bold text-sl-text mb-2">Analytics Data (Google Analytics 4)</h3>
            <p className="mb-4">
              We use Google Analytics 4 to understand how visitors use our website. GA4 collects
              anonymised data including: pages visited, time on site, device type, and geographic
              region (country/city level only). No personally identifiable information is collected
              by GA4 unless you explicitly provide it. You can opt out via our cookie consent banner
              or at{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                className="text-[var(--sl-amber)] hover:underline">
                tools.google.com/dlpage/gaoptout
              </a>.
            </p>

            <h3 className="text-lg font-bold text-sl-text mb-2">Form Data</h3>
            <p className="mb-4">
              When you contact us, we collect your name, email address, and the content of your
              message. This data is used solely to respond to your enquiry. We do not sell or
              share it with third parties, and we delete enquiry correspondence once it is no
              longer needed.
            </p>

            <h3 className="text-lg font-bold text-sl-text mb-2">Technical Data (Vercel)</h3>
            <p className="mb-4">
              Our website is hosted on Vercel, which processes server logs including IP addresses and
              request data for security and performance purposes. See Vercel&apos;s privacy policy at{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                className="text-[var(--sl-amber)] hover:underline">
                vercel.com/legal/privacy-policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">2. Cookies</h2>
            <p className="mb-3">We use the following cookies:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong className="text-sl-text">_ga, _ga_*</strong> (Google Analytics): Expire after 2 years.
                Used for analytics. Only set after you accept cookies.
              </li>
              <li>
                <strong className="text-sl-text">Functional cookies</strong>: Set after consent to remember
                preferences. Expire after 1 year.
              </li>
            </ul>
            <p>
              You can accept or decline cookies using our consent banner. Declining will disable
              analytics tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">3. How We Use Your Information</h2>
            <p>We use your contact details solely to respond to the enquiry you
            sent us. We do not sell your data to third parties, and we do not
            send marketing communications.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">4. Data Storage</h2>
            <p>Your data is stored securely. We retain enquiry correspondence for
            up to 12 months so we can follow up on unresolved issues, after which
            it is deleted. You may request deletion of your data at any time by
            contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">5. Your Rights (UK GDPR)</h2>
            <p>
              Under the UK General Data Protection Regulation and the Data Protection Act 2018,
              you have the right to: access your data, request deletion, and withdraw consent at
              any time. Contact us via the details on our{' '}
              <Link href="/contact" className="text-[var(--sl-amber)] hover:underline">Contact page</Link>{' '}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">6. Contact</h2>
            <p>Privacy questions: <a href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[var(--sl-amber)] hover:underline">{SUPPORT_EMAIL}</a>
            </p>
          </section>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
