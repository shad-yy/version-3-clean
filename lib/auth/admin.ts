"use client"

import { useState, useEffect, useCallback } from "react"

interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
  expiresAt: number
}

class AdminAuth {
  private session: AdminSession | null = null
  private listeners: Set<() => void> = new Set()

  constructor() {
    if (typeof window !== "undefined") {
      this.checkServerSession()
    }
  }

  private async checkServerSession() {
    try {
      const response = await fetch("/api/auth/admin/status")
      const data = await response.json()

      if (data.isAuthenticated) {
        this.session = {
          isAuthenticated: true,
          loginTime: data.loginTime,
          expiresAt: data.expiresAt,
        }
      } else {
        this.session = null
      }
      this.notifyListeners()
    } catch (error) {
      this.session = null
      this.notifyListeners()
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public isAdmin(): boolean {
    return this.session?.isAuthenticated ?? false
  }

  public async enableAdminMode(password: string): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        await this.checkServerSession()
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  public async disableAdminMode(): Promise<void> {
    try {
      await fetch("/api/auth/admin", { method: "DELETE" })
      this.session = null
      this.notifyListeners()
    } catch (error) {
      // Force logout on client even if server request fails
      this.session = null
      this.notifyListeners()
    }
  }

  public getRemainingSessionTime(): number {
    if (!this.session) return 0
    return Math.max(0, this.session.expiresAt - Date.now())
  }

  public getSessionProgress(): number {
    if (!this.session) return 0
    const elapsed = Date.now() - this.session.loginTime
    const progress = (elapsed / (8 * 60 * 60 * 1000)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  public async extendSession(): Promise<void> {
    try {
      await fetch("/api/auth/admin/extend", { method: "POST" })
      // Refresh session data
      await this.checkServerSession()
    } catch (error) {
      console.error("Failed to extend session:", error)
    }
  }

  public formatTimeRemaining(): string {
    const remaining = this.getRemainingSessionTime()
    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
}

// Singleton instance
const adminAuth = new AdminAuth()

// React hook for using admin authentication
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(adminAuth.isAdmin())

  useEffect(() => {
    const unsubscribe = adminAuth.subscribe(() => {
      setIsAdmin(adminAuth.isAdmin())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isAdmin,
    enableAdminMode: useCallback((password: string) => adminAuth.enableAdminMode(password), []),
    disableAdminMode: useCallback(() => adminAuth.disableAdminMode(), []),
    getRemainingSessionTime: useCallback(() => adminAuth.getRemainingSessionTime(), []),
    getSessionProgress: useCallback(() => adminAuth.getSessionProgress(), []),
    formatTimeRemaining: useCallback(() => adminAuth.formatTimeRemaining(), []),
    extendSession: useCallback(() => adminAuth.extendSession(), []),
  }
}

export default adminAuth
