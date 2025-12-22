"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, Save, User, Mail, ShieldCheck, Calendar } from "lucide-react"

import { Navbar } from "../components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UserFormFields } from "@/components/forms/user-form-fields"
import { ChangePasswordDialog } from "@/components/dialogs/change-password-dialog"
import { useStore } from "@/lib/store/store"
import { usersApi } from "@/lib/api/users"
import { notificationsApi } from "@/lib/api/notifications"
import { toastApiError } from "@/lib/utils/toast"
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/validations/users"

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? "en"
  
  const profile = useStore((s) => s.profile)
  const fetchProfile = useStore((s) => s.fetchProfile)

  const [isSavingNotifications, setIsSavingNotifications] = React.useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const raw = localStorage.getItem("ui-notifications")
    if (raw === null) return true
    return raw === "true"
  })

  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "USER",
      image: "",
    },
  })

  React.useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  React.useEffect(() => {
    if (!profile) return
    form.reset(
      {
        email: profile.email || "",
        name: profile.name || "",
        role: profile.role || "USER",
        image: profile.image || "",
      },
      { keepDefaultValues: false }
    )
  }, [form, profile])

  const updateMutation = useMutation({
    mutationFn: async (values: ProfileUpdateFormData) => {
      if (!profile) throw new Error("Profile not loaded")
      const payload: {
        email: string
        name: string
        role: string
        image: string
      } = {
        email: values.email,
        name: values.name,
        role: values.role,
        image: values.image || "",
      }

      return usersApi.update(profile.id, payload)
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully")
      await fetchProfile()
    },
    onError: (e) => {
      toastApiError("Update failed", e, "Please try again.")
    },
  })

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-background p-3">
      <Navbar />

      <main className="container py-8 max-w-4xl p-3">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/user-dashboard`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit(async (values) => {
                    await updateMutation.mutateAsync(values)
                  })}
                  className="space-y-4"
                >
                  <UserFormFields form={form} showEmail={false} showRole={false} />

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={updateMutation.isPending || !profile}
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium mt-1">{profile?.email || "N/A"}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          profile?.isVerified
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {profile?.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Role & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="text-sm font-medium mt-1">{profile?.role || "USER"}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      </main>
    </div>
  )
}
