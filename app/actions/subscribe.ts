"use server"

export interface SubscribeState {
  message: string
  status: "idle" | "success" | "error"
}

export async function subscribeToNewsletter(prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = formData.get("email") as string

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return {
      message: "Please enter a valid email address.",
      status: "error",
    }
  }

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate success (in production, this would call your email service)
  try {
    // Simple throttle (in-memory). For production, replace with persistent store or provider-side protections.
    ;(globalThis as any).__subscribeRate = (globalThis as any).__subscribeRate || new Map<string, number>()
    const now = Date.now()
    const last = (globalThis as any).__subscribeRate.get(email) || 0
    if (now - last < 60_000) {
      return { message: "Please wait before trying again.", status: "error" }
    }
    ;(globalThis as any).__subscribeRate.set(email, now)
    // Here you would integrate with your email service provider
    // For example: Mailchimp, ConvertKit, SendGrid, etc.

    console.log(`Newsletter subscription for: ${email}`)

    return {
      message: "Successfully subscribed to our newsletter!",
      status: "success",
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return {
      message: "Failed to subscribe. Please try again later.",
      status: "error",
    }
  }
}
