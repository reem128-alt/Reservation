"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useTheme } from "@/lib/providers/theme-provider"
import { notificationsApi } from "@/lib/api/notifications"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toastApiError } from "@/lib/utils/toast"
import { toast } from "sonner"

type Theme = "dark" | "light" | "system"

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [isSavingNotifications, setIsSavingNotifications] = React.useState(false)

  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const raw = localStorage.getItem("ui-notifications")
    if (raw === null) return true
    return raw === "true"
  })

  const [compactMode, setCompactMode] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const raw = localStorage.getItem("ui-compact")
    if (raw === null) return false
    return raw === "true"
  })


  React.useEffect(() => {
    localStorage.setItem("ui-compact", String(compactMode))
  }, [compactMode])

  const currentLocale = React.useMemo(() => {
    if (!pathname) return "en"
    const segments = pathname.split("/")
    return segments[1] || "en"
  }, [pathname])

  const onChangeLocale = (nextLocale: string) => {
    if (!pathname) return
    const segments = pathname.split("/")
    segments[1] = nextLocale
    router.push(segments.join("/"))
  }

  const onToggleNotifications = async (nextValue: boolean) => {
    const prevValue = notificationsEnabled
    setNotificationsEnabled(nextValue)
    setIsSavingNotifications(true)

    try {
      await notificationsApi.updateSettings({ notificationsEnabled: nextValue })
      localStorage.setItem("ui-notifications", String(nextValue))
      toast.success("Notification settings updated successfully!")
    } catch (err: unknown) {
      setNotificationsEnabled(prevValue)
      toastApiError("Failed to update notification settings", err)
    } finally {
      setIsSavingNotifications(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Update your preferences here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme and UI preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger id="theme" className="max-w-sm">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="compact"
              checked={compactMode}
              onCheckedChange={(v) => setCompactMode(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="compact">Compact mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing to fit more content.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Choose your language.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select value={currentLocale} onValueChange={onChangeLocale}>
              <SelectTrigger id="language" className="max-w-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control reminders and alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="notifications"
              checked={notificationsEnabled}
              disabled={isSavingNotifications}
              onCheckedChange={(v) => onToggleNotifications(v === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="notifications">Enable notifications</Label>
              <p className="text-sm text-muted-foreground">Show in-app notifications when important events happen.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
