"use client"

import type React from "react"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthLayout } from "@/app/[locale]/auth/auth_layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"
import { toastApiError } from "@/lib/utils/toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const pathname = usePathname()
  const localeSegment = pathname?.split("/")?.[1]
  const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await authApi.forgotPassword({ email })
      toast.success("Email sent", {
        description: response.message,
      })
      localStorage.setItem("resetEmail", email)
      router.push(`/${locale}/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (e) {
      toastApiError("Request failed", e, "Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="No worries, we'll send you reset instructions">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-12 h-12 bg-card border-border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Sending...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Send Reset Link
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
