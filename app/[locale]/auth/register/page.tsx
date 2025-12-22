"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthLayout } from "@/app/[locale]/auth/auth_layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { authApi } from "@/lib/api/auth"
import { toastApiError } from "@/lib/utils/toast"

export default function RegisterPage() {
  const router = useRouter()
  const pathname = usePathname()
  const localeSegment = pathname?.split("/")?.[1]
  const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      const { confirmPassword: _confirmPassword, ...payload } = data
      void _confirmPassword
      const response = await authApi.register(payload)
      localStorage.setItem("pendingEmail", response.email)
      localStorage.setItem("otpPurpose", "REGISTER")
      toast.success("Account created successfully!", {
        description: response.message
      })
      setTimeout(
        () =>
          router.push(
            `/${locale}/auth/verify-otp?email=${encodeURIComponent(response.email)}&purpose=REGISTER`
          ),
        500
      )
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        const errorMessage = axiosError.response?.data?.message || "Registration failed"
        setError(errorMessage)
        toastApiError("Registration failed", err, errorMessage)
      } else {
        setError("Registration failed")
        toastApiError("Registration failed", err, "Please try again.")
      }
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start booking unforgettable experiences today">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-12 h-12 bg-card border-border"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

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
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="pl-12 pr-12 h-12 bg-card border-border"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}

           
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="pl-12 h-12 bg-card border-border"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Create Account
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-accent hover:text-accent/80 font-medium transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-accent hover:text-accent/80 font-medium transition-colors">
            Privacy Policy
          </Link>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">or</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/${locale}/auth/login`} className="text-accent hover:text-accent/80 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
