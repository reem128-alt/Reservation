"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, CreditCard, Layers, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SidebarItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export function DashboardSidebar({
  locale,
  open,
  onToggle,
}: {
  locale: string
  open: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()

  const items: SidebarItem[] = [
    {
      href: `/${locale}/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/dashboard/users`,
      label: "Users",
      icon: Users,
    },
    {
      href: `/${locale}/dashboard/resource-types`,
      label: "Resource Types",
      icon: Layers,
    },
    {
      href: `/${locale}/dashboard/resources`,
      label: "Resources",
      icon: BookOpen,
    },
    
    {
      href: `/${locale}/dashboard/bookings`,
      label: "Bookings",
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/dashboard/payments`,
      label: "Payments",
      icon: CreditCard,
    },
    {
      href: `/${locale}/dashboard/analytics`,
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: `/${locale}/dashboard/settings`,
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <aside
      className={cn(
        "shrink-0 border-r bg-background overflow-hidden transition-[width] duration-300 ease-in-out",
        open ? "w-64" : "w-24"
      )}
    >
      <div className={cn("h-32 border-b flex items-center", open ? "px-4" : "px-2 justify-center")}>
        <div className={cn("flex items-center", open ? "gap-3" : "gap-0")}> 
          <div className={cn("rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold", open ? "h-10 w-10" : "h-10 w-10")}>
            R
          </div>

          <div
            className={cn(
              "leading-tight transition-all duration-300",
              open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            <div className="font-semibold">Reserve</div>
            <div className="text-xs text-muted-foreground">Dashboard</div>
          </div>
        </div>

        <div className={cn("ml-auto", open ? "block" : "hidden")}>
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Collapse sidebar">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <div className={cn("ml-0", open ? "hidden" : "block")}>
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Expand sidebar">
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="p-2 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                open ? "gap-3 px-3 py-2" : "gap-0 px-2 py-2 justify-center",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span
                className={cn(
                  "transition-all duration-300",
                  open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
