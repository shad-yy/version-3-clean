import { type NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"
import bcrypt from "bcryptjs"

// Admin password hash - securely stored in environment
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: NextRequest) {
  try {
    // Check if JWT_SECRET is available
    if (!(!!ENV.JWT_SECRET)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "JWT_SECRET environment variable is required for admin authentication" 
        }, 
        { status: 500 }
      )
    }

    // Validate the payload BEFORE any expensive work. bcryptjs is pure JS and
    // single-threaded, so an unvalidated or oversized input is a CPU DoS vector.
    const body = await request.json().catch(() => null)
    const password: unknown = body?.password

    if (
      !body ||
      typeof password !== "string" ||
      password.length < 1 ||
      password.length > 200
    ) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
    }

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: "Admin authentication not configured" }, { status: 500 })
    }

    // Rate limit BEFORE the bcrypt comparison, not after — otherwise every request
    // performs a full hash regardless of how many attempts the IP has already made.
    // Note this in-process Map is only a per-instance backstop; the authoritative
    // distributed limiter for this route lives in middleware.ts.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    ;(globalThis as any).__adminRateLimit = (globalThis as any).__adminRateLimit || new Map<string, { count: number; ts: number }>()
    const windowMs = 5 * 60 * 1000
    const limit = 10
    const entry = (globalThis as any).__adminRateLimit.get(ip)
    const now = Date.now()
    if (!entry || now - entry.ts > windowMs) {
      ;(globalThis as any).__adminRateLimit.set(ip, { count: 1, ts: now })
    } else {
      entry.count += 1
      if (entry.count > limit) {
        return NextResponse.json({ success: false, message: "Too many attempts. Try later." }, { status: 429 })
      }
    }
    // Clamp map size to avoid unbounded growth
    const rateMap: Map<string, { count: number; ts: number }> = (globalThis as any).__adminRateLimit
    if (rateMap.size > 1000) {
      const oldestKey = [...rateMap.entries()].sort((a, b) => a[1].ts - b[1].ts)[0]?.[0]
      if (oldestKey) rateMap.delete(oldestKey)
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    if (!isValidPassword) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const jwtSecret = ENV.JWT_SECRET
    const token = await new SignJWT({
      isAdmin: true,
      loginTime: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(jwtSecret))

    const response = NextResponse.json({ success: true, message: "Authentication successful" })

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return response
  } catch (error) {
    console.error("Admin authentication error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  response.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!(!!ENV.JWT_SECRET)) {
      return false
    }
    const jwtSecret = ENV.JWT_SECRET
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    return true
  } catch {
    return false
  }
}
