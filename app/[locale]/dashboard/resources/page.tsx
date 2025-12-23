"use client"

import * as React from "react"

import Image from "next/image"

import type { CellContext, ColumnDef } from "@tanstack/react-table"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { toast } from "sonner"

import { AvailabilityFormFields } from "@/components/forms/availability-form-fields"
import { ResourceFormFields } from "@/components/forms/resource-form-fields"
import { SchedulesDialog } from "@/components/dialogs/schedules-dialog"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { FormDialog } from "@/components/ui/form-dialog"
import { cloudinaryApi } from "@/lib/api/cloudinary"
import { resourcesApi, type Resource, type ResourceDetails } from "@/lib/api/resources"
import { resourceTypesApi } from "@/lib/api/resource-types"
import { toastApiError } from "@/lib/utils/toast"
import {
  availabilityCreateSchema,
  resourceCreateSchema,
  resourceUpdateSchema,
  type AvailabilityCreateFormData,
  type ResourceCreateFormData,
  type ResourceUpdateFormData,
} from "@/lib/validations/resources"

function formatMeta(meta: Record<string, unknown> | undefined) {
  if (!meta) return ""
  const entries = Object.entries(meta)
  if (entries.length === 0) return ""
  return entries
    .map(([k, v]) => {
      if (v === null) return `${k}: null`
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return `${k}: ${String(v)}`
      try {
        return `${k}: ${JSON.stringify(v)}`
      } catch {
        return `${k}: [object]`
      }
    })
    .join(", ")
}

function resolveLucideIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const direct = (LucideIcons as any)[iconName]
  if (direct && typeof direct === "function") return direct

  const shouldConvert = iconName.includes("-") || iconName.includes("_") || iconName === iconName.toLowerCase()
  if (!shouldConvert) return null

  const pascalCaseName = iconName
    .split(/[-_]/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const converted = (LucideIcons as any)[pascalCaseName]
  if (converted && typeof converted === "function") return converted

  return null
}

