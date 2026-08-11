import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateFAQSchema } from '@/lib/schema'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SpeedChecker } from '@/components/ui/SpeedChecker'
import { FirestickWizard } from '@/components/setup/FirestickWizard'

const DEVICES = {
    'firestick': { name: 'Firestick' },
    'smart-tv': { name: 'Smart TV' },
    'android': { name: 'Android' },
    'iphone': { name: 'iPhone' },
}

const LEAGUES = [
    { id: '4328', slug: 'premier-league', name: 'Premier League', logo: '/leagues/premier-league.png' },
    { id: '4335', slug: 'la-liga', name: 'La Liga', logo: '/leagues/la-liga.png' },
    { id: '4331', slug: 'bundesliga', name: 'Bundesliga', logo: '/leagues/bundesliga.png' },
    { id: '4332', slug: 'serie-a', name: 'Serie A', logo: '/leagues/serie-a.png' },
    { id: '4334', slug: 'ligue-1', name: 'Ligue 1', logo: '/leagues/ligue-1.png' },
]

type Props = { params: { device: string } }

export function generateStaticParams() {
    return Object.keys(DEVICES).map((device) => ({ device }))
}

export function generateMetadata({ params }: Props): Metadata {
    const device = DEVICES[params.device as keyof typeof DEVICES]
    if (!device) return { title: 'Device Not Found' }

    const canonical = `${ENV.BASE_URL}/setup/${params.device}`

    if (params.device === 'firestick') {
        return {
            title: 'Smart Live TV on Firestick — Setup Guide 2026',
            description:
                'Official Smart Live TV setup guide for Amazon Firestick. Install in 5 minutes, get 230,000+ channels including Sky Sports Premier League, Netflix and Champions League. No box required.',
            alternates: { canonical },
            openGraph: {
                title: 'Smart Live TV on Firestick — Setup Guide 2026',
                description:
                    'Official Smart Live TV setup guide for Amazon Firestick. Install in 5 minutes, get 230,000+ channels including Sky Sports Premier League, Netflix and Champions League.',
                type: 'article',
            },
        }
    }

    if (params.device === 'smart-tv') {
        return {
            title: 'Smart Live TV on Samsung & LG Smart TV — Setup Guide 2026',
            description:
                'Install Smart Live TV on your Samsung, LG, or Sony Smart TV in 5 minutes. Get Sky Sports, Netflix, 230,000+ channels. Official setup guide.',
            alternates: { canonical },
            openGraph: {
                title: 'Smart Live TV on Samsung & LG Smart TV — Setup Guide 2026',
                description:
                    'Install Smart Live TV on your Samsung, LG, or Sony Smart TV in 5 minutes. Get Sky Sports, Netflix, 230,000+ channels. Official setup guide.',
                type: 'article',
            },
        }
    }

    return {
        title: `How to Watch Live Sports on ${device.name} in 2026 | Smart Live TV`,
        description: `Stream Premier League, La Liga, UFC and more on your ${device.name}. Step-by-step setup guide. Works with all major IPTV apps.`,
        alternates: { canonical },
        openGraph: {
            title: `How to Watch Live Sports on ${device.name} in 2026`,
            description: `Stream Premier League, La Liga, UFC and more on your ${device.name}.`,
            type: 'article',
        },
    }
}

