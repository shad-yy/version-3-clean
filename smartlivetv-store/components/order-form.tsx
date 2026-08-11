"use client"

import { useMemo, useState } from "react"

type PlanId = "trial" | "1m" | "3m" | "6m" | "1y"

const PLANS: Array<{
  id: PlanId
  title: string
  price: string
  badge?: string
}> = [
  { id: "trial", title: "Free 24h Trial", price: "Free", badge: "Recommended" },
  { id: "1m", title: "1 Month", price: "$12" },
  { id: "3m", title: "3 Months", price: "$29", badge: "save 19%" },
  { id: "6m", title: "6 Months", price: "$39", badge: "save 46%" },
  { id: "1y", title: "1 Year", price: "$60", badge: "save 58%" },
]

export function OrderForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [plan, setPlan] = useState<PlanId>("trial")
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlanLabel = useMemo(() => {
    const p = PLANS.find((x) => x.id === plan)
    return p ? `${p.title} — ${p.price}${p.badge ? ` (${p.badge})` : ""}` : plan
  }, [plan])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim() || !plan) {
      setError("Please fill in the required fields.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || undefined,
          plan: selectedPlanLabel,
          message: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`)
      }

      const json = (await res.json()) as { success?: boolean }
      if (!json?.success) {
        throw new Error("Request failed")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
        <p className="text-gray-400">
          We&apos;ll contact you within 1 hour on WhatsApp or email with your login details.
        </p>
      </div>
    )
  }

  const inputClass =
    "bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none w-full"

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight text-center">
        Get Started Today
      </h2>
      <p className="text-text-secondary text-center mt-3">
        Fill in your details and we&apos;ll set up your account within 1 hour.
      </p>

      <div className="flex justify-center mt-8">
        <a
          href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '/contact'}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20c55e] text-white font-bold px-6 py-3 rounded-xl w-fit mx-auto mb-8"
        >
          💬 Message Us on WhatsApp Instead
        </a>
      </div>

      <form onSubmit={onSubmit} className="bg-surface rounded-2xl border border-border p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Full Name *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              type="text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Email Address *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">WhatsApp Number</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={inputClass}
              type="tel"
              placeholder="+44 7700 000000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">Plan *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANS.map((p) => {
                const selected = plan === p.id
                const isTrial = p.id === "trial"
                return (
                  <label
                    key={p.id}
                    className={[
                      "cursor-pointer rounded-xl border px-4 py-3 transition-colors",
                      selected ? "border-green-500 bg-green-500/10" : "border-[#2a2a3a] bg-[#1a1a24]",
                      isTrial ? "ring-1 ring-green-500/30" : "",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={selected}
                      onChange={() => setPlan(p.id)}
                      className="sr-only"
                      required
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">{p.title}</div>
                        {p.badge ? <div className="text-xs text-gray-400 mt-0.5">{p.badge}</div> : null}
                      </div>
                      <div className="font-bold text-white">{p.price}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="Any questions or special requests"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={[
              "w-full py-4 text-lg font-bold rounded-xl transition-colors",
              submitting ? "bg-green-500/60 text-black cursor-not-allowed" : "bg-green-500 hover:bg-green-400 text-black",
            ].join(" ")}
          >
            {submitting ? "Submitting..." : "Claim My Plan →"}
          </button>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </form>
    </div>
  )
}

