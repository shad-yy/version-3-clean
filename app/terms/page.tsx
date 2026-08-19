import type { Metadata } from 'next'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { SUPPORT_EMAIL } from '@/lib/config/site-url'

export const metadata: Metadata = {
  title: 'Terms of Service | Sightline',
  description: 'Sightline terms of service — the rules for using our live sports scores, fixtures and official broadcast listings.',
  alternates: { canonical: `${ENV.BASE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--sl-ground)] text-gray-100 pt-28 md:pt-36 pb-16 md:pb-20">
      <FadeIn>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sl-text mb-4 md:mb-6">Terms of Service</h1>
        <p className="text-sl-mute text-sm mb-8 md:mb-12">Last updated: 31 July 2026</p>

        <div className="space-y-8 text-sl-mid leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">1. Service Description</h2>
            <p>Sightline is a free, information-only service. We publish live sports
            scores, fixture schedules, league standings, team and player statistics, and
            listings of the official television broadcasters that hold the rights to each
            event. We do not sell, resell, or provide access to any television or streaming
            subscription, and we do not host or transmit any video content.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">2. Accuracy of Information</h2>
            <p>Scores, fixtures, standings and statistics are supplied by third-party data
            providers and are presented on a best-effort basis. Kick-off times and broadcast
            listings are subject to change by the competition organiser or the rights holder.
            Always confirm against the official broadcaster before making plans. We accept no
            liability for decisions made on the basis of information published here.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">3. Acceptable Use</h2>
            <p>You may use this site for personal, non-commercial purposes. Automated
            scraping, bulk redistribution of our data, and any attempt to disrupt or overload
            the service are not permitted. We reserve the right to restrict access where these
            terms are breached.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">4. Service Availability</h2>
            <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. 
            Scheduled maintenance will be communicated where possible. 
            We are not liable for service disruptions caused by third-party 
            infrastructure failures.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">5. Limitation of Liability</h2>
            <p>The service is provided free of charge and on an &ldquo;as is&rdquo; basis. To the
            fullest extent permitted by law, we are not responsible for indirect or
            consequential damages arising from use of the service, or from reliance on data
            supplied by third-party providers. Nothing in these terms limits liability that
            cannot be limited under English law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">6. Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales. 
            Any disputes shall be subject to the exclusive jurisdiction 
            of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sl-text mb-3">7. Contact</h2>
            <p>Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[var(--sl-amber)] hover:underline">{SUPPORT_EMAIL}</a>
            </p>
          </section>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
