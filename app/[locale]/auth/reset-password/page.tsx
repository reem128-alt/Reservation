"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthLayout } from "@/app/[locale]/auth/auth_layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Lock } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"
import { toastApiError } from "@/lib/utils/toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const pathname = usePathname()
  const localeSegment = pathname?.split("/")?.[1]
  const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const emailFromQuery = new URLSearchParams(window.location.search).get("email")
    const storedEmail = localStorage.getItem("resetEmail")
    const resolvedEmail = emailFromQuery || storedEmail || ""

    if (!resolvedEmail) {
      toastApiError("Missing email", null, "Please start from forgot password again.")
      router.push(`/${locale}/auth/forget_password`)
      return
    }

    setEmail(resolvedEmail)
  }, [locale, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    try {
      setIsLoading(true)
      const response = await authApi.resetPassword({ email, code, newPassword })
      toast.success("Password updated", {
        description: response.message,
      })
      localStorage.removeItem("resetEmail")
      router.push(`/${locale}/auth/login`)
    } catch (e) {
      toastApiError("Reset failed", e, "Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter the OTP and your new password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input id="email" type="email" value={email} disabled className="h-12 bg-card border-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Verification code
          </Label>
          <Input
            id="code"
            inputMode="numeric"
            placeholder="Enter the code sent to your email"
            className="h-12 bg-card border-border"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              className="pl-12 h-12 bg-card border-border"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Updating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Update Password
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 text-base font-medium"
          onClick={() => router.push(`/${locale}/auth/login`)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Sign In
        </Button>
      </form>
    </AuthLayout>
  )
}
