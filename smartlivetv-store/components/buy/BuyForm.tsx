"use client"
import { useState } from "react"
import { Check } from "lucide-react"

interface Plan {
  id: string
  name: string
  period: string
  price: string
  monthly: string
  popular: boolean
}

export function BuyForm({ plans }: { plans: Plan[] }) {
  const [selectedPlan, setSelectedPlan] = useState('3month')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    device: '',
  })

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.whatsapp) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          plan: selectedPlanData?.name || selectedPlan,
          message: `Purchase request: ${selectedPlanData?.period} (${selectedPlanData?.price}) | Device: ${form.device}`,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Message us on WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#00e676]/10 border-2 border-[#00e676] flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-[#00e676]" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3">
          Order Received!
        </h2>
        <p className="text-gray-400 mb-2">
          We&apos;ll send your credentials to your WhatsApp within 5 minutes.
        </p>
        <p className="text-sm text-gray-500">
          Plan: <span className="text-white font-bold">
            {selectedPlanData?.period} — {selectedPlanData?.price}
          </span>
        </p>
      </div>
    )
  }

  const inputClass = "w-full bg-[#12121a] border border-[#2a2a3a] focus:border-[#00e676] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-gray-600"

  return (
    <div className="space-y-6">
      {/* Plan selector */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">
          Choose Your Plan
        </label>
        <div className="grid grid-cols-2 gap-3">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all touch-manipulation ${
                selectedPlan === plan.id
                  ? 'border-[#00e676] bg-[#00e676]/5'
                  : 'border-[#2a2a3a] bg-[#12121a] hover:border-[#2a2a3a]'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  BEST VALUE
                </span>
              )}
              <p className="text-white font-bold text-sm">
                {plan.period}
              </p>
              <p className="text-[#00e676] font-extrabold text-xl mt-0.5">
                {plan.price}
              </p>
              <p className="text-gray-500 text-xs">{plan.monthly}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input type="text" placeholder="Your name"
          value={form.name} onChange={set('name')}
          className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Email Address <span className="text-red-400">*</span>
        </label>
        <input type="email" placeholder="your@email.com"
          value={form.email} onChange={set('email')}
          className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          WhatsApp Number <span className="text-red-400">*</span>
          <span className="text-green-400 ml-2 font-normal text-xs">
            (Credentials sent here)
          </span>
        </label>
        <input type="tel" placeholder="+44 7700 000000"
          value={form.whatsapp} onChange={set('whatsapp')}
          className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Your Device
        </label>
        <select value={form.device} onChange={set('device')}
          className={inputClass + ' appearance-none cursor-pointer'}>
          <option value="">Select device (optional)</option>
          <option>Amazon Firestick</option>
          <option>Smart TV (Samsung/LG/Sony)</option>
          <option>Android Phone/Tablet</option>
          <option>iPhone / iPad</option>
          <option>PC / Mac</option>
          <option>Android TV Box</option>
        </select>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Order summary */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            {selectedPlanData?.name} — {selectedPlanData?.period}
          </span>
          <span className="text-white font-extrabold text-lg">
            {selectedPlanData?.price}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {selectedPlanData?.monthly} · Instant activation · 7-day money back
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#00e676] hover:bg-[#00ff87] disabled:opacity-50 text-black font-extrabold py-4 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] touch-manipulation active:scale-[0.98]"
      >
        {loading ? 'Processing...' : `Get Access Now — ${selectedPlanData?.price} →`}
      </button>

      <p className="text-center text-xs text-gray-600">
        By submitting you agree to our{' '}
        <a href="/terms" className="underline">Terms</a>
        {' '}and{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </p>
    </div>
  )
}
