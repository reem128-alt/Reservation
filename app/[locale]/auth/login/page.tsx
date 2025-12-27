"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/app/[locale]/auth/auth_layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { toastApiError } from "@/lib/utils/toast";
import { useStore } from "@/lib/store/store";

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1];
  const locale =
    localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const setProfile = useStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const response = await authApi.login(data);

      // Demo/admin shortcut: backend already returned a token, so skip OTP.
      if (response.demo && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("demoAdmin", "true");
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("otpPurpose");
        // Seed store profile so dashboard guard doesn't immediately redirect
        setProfile({
          id: response.id ?? -1,
          email: response.email,
          name: response.name ?? "Demo Admin",
          image: null,
          isVerified: Boolean(response.emailVerified),
          role: response.role ?? "ADMIN",
          createdAt: new Date().toISOString(),
        });
        toast.success("Login successful!", {
          description: response.message,
        });
        const role = response.role ?? "ADMIN";
        const isAdmin = String(role).toLowerCase() === "admin";
        router.push(
          isAdmin ? `/${locale}/dashboard` : `/${locale}/user-dashboard`
        );
        return;
      }

      localStorage.setItem("pendingEmail", response.email);
      localStorage.setItem("otpPurpose", "LOGIN");
      toast.success("Login successful!", {
        description: response.message,
      });
      router.push(
        `/${locale}/auth/verify-otp?email=${encodeURIComponent(
          response.email
        )}&purpose=LOGIN`
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          axiosError.response?.data?.message || "Invalid email or password";
        setError(errorMessage);
        toastApiError("Login failed", err, errorMessage);
      } else {
        setError("Invalid email or password");
        toastApiError("Login failed", err, "Please check your credentials.");
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
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
                autoComplete="off"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href={`/${locale}/auth/forget_password`}
                className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-12 pr-12 h-12 bg-card border-border"
                autoComplete="off"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Sign In
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">or</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground">
          {" Don't have an account?"}{" "}
          <Link
            href={`/${locale}/auth/register`}
            className="text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
