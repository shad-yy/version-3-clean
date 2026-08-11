"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAdmin } from "@/lib/auth/admin"
import { Shield, ShieldCheck, Clock, LogOut, Settings } from "lucide-react"

export function AdminToggle() {
  const [password, setPassword] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(0)
  const { toast } = useToast()
  const warningShownRef = useRef(false)

  const {
    isAdmin,
    enableAdminMode,
    disableAdminMode,
    getRemainingSessionTime,
    getSessionProgress,
    formatTimeRemaining,
  } = useAdmin()

  const updateProgress = useCallback(() => {
    if (!isAdmin) {
      setSessionProgress(0)
      warningShownRef.current = false
      return
    }

    const remaining = getRemainingSessionTime()
    const progress = getSessionProgress()
    setSessionProgress(progress)

    // Show warning when session is about to expire (30 minutes remaining)
    if (remaining < 30 * 60 * 1000 && remaining > 0 && !warningShownRef.current) {
      warningShownRef.current = true
      toast({
        title: "Session Expiring Soon",
        description: "Your admin session will expire in 30 minutes",
        variant: "destructive",
      })
    }

    // Reset warning if session time increases (shouldn't happen normally)
    if (remaining > 30 * 60 * 1000) {
      warningShownRef.current = false
    }
  }, [isAdmin, getRemainingSessionTime, getSessionProgress, toast])

  useEffect(() => {
    if (!isAdmin) {
      setSessionProgress(0)
      warningShownRef.current = false
      return
    }

    updateProgress()
    const interval = setInterval(updateProgress, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isAdmin, updateProgress])

  const handleLogin = async () => {
    const success = await enableAdminMode(password)
    if (success) {
      setPassword("")
      setIsDialogOpen(false)
      toast({
        title: "Admin Mode Enabled",
        description: "You now have access to admin features",
      })
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid admin password",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    disableAdminMode()
    toast({
      title: "Admin Mode Disabled",
      description: "You have been logged out of admin mode",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-xs text-green-400">
          <Clock className="w-3 h-3" />
          <span>{formatTimeRemaining()}</span>
        </div>

        <div className="hidden sm:block w-16">
          <Progress value={sessionProgress} className="h-1" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Admin</span>
          <LogOut className="w-3 h-3 ml-1 sm:ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
          <Shield className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Admin Authentication
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Admin Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter admin password"
              className="bg-gray-800 border-gray-700 text-white"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white">
              Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
