"use client"
import { useState, useRef } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { useRouter } from "next/navigation"
import { trackEvent } from "@/lib/analytics"
import { Check } from "lucide-react"

const COUNTRIES = [
  "United Kingdom", "Morocco", "France", "Germany", "Spain",
  "Italy", "Netherlands", "Belgium", "Portugal", "Ireland",
  "USA", "Canada", "Australia", "UAE", "Saudi Arabia",
  "Algeria", "Tunisia", "Egypt", "Other"
]

const DEVICES = [
  "Amazon Firestick", "Smart TV (Samsung/LG/Sony)",
  "Android Phone/Tablet", "iPhone / iPad",
  "Android TV Box", "PC / Mac", "Other"
]

const CONNECTION_TYPES = [
  "Home Broadband (WiFi)", "Home Broadband (Ethernet/Wired)",
  "4G/5G Mobile Data", "Not sure"
]

const INTERNET_SPEEDS = [
  "Below 10 Mbps", "10–30 Mbps", "30–100 Mbps",
  "100 Mbps+", "Not sure"
]

export function TrialForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const captchaRef = useRef<HCaptcha>(null)
  const [captchaToken, setCaptchaToken] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    whatsapp: "",
    device: "",
    connectionType: "",
    internetSpeed: "",
  })

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.whatsapp || !form.device) {
      setError("Please fill in all required fields.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && !captchaToken) {
      setError("Please complete the security check.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: "Free Trial Request",
          captchaToken,
          message: `Device: ${form.device} | Connection: ${form.connectionType} | Speed: ${form.internetSpeed} | Country: ${form.country}`,
        }),
      })

      if (!res.ok) throw new Error("Submission failed")
      setSubmitted(true)
      trackEvent('trial_request', 'conversion', form.device)
    } catch {
      setError("Something went wrong. Please try WhatsApp instead.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#00e676]/10 border-2 
          border-[#00e676] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#00e676] text-2xl"><Check className="w-6 h-6" /></span>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3">
          Trial Request Received!
        </h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          We'll send your trial credentials to your WhatsApp number 
          within 5 minutes. Keep an eye on your messages.
        </p>
        <p className="text-sm text-gray-500">
          Device detected: <span className="text-white">{form.device}</span>
          {" — "}we'll include a setup guide for your specific device.
        </p>
      </div>
    )
  }

  const inputClass = `w-full bg-[#12121a] border border-[#2a2a3a] 
    focus:border-[#00e676] rounded-xl px-4 py-3 text-white text-sm 
    outline-none transition-colors placeholder:text-gray-600`

  const selectClass = `w-full bg-[#12121a] border border-[#2a2a3a] 
    focus:border-[#00e676] rounded-xl px-4 py-3 text-white text-sm 
    outline-none transition-colors appearance-none cursor-pointer`

  const labelClass = "block text-sm font-semibold text-gray-300 mb-2"
  const requiredDot = <span className="text-[#ff1744] ml-1">*</span>

  return (
    <div className="space-y-5">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Full Name {requiredDot}
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email Address {requiredDot}
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={set("email")}
            className={inputClass}
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>Country</label>
        <select value={form.country} onChange={set("country")} 
          className={selectClass}>
          <option value="">Select your country</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* WhatsApp */}
      <div>
        <label className={labelClass}>
          WhatsApp Number {requiredDot}
          <span className="text-[#25D366] ml-2 font-normal text-xs">
            (We send your trial via WhatsApp)
          </span>
        </label>
        <input
          type="tel"
          placeholder="+44 7700 000000"
          value={form.whatsapp}
          onChange={set("whatsapp")}
          className={inputClass}
        />
      </div>

      {/* Device */}
      <div>
        <label className={labelClass}>
          Your Device {requiredDot}
        </label>
        <select value={form.device} onChange={set("device")}
          className={selectClass}>
          <option value="">Select your device</option>
          {DEVICES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1.5">
          We'll send a setup guide tailored to your device.
        </p>
      </div>

      {/* Connection Type */}
      <div>
        <label className={labelClass}>Connection Type</label>
        <select value={form.connectionType} 
          onChange={set("connectionType")} className={selectClass}>
          <option value="">Select connection type</option>
          {CONNECTION_TYPES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Internet Speed */}
      <div>
        <label className={labelClass}>Internet Speed</label>
        <select value={form.internetSpeed} 
          onChange={set("internetSpeed")} className={selectClass}>
          <option value="">Select your speed</option>
          {INTERNET_SPEEDS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1.5">
          Helps us recommend the best quality settings for you.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border 
          border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY && (
        <div className="flex justify-center">
          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            ref={captchaRef}
            theme="dark"
          />
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#00e676] hover:bg-[#00ff87] disabled:opacity-50
          text-black font-extrabold py-4 rounded-xl text-base transition-all
          shadow-[0_0_20px_rgba(0,230,118,0.25)] touch-manipulation
          active:scale-[0.98]"
      >
        {loading ? "Sending Request..." : "Request My Free Trial →"}
      </button>

      <p className="text-center text-xs text-gray-600">
        No payment required · We respond within 5 minutes · 
        9am–11pm UK time
      </p>

      {/* WhatsApp fallback */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-600 mb-2">
          Prefer to message directly?
        </p>
        <a
          href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '/contact'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold
            text-[#25D366] hover:underline"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Message us on WhatsApp instead
        </a>
      </div>
    </div>
  )
}
