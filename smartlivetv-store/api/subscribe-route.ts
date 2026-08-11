import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: "Please enter a valid email address." 
      }, { status: 400 })
    }

    // Simple throttle (in-memory)
    const now = Date.now()
    const last = (globalThis as any).__subscribeRate?.get(email) || 0
    if (now - last < 60_000) {
      return NextResponse.json({ 
        success: false, 
        message: "Please wait before trying again." 
      }, { status: 429 })
    }
    
    if (!(globalThis as any).__subscribeRate) {
      (globalThis as any).__subscribeRate = new Map()
    }
    (globalThis as any).__subscribeRate.set(email, now)

    // Log subscription (in production, integrate with email service)

    return NextResponse.json({ 
      success: true, 
      message: "Successfully subscribed to our newsletter!" 
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to subscribe. Please try again later." 
    }, { status: 500 })
  }
}
