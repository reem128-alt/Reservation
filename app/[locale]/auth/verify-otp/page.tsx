"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthLayout } from "@/app/[locale]/auth/auth_layout"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"
import { toastApiError } from "@/lib/utils/toast"
import { useStore } from "@/lib/store/store"

export default function VerifyOTPPage() {
  const router = useRouter()
  const pathname = usePathname()
  const localeSegment = pathname?.split("/")?.[1]
  const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"
  const fetchProfile = useStore((s) => s.fetchProfile)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split("")
      const newOtp = [...otp]
      pastedValue.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + pastedValue.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.some((digit) => !digit)) return

    const otpValue = otp.join("")
    const searchParams = new URLSearchParams(window.location.search)
    const emailFromQuery = searchParams.get("email")
    const email = emailFromQuery || localStorage.getItem("pendingEmail") || ""
    const purposeFromQuery = searchParams.get("purpose")
    const purposeFromStorage = localStorage.getItem("otpPurpose")
    const purpose =
      purposeFromQuery === "LOGIN" || purposeFromQuery === "REGISTER"
        ? purposeFromQuery
        : purposeFromStorage === "LOGIN" || purposeFromStorage === "REGISTER"
          ? purposeFromStorage
          : "REGISTER"

    if (!email) {
      toastApiError("Verification failed", null, "Missing email. Please login again.")
      router.push(`/${locale}/auth/login`)
      return
    }

    try {
      setIsLoading(true)
      const response = await authApi.verifyOtp({ email, code: otpValue, purpose })
      localStorage.setItem("token", response.token)
      localStorage.removeItem("pendingEmail")
      localStorage.removeItem("otpPurpose")
      toast.success("Verification successful", {
        description: response.message,
      })
      const profile = await fetchProfile()
      if (!profile) {
        router.push(`/${locale}`)
        return
      }
      const isAdmin = String(profile.role).toLowerCase() === "admin"
      router.push(isAdmin ? `/${locale}/dashboard` : `/${locale}/user-dashboard`)
    } catch (e) {
      toastApiError("Verification failed", e, "Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const emailFromQuery = searchParams.get("email")
    const email = emailFromQuery || localStorage.getItem("pendingEmail") || ""
    const purposeFromQuery = searchParams.get("purpose")
    const purposeFromStorage = localStorage.getItem("otpPurpose")
    const purpose =
      purposeFromQuery === "LOGIN" || purposeFromQuery === "REGISTER"
        ? purposeFromQuery
        : purposeFromStorage === "LOGIN" || purposeFromStorage === "REGISTER"
          ? purposeFromStorage
          : "REGISTER"

    if (!email) {
      toastApiError("Resend failed", null, "Missing email. Please login again.")
      router.push(`/${locale}/auth/login`)
      return
    }

    try {
      setIsResending(true)
      const response = await authApi.resendOtp({ email, purpose })
      toast.success("Code sent", {
        description: response.message,
      })
      setCountdown(60)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (e) {
      toastApiError("Resend failed", e, "Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const isComplete = otp.every((digit) => digit)
  const canResend = countdown === 0

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your email">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-semibold bg-card border-2 border-border rounded-xl 
                focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all
                text-foreground placeholder:text-muted-foreground"
              placeholder="○"
            />
          ))}
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={!isComplete || isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Verify Email
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{"Didn't receive the code?"}</p>

          {canResend ? (
            <Button
              type="button"
              variant="ghost"
              className="text-accent hover:text-accent/80 font-semibold"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend Code
                </div>
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="font-semibold text-foreground">{countdown}s</span>
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 text-base font-medium"
          onClick={() => {
            const purposeFromQuery = new URLSearchParams(window.location.search).get("purpose")
            const purposeFromStorage = localStorage.getItem("otpPurpose")
            const purpose =
              purposeFromQuery === "LOGIN" || purposeFromQuery === "REGISTER"
                ? purposeFromQuery
                : purposeFromStorage === "LOGIN" || purposeFromStorage === "REGISTER"
                  ? purposeFromStorage
                  : "REGISTER"
            router.push(`/${locale}/auth/${purpose === "LOGIN" ? "login" : "register"}`)
          }}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
      </form>
    </AuthLayout>
  )
}
