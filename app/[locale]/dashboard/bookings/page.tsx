"use client"

import * as React from "react"

import type { CellContext, ColumnDef } from "@tanstack/react-table"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Plus, XCircle } from "lucide-react"
import { toast } from "sonner"

import type { UseFormReturn } from "react-hook-form"

import { BookingFormFields, type BookingResourceOption, type BookingUserOption } from "@/components/forms/booking-form-fields"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { FormDialog } from "@/components/ui/form-dialog"
import { bookingsApi } from "@/lib/api/bookings"
import { resourcesApi, type Resource } from "@/lib/api/resources"
import { usersApi, type User } from "@/lib/api/users"
import { toastApiError } from "@/lib/utils/toast"
import { StatusBadge } from "@/lib/utils/status"
import {
  bookingCreateSchema,
  bookingUpdateSchema,
  type BookingCreateFormData,
  type BookingUpdateFormData,
} from "@/lib/validations/bookings"

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function BookingsPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const bookingsQuery = useQuery({
    queryKey: ["bookings", { page, limit, search }],
    queryFn: () => bookingsApi.list({ page, limit, search: search || undefined }),
  })

  const usersQuery = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => usersApi.list({ page: 1, limit: 1000 }),
  })

  const resourcesQuery = useQuery({
    queryKey: ["resources", "all"],
    queryFn: () => resourcesApi.list({ page: 1, limit: 1000 }),
  })

  const usersOptions = React.useMemo<BookingUserOption[]>(
    () => (usersQuery.data?.data ?? []).map((u: User) => ({ id: u.id, label: `${u.name} (${u.email})` })),
    [usersQuery.data]
  )

  const resourcesOptions = React.useMemo<BookingResourceOption[]>(
    () =>
      (resourcesQuery.data?.data ?? []).flatMap((r: Resource) =>
        r.id ? [{ id: r.id, label: `${r.title} (${r.code})` }] : []
      ),
    [resourcesQuery.data]
  )

  const userIdToLabel = React.useMemo(() => {
    const m = new Map<number, string>()
    for (const u of usersOptions) m.set(u.id, u.label)
    return m
  }, [usersOptions])

  const resourceIdToLabel = React.useMemo(() => {
    const m = new Map<number, string>()
    for (const r of resourcesOptions) m.set(r.id, r.label)
    return m
  }, [resourcesOptions])

  const createMutation = useMutation({
    mutationFn: (data: BookingCreateFormData) => bookingsApi.create(data),
    onSuccess: async () => {
      toast.success("Booking created")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (e) => {
      toastApiError("Create failed", e, "Please try again.")
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingUpdateFormData }) => bookingsApi.update(id, data),
    onSuccess: async () => {
      toast.success("Booking updated")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (e) => {
      toastApiError("Update failed", e, "Please try again.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.delete(id),
    onSuccess: async () => {
      toast.success("Booking deleted")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (e) => {
      toastApiError("Delete failed", e, "Please try again.")
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.confirm(id),
    onSuccess: async () => {
      toast.success("Booking confirmed")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (e) => {
      toastApiError("Confirm failed", e, "Please try again.")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: async () => {
      toast.success("Booking cancelled")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (e) => {
      toastApiError("Cancel failed", e, "Please try again.")
    },
  })

  const onCreateSubmit = async (values: BookingCreateFormData) => {
    await createMutation.mutateAsync(values)
    setCreateOpen(false)
  }

  const onEditSubmit = async (values: BookingUpdateFormData) => {
    if (!selectedBooking?.id) return
    await editMutation.mutateAsync({ id: selectedBooking.id, data: values })
    setEditOpen(false)
    setSelectedBooking(null)
  }

  const createDefaultValues: BookingCreateFormData = {
    userId: 0,
    resourceId: 0,
    startTime: "",
    endTime: "",
    paymentMethodId: "",
  }

  const editDefaultValues = React.useMemo<BookingUpdateFormData>(
    () => ({
      userId: selectedBooking?.userId ?? 0,
      resourceId: selectedBooking?.resourceId ?? 0,
      startTime: selectedBooking?.startTime ?? "",
      endTime: selectedBooking?.endTime ?? "",
      paymentMethodId: selectedBooking?.paymentMethodId ?? "",
    }),
    [selectedBooking]
  )

  const columns = React.useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: "userId",
        header: "User",
        cell: ({ row }: CellContext<Booking, unknown>) => userIdToLabel.get(row.original.userId) ?? String(row.original.userId),
      },
      {
        accessorKey: "resourceId",
        header: "Resource",
        cell: ({ row }: CellContext<Booking, unknown>) => {
          const resource = row.original.resource
          if (resource) {
            return `${resource.title} (${resource.code})`
          }
          return resourceIdToLabel.get(row.original.resourceId) ?? String(row.original.resourceId)
        },
      },
      {
        accessorKey: "startTime",
        header: "Start",
        cell: ({ row }: CellContext<Booking, unknown>) => formatDate(row.original.startTime),
      },
      {
        accessorKey: "endTime",
        header: "End",
        cell: ({ row }: CellContext<Booking, unknown>) => formatDate(row.original.endTime),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: CellContext<Booking, unknown>) => (
          <StatusBadge status={row.original.status} type="booking" />
        ),
      },
      {
        accessorKey: "payment",
        header: "Amount",
        cell: ({ row }: CellContext<Booking, unknown>) => {
          const payment = row.original.payment
          if (payment && payment.amount != null) {
            const currency = payment.currency?.toUpperCase() ?? 'USD'
            return `${payment.amount} ${currency}`
          }
          return "-"
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: CellContext<Booking, unknown>) => {
          const booking = row.original
          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-600/10"
                onClick={() => {
                  setSelectedBooking(booking)
                  setConfirmOpen(true)
                }}
                title="Confirm booking"
                aria-label="Confirm booking"
                disabled={!booking.id}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedBooking(booking)
                  setCancelOpen(true)
                }}
                title="Cancel booking"
                aria-label="Cancel booking"
                disabled={!booking.id}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [resourceIdToLabel, userIdToLabel]
  )

  const data = bookingsQuery.data?.data ?? []
  const isLoading = bookingsQuery.isLoading || usersQuery.isLoading || resourcesQuery.isLoading
  const isError = bookingsQuery.isError || usersQuery.isError || resourcesQuery.isError
  const meta = bookingsQuery.data?.meta

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <DataTableSkeleton columns={6} searchable filterable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage and organize your bookings</p>
      </div>

      {isError ? <p className="text-destructive">Failed to load bookings.</p> : null}

      <DataTable
        columns={columns}
        data={data}
        searchKeys={["paymentMethodId"]}
        searchPlaceholder="Search by payment method id..."
        controlledSearchValue={searchInput}
        onControlledSearchChange={(v: string) => setSearchInput(v)}
        serverPage={meta?.page ?? page}
        serverPageCount={meta?.totalPages ?? 1}
        onServerPageChange={(nextPage: number) => setPage(nextPage)}
        toolbarRight={
          <div className="flex items-center gap-2">
            <ShinyButton onClick={() => setCreateOpen(true)} variant="toolbar">
              <Plus className="h-4 w-4" />
              Create Booking
            </ShinyButton>
          </div>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Booking"
        description="Add a new booking."
        schema={bookingCreateSchema}
        defaultValues={createDefaultValues}
        onSubmit={onCreateSubmit}
        submitText="Create"
      >
        {(form: UseFormReturn<BookingCreateFormData>) => (
          <BookingFormFields form={form} users={usersOptions} resources={resourcesOptions} />
        )}
      </FormDialog>

      <FormDialog
        key={selectedBooking?.id ?? "edit"}
        open={editOpen}
        onOpenChange={(open: boolean) => {
          setEditOpen(open)
          if (!open) setSelectedBooking(null)
        }}
        title="Edit Booking"
        description="Update the booking and save changes."
        schema={bookingUpdateSchema}
        defaultValues={editDefaultValues}
        onSubmit={onEditSubmit}
        submitText="Save"
      >
        {(form: UseFormReturn<BookingUpdateFormData>) => (
          <BookingFormFields form={form} users={usersOptions} resources={resourcesOptions} />
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open: boolean) => {
          setDeleteOpen(open)
          if (!open) setSelectedBooking(null)
        }}
        title="Delete booking?"
        description={selectedBooking ? `This will permanently delete booking #${selectedBooking.id ?? ""}.` : undefined}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!selectedBooking?.id) return
          await deleteMutation.mutateAsync(selectedBooking.id)
          setDeleteOpen(false)
          setSelectedBooking(null)
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open: boolean) => {
          setConfirmOpen(open)
          if (!open) setSelectedBooking(null)
        }}
        title="Confirm booking?"
        description={selectedBooking ? `This will confirm booking #${selectedBooking.id ?? ""}.` : undefined}
        confirmText="Confirm"
        loading={confirmMutation.isPending}
        onConfirm={async () => {
          if (!selectedBooking?.id) return
          await confirmMutation.mutateAsync(selectedBooking.id)
          setConfirmOpen(false)
          setSelectedBooking(null)
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open: boolean) => {
          setCancelOpen(open)
          if (!open) setSelectedBooking(null)
        }}
        title="Cancel booking?"
        description={selectedBooking ? `This will cancel booking #${selectedBooking.id ?? ""}.` : undefined}
        confirmText="Cancel"
        confirmVariant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={async () => {
          if (!selectedBooking?.id) return
          await cancelMutation.mutateAsync(selectedBooking.id)
          setCancelOpen(false)
          setSelectedBooking(null)
        }}
      />
    </div>
  )
}
