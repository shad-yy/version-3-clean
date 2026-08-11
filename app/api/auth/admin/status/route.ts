import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"

export async function GET(request: NextRequest) {
  try {
    // Check if JWT_SECRET is available
    if (!(!!ENV.JWT_SECRET)) {
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          error: "JWT_SECRET environment variable is required for admin authentication" 
        }, 
        { status: 500 }
      )
    }

    const adminToken = request.cookies.get("admin-session")?.value

    if (!adminToken) {
      return NextResponse.json({ isAuthenticated: false })
    }

    const jwtSecret = ENV.JWT_SECRET
    const { payload } = await jwtVerify(adminToken, new TextEncoder().encode(jwtSecret))
    const isAdmin = Boolean((payload as any).isAdmin)
    const loginTime = (payload as any).loginTime as number | undefined
    const expSeconds = payload.exp

    if (!isAdmin || !expSeconds) {
      return NextResponse.json({ isAuthenticated: false })
    }

    const expiresAt = expSeconds * 1000
    return NextResponse.json({ isAuthenticated: true, loginTime: loginTime ?? null, expiresAt })
  } catch (error) {
    console.error("Admin status check error:", error)
    return NextResponse.json({ isAuthenticated: false })
  }
}
