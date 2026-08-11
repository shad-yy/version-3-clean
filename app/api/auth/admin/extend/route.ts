import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"

export async function POST() {
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

    const adminToken = cookies().get("admin-session")?.value

    if (!adminToken) {
      return NextResponse.json({ success: false, message: "No active session" }, { status: 401 })
    }

    // Verify current token
    const jwtSecret = ENV.JWT_SECRET
    const { payload } = await jwtVerify(adminToken, new TextEncoder().encode(jwtSecret))
    const isAdmin = Boolean((payload as any).isAdmin)

    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    // Create new token with extended expiration
    const newToken = await new SignJWT({
      isAdmin: true,
      loginTime: (payload as any).loginTime || Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(jwtSecret))

    const response = NextResponse.json({ success: true, message: "Session extended" })

    response.cookies.set("admin-session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session extension error:", error)
    return NextResponse.json({ success: false, message: "Failed to extend session" }, { status: 500 })
  }
}
