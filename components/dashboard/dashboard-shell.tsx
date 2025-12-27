"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store/store"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export function DashboardShell({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const fetchProfile = useStore((s) => s.fetchProfile)
  const profile = useStore((s) => s.profile)

  useEffect(() => {
    const checkAccess = async () => {
      const isDemoAdmin = typeof window !== "undefined" && localStorage.getItem("demoAdmin") === "true"

      if (isDemoAdmin) {
        return
      }

      if (profile && profile.role === "ADMIN") {
        return
      }

      const userProfile = await fetchProfile()
      
      if (!userProfile) {
        router.push(`/${locale}/auth/login`)
        return
      }

      if (userProfile.role !== "ADMIN") {
        router.push(`/${locale}/user-dashboard`)
      }
    }

    checkAccess()
  }, [fetchProfile, router, locale, profile])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <DashboardSidebar
          locale={locale}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar locale={locale} />

          <main className="flex-1 p-6 min-w-0">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
