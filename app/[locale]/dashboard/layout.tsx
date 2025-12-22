import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams?.locale ?? "en"

  return (
    <DashboardShell locale={locale}>{children}</DashboardShell>
  )
}
