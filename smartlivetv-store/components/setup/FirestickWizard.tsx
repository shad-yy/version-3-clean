"use client"
import { useState, useCallback } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Wifi,
  Tv,
  Settings,
  Play,
  HelpCircle,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Firestick Troubleshooting Wizard                                   */
/*  Interactive step-by-step diagnostic for common IPTV setup issues.  */
/* ------------------------------------------------------------------ */

interface WizardOption {
  label: string
  /** Next step key to navigate to, or null for a terminal resolution. */
  next: string | null
  /** If this is a terminal option, show this resolution. */
  resolution?: Resolution
}

interface WizardStep {
  id: string
  question: string
  icon: React.ReactNode
  options: WizardOption[]
}

interface Resolution {
  title: string
  description: string
  steps: string[]
  severity: "success" | "warning" | "error"
  ctaLabel?: string
  ctaHref?: string
}

/* ------------------------------------------------------------------ */
/*  Decision tree                                                      */
/* ------------------------------------------------------------------ */

const STEPS: WizardStep[] = [
  {
    id: "start",
    question: "What issue are you experiencing with your Firestick?",
    icon: <HelpCircle className="w-5 h-5" />,
    options: [
      { label: "App will not install or open", next: "install-issue" },
      { label: "Channels are buffering or freezing", next: "buffering" },
      { label: "No channels are loading after login", next: "no-channels" },
      { label: "I cannot find the IPTV player app", next: "find-app" },
      { label: "Picture quality is poor (SD instead of HD)", next: "quality" },
      { label: "Error message when entering credentials", next: "credentials" },
    ],
  },
  {
    id: "install-issue",
    question: "Have you enabled 'Apps from Unknown Sources' in your Firestick settings?",
    icon: <Settings className="w-5 h-5" />,
    options: [
      { label: "Yes, it is already enabled", next: "install-cache" },
      {
        label: "No, or I am not sure",
        next: null,
        resolution: {
          title: "Enable Apps from Unknown Sources",
          description:
            "Your Firestick blocks third-party apps by default. You need to enable this setting before installing any IPTV player.",
          steps: [
            'Go to Settings on your Firestick home screen.',
            'Select "My Fire TV" (or "Device" on older models).',
            'Select "Developer Options".',
            'Turn ON "Apps from Unknown Sources".',
            "Go back and try installing the app again.",
          ],
          severity: "warning",
        },
      },
    ],
  },
  {
    id: "install-cache",
    question: "Is your Firestick storage full or nearly full?",
    icon: <Settings className="w-5 h-5" />,
    options: [
      {
        label: "Yes, storage is full",
        next: null,
        resolution: {
          title: "Free up Firestick storage",
          description:
            "The Amazon Firestick has limited storage (typically 8GB). When full, apps cannot install or update properly.",
          steps: [
            'Go to Settings > Applications > Manage Installed Applications.',
            "Select apps you no longer use and uninstall them.",
            'For apps you want to keep, select "Clear Cache" to free temporary data.',
            "Restart your Firestick by going to Settings > My Fire TV > Restart.",
            "Try installing the IPTV player app again.",
          ],
          severity: "warning",
        },
      },
      {
        label: "No, I have space available",
        next: null,
        resolution: {
          title: "Force-stop and reinstall the app",
          description:
            "If the app installed but will not open, a corrupted install is the most likely cause.",
          steps: [
            'Go to Settings > Applications > Manage Installed Applications.',
            "Find the IPTV player app and select it.",
            'Tap "Force Stop", then "Clear Cache", then "Clear Data".',
            'If the problem persists, select "Uninstall" and reinstall the app using the Downloader app.',
            "Open the freshly installed app and re-enter your Smart Live TV credentials.",
          ],
          severity: "warning",
          ctaLabel: "Contact support if this does not resolve it",
          ctaHref: "https://wa.me/447429313810?text=Hi%2C%20I%20need%20help%20with%20my%20Firestick%20setup",
        },
      },
    ],
  },
  {
    id: "buffering",
    question: "Is the buffering happening on all channels or only specific ones?",
    icon: <Wifi className="w-5 h-5" />,
    options: [
      { label: "All channels are buffering", next: "buffering-all" },
      {
        label: "Only some channels (e.g. HD or 4K)",
        next: null,
        resolution: {
          title: "Switch to a lower quality stream",
          description:
            "4K and FHD streams require at least 25 Mbps. If your connection fluctuates, switching to HD (720p) will eliminate buffering.",
          steps: [
            "In your IPTV player, navigate to Settings or Stream Settings.",
            'Change the video output or stream quality to "HD" or "720p".',
            "If available, enable the built-in buffer setting and set it to 5-10 seconds.",
            "Try the channel again. If it works, your connection speed is the limiting factor.",
          ],
          severity: "warning",
          ctaLabel: "Test your connection speed",
          ctaHref: "https://fast.com",
        },
      },
    ],
  },
  {
    id: "buffering-all",
    question: "Is your Firestick connected via Wi-Fi or an Ethernet adapter?",
    icon: <Wifi className="w-5 h-5" />,
    options: [
      {
        label: "Wi-Fi only",
        next: null,
        resolution: {
          title: "Optimise your Wi-Fi connection",
          description:
            "Wi-Fi interference is the number one cause of IPTV buffering on Firestick. A wired connection solves 90% of buffering issues.",
          steps: [
            "Move your Firestick closer to your Wi-Fi router, or move the router closer.",
            "If possible, connect a USB Ethernet adapter to your Firestick for a wired connection (Amazon sells an official adapter for under £15).",
            "Disconnect other devices from your Wi-Fi that may be consuming bandwidth (gaming, downloads, other streams).",
            "Restart your router by unplugging it for 30 seconds, then plug it back in.",
            "On your Firestick, go to Settings > Network and reconnect to your 5GHz Wi-Fi band (if your router supports dual-band).",
          ],
          severity: "warning",
        },
      },
      {
        label: "Ethernet (wired)",
        next: null,
        resolution: {
          title: "Check your broadband speed",
          description:
            "If buffering persists on a wired connection, your broadband speed may be insufficient for live HD/4K streaming. You need at least 10 Mbps for HD and 25 Mbps for 4K.",
          steps: [
            "Run a speed test at fast.com on any device connected to the same network.",
            "If your speed is below 10 Mbps, contact your broadband provider to upgrade.",
            "If your speed is adequate, restart your Firestick: Settings > My Fire TV > Restart.",
            "In your IPTV player app, try clearing the cache: Settings > Applications > [your IPTV app] > Clear Cache.",
            "If the issue persists, your ISP may be throttling streaming traffic. Contact us on WhatsApp for alternative server configurations.",
          ],
          severity: "error",
          ctaLabel: "Run a speed test now",
          ctaHref: "https://fast.com",
        },
      },
    ],
  },
  {
    id: "no-channels",
    question: "Did you receive your login credentials via email after subscribing?",
    icon: <Tv className="w-5 h-5" />,
    options: [
      {
        label: "Yes, I have my credentials",
        next: null,
        resolution: {
          title: "Re-enter your credentials carefully",
          description:
            "Channel loading failures are almost always caused by a typo in the login details. The most common mistakes are extra spaces, wrong capitalisation, or using the wrong login type.",
          steps: [
            "Open your Smart Live TV welcome email and copy the credentials exactly.",
            'In your IPTV player, delete the existing profile and create a new one.',
            'Select "Xtream Codes API" as the login method (not M3U if using Smarters or TiviMate).',
            "Paste the server URL, username, and password exactly as provided — do not add extra spaces.",
            "Tap Connect / Login and wait 15-30 seconds for the channel list to load.",
          ],
          severity: "warning",
        },
      },
      {
        label: "No, I have not received my credentials",
        next: null,
        resolution: {
          title: "Check your spam folder or contact us",
          description:
            "Credentials are sent automatically within 5 minutes of subscribing. If you have not received them, the email may be in your spam/junk folder.",
          steps: [
            "Check your spam/junk folder for an email from Smart Live TV.",
            "Search your inbox for 'Smart Live TV' or 'smartlivetv'.",
            "If you used Gmail, check the Promotions tab.",
            "If you still cannot find it, contact us on WhatsApp and we will resend your credentials immediately.",
          ],
          severity: "error",
          ctaLabel: "Start a Free Trial",
          ctaHref: "/free-trial",
        },
      },
    ],
  },
  {
    id: "find-app",
    question: "Which IPTV player app are you trying to install?",
    icon: <Play className="w-5 h-5" />,
    options: [
      {
        label: "IPTV Smarters Pro",
        next: null,
        resolution: {
          title: "Install IPTV Smarters Pro via Downloader",
          description:
            "IPTV Smarters Pro is not available directly on the Amazon App Store. You need to sideload it using the Downloader app.",
          steps: [
            'Go to the Amazon App Store on your Firestick and search for "Downloader". Install it.',
            'Enable "Apps from Unknown Sources" in Settings > My Fire TV > Developer Options.',
            "Open Downloader and enter the URL provided in your Smart Live TV welcome email.",
            "The app will download and prompt you to install. Tap Install.",
            "Once installed, open IPTV Smarters and log in with your Smart Live TV credentials.",
          ],
          severity: "success",
        },
      },
      {
        label: "TiviMate",
        next: null,
        resolution: {
          title: "Install TiviMate on Firestick",
          description:
            "TiviMate is available on the Amazon App Store in some regions. If not, use the Downloader method.",
          steps: [
            'Search for "TiviMate" in the Amazon App Store first — it may be directly available.',
            "If not found, use the Downloader app (install from App Store if needed).",
            "Enter the TiviMate APK URL provided in your welcome email into the Downloader app.",
            'After install, open TiviMate and select "Add Playlist".',
            'Choose "Xtream Codes" and enter your Smart Live TV server URL, username, and password.',
          ],
          severity: "success",
        },
      },
      {
        label: "I do not know which app to use",
        next: null,
        resolution: {
          title: "We recommend IPTV Smarters Pro for beginners",
          description:
            "IPTV Smarters Pro is the easiest player app for new users. It has a simple interface and works reliably on all Firestick models.",
          steps: [
            'Install the "Downloader" app from the Amazon App Store.',
            "Open Downloader and enter the download URL from your Smart Live TV welcome email.",
            "Install the downloaded app and open it.",
            'Select "Login with Xtream Codes API".',
            "Enter the server URL, username, and password from your welcome email.",
            "Your channels will load automatically. Navigate to Live TV > Sports for live matches.",
          ],
          severity: "success",
          ctaLabel: "View full setup guide",
          ctaHref: "/setup/firestick",
        },
      },
    ],
  },
  {
    id: "quality",
    question: "What Firestick model do you have?",
    icon: <Tv className="w-5 h-5" />,
    options: [
      {
        label: "Firestick 4K / 4K Max",
        next: null,
        resolution: {
          title: "Force 4K output in Firestick settings",
          description:
            "Your Firestick supports 4K but may be defaulting to a lower resolution. You need to check both the Firestick output settings and your IPTV player settings.",
          steps: [
            "Go to Settings > Display & Sounds > Display on your Firestick.",
            'Set "Video Resolution" to "Auto" or "2160p 60Hz" for 4K output.',
            "In your IPTV player app, go to Settings and set the video decoder to \"Hardware\" (not Software).",
            "Select 4K or FHD channel variants when available (look for channels labelled 'UHD' or 'FHD').",
            "Ensure your TV's HDMI port supports HDMI 2.0 or higher (usually labelled on the TV).",
          ],
          severity: "success",
        },
      },
      {
        label: "Firestick Lite / Standard (HD only)",
        next: null,
        resolution: {
          title: "Your Firestick supports HD, not 4K",
          description:
            "The Firestick Lite and standard Firestick only support up to 1080p (Full HD). 4K channels will automatically downscale to HD on your device.",
          steps: [
            "This is expected behaviour — your device outputs HD quality.",
            "For the best HD picture, go to Settings > Display & Sounds > Display and set resolution to 1080p.",
            "In your IPTV player, select HD channel variants (not 4K/UHD) for smoother playback.",
            "If you want true 4K, consider upgrading to the Firestick 4K Max (around £45 on Amazon).",
          ],
          severity: "success",
        },
      },
    ],
  },
  {
    id: "credentials",
    question: "What error message are you seeing?",
    icon: <AlertTriangle className="w-5 h-5" />,
    options: [
      {
        label: "'Authentication failed' or 'Wrong credentials'",
        next: null,
        resolution: {
          title: "Verify your login details",
          description:
            "This error means the server rejected your username or password. Double-check every character.",
          steps: [
            "Open your Smart Live TV welcome email on a phone or computer.",
            "Copy the username and password carefully — they are case-sensitive.",
            "In the IPTV app, delete the existing profile completely.",
            "Create a new profile and paste (do not type) the credentials.",
            "Make sure the Server URL starts with 'http://' — some apps need this prefix.",
            "If the error persists, your subscription may have expired. Check your email for renewal notices or contact us.",
          ],
          severity: "warning",
          ctaLabel: "Renew your subscription",
          ctaHref: "/pricing",
        },
      },
      {
        label: "'Server not found' or 'Connection timeout'",
        next: null,
        resolution: {
          title: "Check your network and server URL",
          description:
            "This error means the app cannot reach our servers. It is almost always a network or URL issue.",
          steps: [
            "Check that your Firestick is connected to Wi-Fi (Settings > Network).",
            "Open the Silk Browser on your Firestick and try loading any website to confirm internet works.",
            "In the IPTV app, verify the Server URL matches exactly what was sent in your email.",
            "Try changing the port number in the URL if one was provided (e.g. from :80 to :8080).",
            "Restart your Firestick and router, then try again.",
          ],
          severity: "error",
        },
      },
      {
        label: "A different error or no error, just a blank screen",
        next: null,
        resolution: {
          title: "Clear app data and try a fresh login",
          description:
            "A blank screen usually means corrupted cache data. Clearing the app data and starting fresh will resolve this.",
          steps: [
            "Go to Settings > Applications > Manage Installed Applications.",
            'Find your IPTV player and select "Clear Data" followed by "Clear Cache".',
            "Reopen the app — it will be like a fresh install.",
            "Re-enter your Smart Live TV credentials.",
            "If the blank screen persists, try a different IPTV player app (e.g. switch from Smarters to TiviMate).",
          ],
          severity: "warning",
          ctaLabel: "Message us on WhatsApp for help",
          ctaHref: "https://wa.me/447429313810?text=Hi%2C%20I%20need%20help%20with%20my%20Firestick%20setup",
        },
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FirestickWizard() {
  const [history, setHistory] = useState<string[]>(["start"])
  const [resolution, setResolution] = useState<Resolution | null>(null)

  const currentStepId = history[history.length - 1]
  const currentStep = STEPS.find((s) => s.id === currentStepId)

  const handleSelect = useCallback(
    (option: WizardOption) => {
      if (option.next) {
        setHistory((prev) => [...prev, option.next!])
        setResolution(null)
      } else if (option.resolution) {
        setResolution(option.resolution)
      }
    },
    []
  )

  const handleBack = useCallback(() => {
    if (resolution) {
      setResolution(null)
      return
    }
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1))
    }
  }, [resolution, history])

  const handleRestart = useCallback(() => {
    setHistory(["start"])
    setResolution(null)
  }, [])

  const progressPct = Math.min(
    ((history.length + (resolution ? 1 : 0)) / 4) * 100,
    100
  )

  // -- Resolution screen --
  if (resolution) {
    const severityConfig = {
      success: {
        bg: "bg-emerald-950/40",
        border: "border-emerald-800/40",
        icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
        accent: "text-emerald-400",
        stepDot: "bg-emerald-500",
      },
      warning: {
        bg: "bg-amber-950/30",
        border: "border-amber-800/30",
        icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
        accent: "text-amber-400",
        stepDot: "bg-amber-500",
      },
      error: {
        bg: "bg-red-950/30",
        border: "border-red-800/30",
        icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
        accent: "text-red-400",
        stepDot: "bg-red-500",
      },
    }[resolution.severity]

    return (
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl overflow-hidden">
        {/* Progress */}
        <div className="h-1 bg-[#1a1a2a]">
          <div
            className="h-full bg-[#00e676] transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className={`${severityConfig.bg} ${severityConfig.border} border rounded-xl p-5 mb-6`}>
            <div className="flex items-start gap-3">
              {severityConfig.icon}
              <div>
                <h4 className={`font-bold text-base ${severityConfig.accent}`}>
                  {resolution.title}
                </h4>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  {resolution.description}
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {resolution.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-6 h-6 rounded-full ${severityConfig.stepDot}
                    text-black text-xs font-bold flex items-center justify-center mt-0.5`}
                >
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {resolution.ctaHref && resolution.ctaLabel && (
              <Link
                href={resolution.ctaHref}
                className="flex-1 text-center bg-[#00e676] text-black font-bold
                  py-3 rounded-xl text-sm hover:bg-[#00ff87] transition-all touch-manipulation"
              >
                {resolution.ctaLabel}
              </Link>
            )}
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-1.5 text-gray-400
                hover:text-white text-sm font-medium py-3 px-4 rounded-xl
                border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-1.5 text-gray-500
                hover:text-gray-300 text-sm py-3 px-4 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // -- Question screen --
  if (!currentStep) return null

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a2a]">
        <div
          className="h-full bg-[#00e676] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-6 md:p-8">
        {/* Question */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl bg-[#00e676]/10 border border-[#00e676]/20
              flex items-center justify-center flex-shrink-0 text-[#00e676]"
          >
            {currentStep.icon}
          </div>
          <h3 className="font-bold text-white text-base leading-snug">
            {currentStep.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentStep.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className="w-full flex items-center justify-between gap-3
                bg-[#0a0a0f] hover:bg-[#151520] border border-[#2a2a3a]
                hover:border-[#00e676]/30 rounded-xl px-4 py-3.5
                text-left transition-all group"
            >
              <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                {option.label}
              </span>
              <ChevronRight
                className="w-4 h-4 text-gray-600 group-hover:text-[#00e676]
                  transition-colors flex-shrink-0"
              />
            </button>
          ))}
        </div>

        {/* Back button */}
        {history.length > 1 && (
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-1.5 text-gray-500
              hover:text-gray-300 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>
    </div>
  )
}
