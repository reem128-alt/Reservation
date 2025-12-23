"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, Users, CalendarDays } from "lucide-react"

import { bookingsApi } from "@/lib/api/bookings"
import { statisticsApi } from "@/lib/api/statistics"
import { StatusBadge } from "@/lib/utils/status"
import { formatDateTime, formatMoney, formatMoneyWithCurrency } from "@/lib/utils/format"

type AnyRecord = Record<string, unknown>

 function toAnyRecord(value: unknown): AnyRecord {
   if (value && typeof value === "object") return value as AnyRecord
   return {}
 }

function getString(v: unknown) {
  if (typeof v === "string") return v
  if (typeof v === "number") return String(v)
  return ""
}

function getNumber(v: unknown) {
  if (typeof v === "number") return v
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v)
  return null
}

function pickBookingField(booking: AnyRecord, keys: string[]) {
  for (const k of keys) {
    if (k in booking && booking[k] != null) return booking[k]
  }
  return null
}


function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  tone: "primary" | "secondary" | "accent"
}) {
  const toneClass =
    tone === "secondary"
      ? "from-secondary/20 to-transparent"
      : tone === "accent"
        ? "from-accent/20 to-transparent"
        : "from-primary/20 to-transparent"

  const badgeClass =
    tone === "secondary"
      ? "bg-secondary/15 text-secondary-foreground"
      : tone === "accent"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-primary/15 text-primary"

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border bg-background p-5 shadow-sm transition-all duration-200 " +
        "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      }
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${badgeClass}`}>{icon}</div>
      </div>
    </div>
  )
}

import { PageSkeleton } from "@/components/ui/page-skeleton"

function DashboardSkeleton() {
  return (
    <PageSkeleton 
      header={true}
      stats={3}
      tableRows={5}
      tableCols={5}
    />
  )
}

export default function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["statistics", "detailed"],
    queryFn: statisticsApi.detailed,
  })

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () => bookingsApi.list(),
  })

  // Show loading state while any query is loading
  if (statsQuery.isLoading || bookingsQuery.isLoading) {
    return <DashboardSkeleton />
  }

  const stats = statsQuery.data
  const bookings = bookingsQuery.data?.data ?? []
  const recentBookings = bookings.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your system.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total users"
          tone="primary"
          icon={<Users className="h-4 w-4" />}
          value={
            stats?.totalUsers ?? 0
          }
        />

        <StatCard
          title="Total bookings"
          tone="accent"
          icon={<CalendarDays className="h-4 w-4" />}
          value={
            stats?.totalBookings ?? 0
          }
        />

        <StatCard
          title="Total revenue"
          tone="secondary"
          icon={<DollarSign className="h-4 w-4" />}
          value={
            formatMoney(stats?.totalRevenue ?? 0, "USD", { maximumFractionDigits: 0 })
          }
        />
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gradient-to-r from-muted/40 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold">Recent bookings</div>
              <div className="text-sm text-muted-foreground">Latest activity from /bookings</div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-primary-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-primary-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-primary-foreground">Resource</th>
                <th className="px-4 py-3 font-medium text-primary-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-primary-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                    No recent bookings found
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((row: unknown, index: number) => {
                  const booking = toAnyRecord(row)

                  const id = pickBookingField(booking, ["id", "bookingId", "_id"]) ?? index + 1
                  const status = pickBookingField(booking, ["status", "state"]) ?? "-"

                  const customer =
                    pickBookingField(booking, ["customerName", "name"]) ??
                    (booking.user && typeof booking.user === "object"
                      ? (pickBookingField(booking.user as AnyRecord, ["name", "email"]) ?? "-")
                      : pickBookingField(booking, ["email", "userEmail"]) ?? "-")

                  const resourceObj = booking.resource && typeof booking.resource === "object" 
                    ? booking.resource as AnyRecord 
                    : null
                  
                  const resource = resourceObj
                    ? (pickBookingField(resourceObj, ["title", "name", "code"]) ?? "-")
                    : (pickBookingField(booking, ["resourceName", "resourceTitle"]) ?? "-")

                  const date =
                    pickBookingField(booking, ["createdAt", "date", "startDate", "bookingDate"]) ??
                    "-"

                  const amountRaw = pickBookingField(booking, [
                    "amount",
                    "totalAmount",
                    "totalPrice",
                    "price",
                    "revenue",
                  ])
                  const nestedPaymentAmount =
                    booking.payment && typeof booking.payment === "object"
                      ? pickBookingField(booking.payment as AnyRecord, ["amount", "total", "totalAmount"])
                      : null
                  const nestedPaymentCurrency =
                    booking.payment && typeof booking.payment === "object"
                      ? pickBookingField(booking.payment as AnyRecord, ["currency", "currencyCode"])
                      : null

                  const amountNumber = getNumber(amountRaw ?? nestedPaymentAmount)

                  const statusLabel = getString(status) || "-"

                  return (
                    <tr
                      key={String(id)}
                      className="border-t transition-all duration-200 hover:bg-muted/30 hover:scale-[1.01] hover:shadow-md"
                    >
                      <td className="px-4 py-3">
                        <StatusBadge status={statusLabel} type="booking" />
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate">{getString(customer) || "-"}</td>
                      <td className="px-4 py-3 max-w-[220px] truncate">
                        {getString(resource) || "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(date, undefined, "-")}</td>
                      <td className="px-4 py-3 text-right">
                        {amountNumber == null
                          ? "-"
                          : formatMoneyWithCurrency(amountNumber, nestedPaymentCurrency, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