export default async function SetupDevicePage({ params }: Props) {
    const deviceParams = DEVICES[params.device as keyof typeof DEVICES]

    if (!deviceParams) {
        notFound()
    }

    const firestickExtraFaqs = params.device === 'firestick' ? [
        {
            question: 'Does Smart Live TV have an official Firestick app?',
            answer: 'Smart Live TV provides a dedicated setup guide and player app for Amazon Firestick. Installation takes under 5 minutes using the steps below.',
        },
        {
            question: 'Is Smart Live TV different from Axia TV or other IPTV boxes?',
            answer: 'Yes. Smart Live TV is a subscription streaming service that works on your existing devices — including Amazon Firestick — without requiring any additional hardware or set-top box.',
        },
    ] : []

    const faqs = [
        {
            question: `Is the SmartLiveTV app free to download on ${deviceParams.name}?`,
            answer: `Yes, you can use any free IPTV player available on your ${deviceParams.name} app store. You only pay for your SmartLiveTV streaming subscription.`
        },
        {
            question: `Do I need a VPN to watch sports on my ${deviceParams.name}?`,
            answer: `No VPN is required. Our streams are securely delivered to your ${deviceParams.name} without any regional blocking or throttling.`
        },
        {
            question: `Can I use my subscription on multiple devices?`,
            answer: `Yes, depending on the tier you choose during sign-up, you can stream simultaneously on up to 4 devices including your ${deviceParams.name}, smartphones, and computers.`
        },
        ...firestickExtraFaqs,
    ]

    const faqSchema = generateFAQSchema(faqs)

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${ENV.BASE_URL}/setup/${params.device}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', 
          item: `${ENV.BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Setup Guides', 
          item: `${ENV.BASE_URL}/setup` },
        { '@type': 'ListItem', position: 3, name: `${deviceParams.name} Setup`, 
          item: `${ENV.BASE_URL}/setup/${params.device}` },
      ],
    }

    const howToSteps: Record<string, Array<{name: string; text: string}>> = {
      firestick: [
        { name: 'Enable Unknown Sources', text: 'Go to Settings → My Fire TV → Developer Options → Apps from Unknown Sources → turn ON.' },
        { name: 'Install Downloader App', text: 'Search for "Downloader" in the Amazon Appstore and install it for free.' },
        { name: 'Download the IPTV Player', text: 'Open Downloader and enter the URL provided in your Smart Live TV welcome email.' },
        { name: 'Enter Your Credentials', text: 'Open the IPTV app, enter your username and password from your Smart Live TV account.' },
        { name: 'Start Watching', text: 'Navigate to Live TV → Sports to find all Premier League, Champions League and sports channels.' },
      ],
      'smart-tv': [
        { name: 'Open Smart Hub or App Store', text: 'Press the Home button on your remote and navigate to Apps or Smart Hub.' },
        { name: 'Search for IPTV Player', text: 'Search for "Smart IPTV" or "IPTV Smarters" in the app store and install.' },
        { name: 'Enter Your Playlist URL', text: 'Open the app and enter the M3U URL provided in your Smart Live TV welcome email.' },
        { name: 'Load Your Channels', text: 'The app will load your 230,000+ channels automatically. Navigate to Sports for live matches.' },
      ],
      android: [
        { name: 'Download the App', text: 'Go to Google Play Store and download "IPTV Smarters Pro" or the app link we provide.' },
        { name: 'Open and Add Playlist', text: 'Open the app, tap "Add User" and enter your Smart Live TV login credentials.' },
        { name: 'Select Your Content', text: 'Choose Live TV for sports channels, or VOD for movies and on-demand content.' },
      ],
      iphone: [
        { name: 'Download the App', text: 'Go to the App Store and download "GSE Smart IPTV" or the player app we recommend.' },
        { name: 'Add Your Playlist', text: 'In the app settings, add playlist URL and enter the M3U link from your welcome email.' },
        { name: 'Browse Channels', text: 'Open Live TV and navigate to Sports for all live sports channels in HD and 4K.' },
      ],
    }

    const deviceSteps = howToSteps[params.device] || []

    const howToSchema = deviceSteps.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Set Up Smart Live TV on ${deviceParams.name}`,
      description: `Step-by-step guide to installing and setting up Smart Live TV IPTV service on ${deviceParams.name}. Takes under 5 minutes.`,
      totalTime: 'PT5M',
      supply: [
        { '@type': 'HowToSupply', name: deviceParams.name },
        { '@type': 'HowToSupply', name: 'Smart Live TV subscription credentials' },
      ],
      step: deviceSteps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
      })),
    } : null

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <SchemaMarkup schema={faqSchema} />
            <SchemaMarkup schema={breadcrumbSchema} />
            {howToSchema && <SchemaMarkup schema={howToSchema} />}

            {/* Hero Section */}
            <FadeIn>
            <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-gradient-to-b from-gray-900 to-gray-950 text-center px-4 border-b border-gray-900">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                        {params.device === 'firestick' 
                          ? 'How to Set Up Smart Live TV on Amazon Firestick (2026)'
                          : `How to Watch Live Sports on ${deviceParams.name}`
                        }
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        {params.device === 'firestick'
                          ? 'This guide covers setting up Smart Live TV — the UK IPTV service — on your Amazon Firestick. Stream Premier League, UFC, and 230,000+ live channels in under 5 minutes.'
                          : `Turn your ${deviceParams.name} into the ultimate sports hub in under 5 minutes. Stream Premier League, UFC, and 230,000+ live channels instantly.`
                        }
                    </p>
                </div>
            </section>
            </FadeIn>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl">
                {/* Left Column: Instructions */}
                <div className="lg:col-span-2 space-y-0">

                    <FadeIn direction="up">
                    <section className="bg-gray-900 p-8 md:p-10 rounded-3xl border border-gray-800 mb-16 md:mb-20">
                        <h2 className="text-3xl font-bold text-white mb-8">Step-by-Step Setup Guide</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-lg">1</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Get your SmartLiveTV subscription — 24-hour free trial, no card required</h3>
                                    <p className="text-gray-400">Head over to our pricing page and select your package. We will immediately email you your secure IPTV M3U link and portal login details.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-lg">2</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Install an IPTV Player on your {deviceParams.name}</h3>
                                    <p className="text-gray-400">Open your device's app store and search for a standard player like "IPTV Smarters", "TiviMate", or "XCIPTV". Download and install it for free.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-lg">3</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Enter your SmartLiveTV details</h3>
                                    <p className="text-gray-400">Open the app you just downloaded and select "Login with Xtream Codes" or "M3U Playlist". Paste the credentials we emailed you in step one.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-lg">4</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Start Streaming</h3>
                                    <p className="text-gray-400">The app will download our live channel guide. You now have access to thousands of live HD sports and TV networks directly on your {deviceParams.name}.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
                            <ShimmerButton
                                href="/pricing"
                                className="w-full md:w-auto px-8 py-4 font-bold rounded-lg text-lg text-black bg-green-500"
                            >
                                Set Up on My {deviceParams.name} — Start Free Trial
                            </ShimmerButton>
                        </div>
                    </section>
                    </FadeIn>

                    {params.device === 'firestick' && (
                      <FadeIn direction="up">
                      <section className="mt-16 md:mt-20 mb-16 md:mb-20">
                        <h2 className="text-3xl font-bold text-white mb-3">Having trouble?</h2>
                        <p className="text-gray-400 mb-6">Use our interactive troubleshooter to diagnose and fix common Firestick setup issues in under 2 minutes.</p>
                        <FirestickWizard />
                      </section>
                      </FadeIn>
                    )}

                    <div className="max-w-sm mt-10">
                        <SpeedChecker />
                    </div>

                    <FadeIn direction="up">
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
                                    <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                                    <p className="text-gray-400">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    </FadeIn>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Why {deviceParams.name} users love SmartLiveTV</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>Zero Buffering:</strong> Our 60FPS servers are optimized for native {deviceParams.name} playback hardware.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>100% Legitimate Apps:</strong> Use official store apps without jailbreaking or risky sideloading.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                <span><strong>4K UHD Support:</strong> True ultra-HD sports streams looking beautiful on large screens.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-2">Access 230,000+ Channels</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Your subscription includes every single channel and sports network worldwide, including these top leagues and much more:
                        </p>
                        <div className="flex flex-col gap-3">
                            {LEAGUES.map(league => (
                                <Link key={league.slug} href={`/watch/${league.slug}`} className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-700">
                                    <img
                                        src={league.logo}
                                        alt={league.name}
                                        className="w-10 h-10 object-contain bg-white rounded-full p-1"
                                    />
                                    <span className="font-bold text-gray-200">{league.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
                        <h3 className="text-xl font-bold text-white mb-4">Other Devices</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(DEVICES).filter(d => d !== params.device).map(device => (
                                <Link key={device} href={`/setup/${device}`} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 capitalize transition">
                                    {device.replace('-', ' ')}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
