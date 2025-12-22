"use client"

import * as React from "react"

import type { CellContext, ColumnDef } from "@tanstack/react-table"

import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/ui/data-table"
import { paymentsApi, type Payment } from "@/lib/api/payments"
import { StatusBadge } from "@/lib/utils/status"

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency.toUpperCase()}`
  }
}

function formatPaymentMethodDetails(payment: Payment) {
  const d = payment.paymentMethodDetails
  if (!d) return null

  const brand = d.brand?.trim() || d.type?.trim() || ""
  const last4 = d.last4?.trim() || ""
  const expMonth = typeof d.expMonth === "number" ? String(d.expMonth).padStart(2, "0") : ""
  const expYear = typeof d.expYear === "number" ? String(d.expYear) : ""
  const expiry = expMonth && expYear ? `${expMonth}/${expYear}` : ""
  const country = d.country?.trim() || ""
  const postal = d.billingPostalCode?.trim() || ""

  const parts = [
    brand ? brand : null,
    last4 ? `•••• ${last4}` : null,
    expiry ? `(${expiry})` : null,
    country ? country : null,
    postal ? postal : null,
  ].filter(Boolean)

  if (!parts.length) return null
  return parts.join(" ")
}


export default function PaymentsPage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const paymentsQuery = useQuery({
    queryKey: ["payments", { page, limit, search }],
    queryFn: () => paymentsApi.list({ page, limit, search: search || undefined }),
  })

  const columns = React.useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Payment ID",
        cell: ({ row }: CellContext<Payment, unknown>) => (
          <span className="font-mono text-xs">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "bookingId",
        header: "Booking ID",
        cell: ({ row }: CellContext<Payment, unknown>) => `#${row.original.bookingId}`,
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }: CellContext<Payment, unknown>) => {
          const user = row.original.booking?.user
          if (user) {
            return `${user.name} (${user.email})`
          }
          return "-"
        },
      },
      {
        accessorKey: "resource",
        header: "Resource",
        cell: ({ row }: CellContext<Payment, unknown>) => {
          const resource = row.original.booking?.resource
          if (resource) {
            return `${resource.title} (${resource.code})`
          }
          return "-"
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }: CellContext<Payment, unknown>) => 
          formatAmount(row.original.amount, row.original.currency),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: CellContext<Payment, unknown>) => (
          <StatusBadge status={row.original.status} type="payment" />
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }: CellContext<Payment, unknown>) => {
          const details = formatPaymentMethodDetails(row.original)
          if (details) return <span className="font-mono text-xs">{details}</span>

          const method = row.original.paymentMethod
          if (method) return <span className="font-mono text-xs">{method}</span>

          return "-"
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: CellContext<Payment, unknown>) => formatDate(row.original.createdAt),
      },
    ],
    []
  )

  const data = paymentsQuery.data?.data ?? []
  const isLoading = paymentsQuery.isLoading
  const isError = paymentsQuery.isError
  const meta = paymentsQuery.data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">View and track all payment transactions</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
      {isError ? <p className="text-destructive">Failed to load payments.</p> : null}

      <DataTable
        columns={columns}
        data={data}
        searchKeys={["id", "stripePaymentId", "paymentMethod"]}
        searchPlaceholder="Search by payment ID or method..."
        controlledSearchValue={searchInput}
        onControlledSearchChange={(v: string) => setSearchInput(v)}
        serverPage={meta?.page ?? page}
        serverPageCount={meta?.totalPages ?? 1}
        onServerPageChange={(nextPage: number) => setPage(nextPage)}
      />
    </div>
  )
}