export default function ResourcesPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [availabilityOpen, setAvailabilityOpen] = React.useState(false)
  const [schedulesOpen, setSchedulesOpen] = React.useState(false)
  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const resourcesQuery = useQuery({
    queryKey: ["resources", { page, limit, search }],
    queryFn: () => resourcesApi.list({ page, limit, search: search || undefined }),
  })

  const resourceTypesQuery = useQuery({
    queryKey: ["resource-types"],
    queryFn: () => resourceTypesApi.list({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: async (data: ResourceCreateFormData) => {
      let imageUrl: string | undefined = undefined
      
      if (data.image instanceof File) {
        const uploadResult = await cloudinaryApi.upload(data.image)
        imageUrl = uploadResult.url
      } else if (typeof data.image === "string") {
        imageUrl = data.image
      }
      
      return resourcesApi.create({
        ...data,
        image: imageUrl,
        locationText: data.locationText?.trim() ? data.locationText.trim() : undefined,
      })
    },
    onSuccess: async () => {
      toast.success("Resource created")
      await queryClient.invalidateQueries({ queryKey: ["resources"] })
    },
    onError: (e) => {
      toastApiError("Create failed", e, "Please try again.")
    },
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ResourceUpdateFormData }) => {
      let imageUrl: string | undefined = undefined
      
      if (data.image instanceof File) {
        const uploadResult = await cloudinaryApi.upload(data.image)
        imageUrl = uploadResult.url
      } else if (typeof data.image === "string") {
        imageUrl = data.image
      }
      
      return resourcesApi.update(id, {
        ...data,
        image: imageUrl,
        locationText: data.locationText?.trim() ? data.locationText.trim() : undefined,
      })
    },
    onSuccess: async () => {
      toast.success("Resource updated")
      await queryClient.invalidateQueries({ queryKey: ["resources"] })
    },
    onError: (e) => {
      toastApiError("Update failed", e, "Please try again.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resourcesApi.delete(id),
    onSuccess: async () => {
      toast.success("Resource deleted")
      await queryClient.invalidateQueries({ queryKey: ["resources"] })
    },
    onError: (e) => {
      toastApiError("Delete failed", e, "Please try again.")
    },
  })

  const availabilityMutation = useMutation({
    mutationFn: (data: AvailabilityCreateFormData) => resourcesApi.createAvailability(data),
    onSuccess: async () => {
      toast.success("Timeslot created")
      await queryClient.invalidateQueries({ queryKey: ["resources"] })
    },
    onError: (e) => {
      toastApiError("Create timeslot failed", e, "Please try again.")
    },
  })

  const onCreateSubmit = async (values: ResourceCreateFormData) => {
    await createMutation.mutateAsync(values)
    setCreateOpen(false)
  }

  const onEditSubmit = async (values: ResourceUpdateFormData) => {
    if (!selectedResource?.id) return
    await editMutation.mutateAsync({ id: selectedResource.id, data: values })
    setEditOpen(false)
    setSelectedResource(null)
  }

  const onAvailabilitySubmit = async (values: AvailabilityCreateFormData) => {
    await availabilityMutation.mutateAsync(values)
    setAvailabilityOpen(false)
    setSelectedResource(null)
  }

  const createDefaultValues: ResourceCreateFormData = {
    code: "",
    title: "",
    resourceTypeId: 0,
    price: 0,
    image: "",
    description: "",
    capacity: 0,
    locationText: "",
    latitude: undefined,
    longitude: undefined,
    meta: {},
  }

  const editDefaultValues = React.useMemo<ResourceUpdateFormData>(
    () => ({
      code: selectedResource?.code ?? "",
      title: selectedResource?.title ?? "",
      resourceTypeId: selectedResource?.resourceTypeId ?? 0,
      price: selectedResource?.price ?? 0,
      image: selectedResource?.image ?? "",
      description: selectedResource?.description ?? "",
      capacity: selectedResource?.capacity ?? 0,
      locationText: selectedResource?.locationText ?? "",
      latitude: selectedResource?.latitude ?? undefined,
      longitude: selectedResource?.longitude ?? undefined,
      meta: selectedResource?.meta ?? {},
    }),
    [selectedResource]
  )

  const availabilityDefaultValues = React.useMemo<AvailabilityCreateFormData>(
    () => ({
      resourceId: selectedResource?.id ?? 0,
      startTime: "",
      endTime: "",
      isAvailable: true,
    }),
    [selectedResource]
  )

  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "locationText",
        header: "Location",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const text = row.original.locationText?.trim()
          if (text) return text
          const lat = row.original.latitude
          const lng = row.original.longitude
          if (typeof lat === "number" && typeof lng === "number") {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          }
          return "-"
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const price = row.original.price
          if (price == null) return "-"
          return <span className="font-mono text-xs">{String(price)}</span>
        },
      },
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const src = row.original.image ? String(row.original.image) : ""
          if (!src) return ""
          return (
            <div className="h-10 w-10 overflow-hidden rounded-md border">
              <Image src={src} alt={row.original.title || "Resource"} width={40} height={40} className="h-10 w-10 object-cover" />
            </div>
          )
        },
      },
      {
        accessorKey: "resourceType",
        header: "Type",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const resourceType = row.original.resourceType
          if (!resourceType) return "-"

          const IconComponent = resourceType.icon ? resolveLucideIcon(resourceType.icon) : null
          
          return (
            <div className="flex items-center gap-2">
              {IconComponent && typeof IconComponent === "function" && (
                <IconComponent className="h-4 w-4" />
              )}
              <span>{resourceType.label}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
      },
      {
        accessorKey: "meta",
        header: "Meta",
        cell: ({ row }: CellContext<Resource, unknown>) => formatMeta(row.original.meta),
      },
      {
        id: "schedules",
        header: "Schedules",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const resource = row.original
          const resourceDetails = resourcesQuery.data?.data.find((r) => r.id === resource.id) as ResourceDetails | undefined
          const scheduleCount = resourceDetails?.schedules?.length ?? 0
          const pricingSample = resourceDetails?.schedules?.find((s) => s.pricing)?.pricing
          
          if (scheduleCount === 0) {
            return <span className="text-muted-foreground text-sm">No schedules</span>
          }
          
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedResource(resource)
                setSchedulesOpen(true)
              }}
              disabled={!resource.id}
            >
              <span className="flex items-center gap-2">
                <span>View ({scheduleCount})</span>
                {pricingSample ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    Est: {String(pricingSample.estimatedCost)} {pricingSample.currency}
                  </span>
                ) : null}
              </span>
            </Button>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: CellContext<Resource, unknown>) => {
          const resource = row.original
          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedResource(resource)
                  setAvailabilityOpen(true)
                }}
                title="Add timeslot"
                disabled={!resource.id}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedResource(resource)
                  setEditOpen(true)
                }}
                title="Edit resource"
                disabled={!resource.id}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSelectedResource(resource)
                  setDeleteOpen(true)
                }}
                title="Delete resource"
                disabled={!resource.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [resourcesQuery.data?.data, setSelectedResource, setSchedulesOpen, setAvailabilityOpen, setEditOpen, setDeleteOpen]
  )

  const data = resourcesQuery.data?.data ?? []
  const isLoading = resourcesQuery.isLoading || resourceTypesQuery.isLoading
  const isError = resourcesQuery.isError || resourceTypesQuery.isError
  const meta = resourcesQuery.data?.meta

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <DataTableSkeleton columns={4} searchable filterable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-1">Manage your resources and their availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <ShinyButton onClick={() => setCreateOpen(true)} variant="toolbar">
            <Plus className="h-4 w-4" />
            Create Resource
          </ShinyButton>
          <Button variant="outline" onClick={() => setAvailabilityOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Add Timeslot
          </Button>
          <Button variant="outline" onClick={() => setSchedulesOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            View Schedules
          </Button>
        </div>
      </div>

      {isError ? <p className="text-destructive">Failed to load resources.</p> : null}

      <DataTable
        columns={columns}
        data={data}
        searchKeys={["code", "title", "type", "locationText"]}
        searchPlaceholder="Search by code, title, type, or location..."
        controlledSearchValue={searchInput}
        onControlledSearchChange={(v) => setSearchInput(v)}
        serverPage={meta?.page ?? page}
        serverPageCount={meta?.totalPages ?? 1}
        onServerPageChange={(nextPage) => setPage(nextPage)}
        toolbarRight={
          <ShinyButton onClick={() => setCreateOpen(true)} variant="toolbar">
            <Plus className="h-4 w-4" />
            Create Resource
          </ShinyButton>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Resource"
        description="Add a new resource to the system."
        schema={resourceCreateSchema}
        defaultValues={createDefaultValues}
        onSubmit={onCreateSubmit}
        submitText="Create"
      >
        {(form) => <ResourceFormFields form={form} resourceTypes={resourceTypesQuery.data?.data ?? []} />}
      </FormDialog>

      <FormDialog
        key={selectedResource?.id ?? "edit"}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setSelectedResource(null)
        }}
        title="Edit Resource"
        description="Update the resource information and save changes."
        schema={resourceUpdateSchema}
        defaultValues={editDefaultValues}
        onSubmit={onEditSubmit}
        submitText="Save"
      >
        {(form) => <ResourceFormFields form={form} resourceTypes={resourceTypesQuery.data?.data ?? []} />}
      </FormDialog>

      <SchedulesDialog
        open={schedulesOpen}
        onOpenChange={(open) => {
          setSchedulesOpen(open)
          if (!open) setSelectedResource(null)
        }}
        resource={selectedResource}
        resourceDetails={
          selectedResource && resourcesQuery.data?.data
            ? (resourcesQuery.data.data.find((r) => r.id === selectedResource.id) as ResourceDetails | undefined)
            : undefined
        }
      />

      <FormDialog
        key={selectedResource?.id ? `availability-${selectedResource.id}` : "availability"}
        open={availabilityOpen}
        onOpenChange={(open) => {
          setAvailabilityOpen(open)
          if (!open) setSelectedResource(null)
        }}
        title="Add Timeslot"
        description="Create a new availability timeslot for this resource."
        schema={availabilityCreateSchema}
        defaultValues={availabilityDefaultValues}
        onSubmit={onAvailabilitySubmit}
        submitText="Create"
      >
        {(form) => (
          <AvailabilityFormFields
            form={form}
            resources={data.filter((r): r is Resource & { id: number } => typeof r.id === "number")}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setSelectedResource(null)
        }}
        title="Delete resource?"
        description={selectedResource ? `This will permanently delete ${selectedResource.code}.` : undefined}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!selectedResource?.id) return
          await deleteMutation.mutateAsync(selectedResource.id)
          setDeleteOpen(false)
          setSelectedResource(null)
        }}
      />
    </div>
  )
}
