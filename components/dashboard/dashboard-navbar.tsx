"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Globe, LogOut, ShieldCheck, User } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useStore } from "@/lib/store/store"

function switchLocale(pathname: string, nextLocale: string) {
  const parts = pathname.split("/")
  // pathname starts with "/{locale}" in this app
  if (parts.length > 1) {
    parts[1] = nextLocale
    return parts.join("/") || `/${nextLocale}`
  }
  return `/${nextLocale}`
}

export function DashboardNavbar({ locale }: { locale: string }) {
  const pathname = usePathname() || `/${locale}/dashboard`
  const router = useRouter()
  const otherLocale = locale === "ar" ? "en" : "ar"

  const profile = useStore((s) => s.profile)
  const fetchProfile = useStore((s) => s.fetchProfile)
  const clearAuth = useStore((s) => s.clearAuth)

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const initials = useMemo(() => {
    const name = profile?.name?.trim()
    if (!name) return "U"
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? "U"
    const second = parts[1]?.[0] ?? ""
    return (first + second).toUpperCase()
  }, [profile?.name])

  const handleLogout = async () => {
    clearAuth()
    setMenuOpen(false)
    router.push(`/${locale}/auth/login`)
  }

  return (
    <header className="h-14 z-10 border-b bg-background px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-muted-foreground">Welcome</div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {/* <Button asChild variant="ghost" size="sm">
          <Link href={switchLocale(pathname, otherLocale)} className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">{otherLocale.toUpperCase()}</span>
          </Link>
        </Button> */}

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-2.5"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {profile?.image ? (
              <div className="h-7 w-7 rounded-full overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.image}
                  alt={profile.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {initials}
              </div>
            )}
            <div className="ml-2 hidden sm:block text-left leading-tight">
              <div className="text-sm font-medium">
                {profile?.name ?? "Profile"}
              </div>
            
            </div>
          </Button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl border bg-background shadow-lg overflow-hidden"
              role="menu"
            >
              <div className="p-4 border-b">
                <div className="flex items-start gap-3">
                  {profile?.image ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.image}
                        alt={profile.name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {profile?.name ?? "Unknown user"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {profile?.email ?? ""}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{profile?.role ?? "USER"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
               

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
