import type React from "react"
import { CalendarDays } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/image.png')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-xl">
              <CalendarDays className="h-8 w-8" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">Reserve</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-balance">
              Book Your Next
              <br />
              Unforgettable Experience
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
              Seamless reservations for restaurants, events, and exclusive experiences. Your perfect moment awaits.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-primary-foreground/60">
            <span>© 2025 Reserve</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="p-2 bg-primary rounded-xl">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Reserve</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
