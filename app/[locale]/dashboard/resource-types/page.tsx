"use client"

import * as React from "react"

import type { CellContext, ColumnDef } from "@tanstack/react-table"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2, Plus, HelpCircle } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { toast } from "sonner"
import type { UseFormReturn } from "react-hook-form"

import { ResourceTypeFormFields } from "@/components/forms/resource-type-form-fields"
import { Button } from "@/components/ui/button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable } from "@/components/ui/data-table"
import { FormDialog } from "@/components/ui/form-dialog"
import { resourceTypesApi } from "@/lib/api/resource-types"
import { toastApiError } from "@/lib/utils/toast"
import {
  resourceTypeCreateSchema,
  resourceTypeUpdateSchema,
  type ResourceTypeCreateFormData,
  type ResourceTypeUpdateFormData,
} from "@/lib/validations/resource-types"

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function ResourceTypesPage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [selectedResourceType, setSelectedResourceType] = React.useState<ResourceType | null>(null)

  const queryClient = useQueryClient()

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const resourceTypesQuery = useQuery({
    queryKey: ["resource-types", { page, limit, search }],
    queryFn: () => resourceTypesApi.list({ page, limit, search: search || undefined }),
  })

  const createDefaultValues: ResourceTypeCreateFormData = {
    name: "",
    label: "",
    description: "",
    icon: "",
    isActive: true,
  }

  const editDefaultValues = React.useMemo<ResourceTypeUpdateFormData>(
    () => ({
      name: selectedResourceType?.name ?? "",
      label: selectedResourceType?.label ?? "",
      description: selectedResourceType?.description ?? "",
      icon: selectedResourceType?.icon ?? "",
      isActive: selectedResourceType?.isActive ?? true,
    }),
    [selectedResourceType]
  )

  const createMutation = useMutation({
    mutationFn: resourceTypesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-types"] })
      toast.success("Resource type created successfully")
    },
    onError: (e) => {
      toastApiError("Failed to create resource type", e)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResourceTypeUpdateFormData }) =>
      resourceTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-types"] })
      toast.success("Resource type updated successfully")
    },
    onError: (e) => {
      toastApiError("Failed to update resource type", e)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: resourceTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-types"] })
      toast.success("Resource type deleted successfully")
    },
    onError: (e) => {
      toastApiError("Failed to delete resource type", e)
    },
  })

  const onCreateSubmit = async (values: ResourceTypeCreateFormData) => {
    await createMutation.mutateAsync(values)
    setCreateOpen(false)
  }

  const onEditSubmit = async (values: ResourceTypeUpdateFormData) => {
    if (!selectedResourceType?.id) return
    await updateMutation.mutateAsync({ id: selectedResourceType.id, data: values })
    setEditOpen(false)
    setSelectedResourceType(null)
  }

  const columns = React.useMemo<ColumnDef<ResourceType>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "label",
        header: "Label",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: CellContext<ResourceType, unknown>) => row.original.description || "-",
      },
      // {
      //   accessorKey: "icon",
      //   header: "Icon",
      //   cell: ({ row }: CellContext<ResourceType, unknown>) => {
      //     const iconName = row.original.icon
      //     if (!iconName) return "-"

      //     const IconComponent = resolveLucideIcon(iconName)
          
      //     return (
      //       <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
      //         {IconComponent && typeof IconComponent === "function" ? (
      //           <IconComponent className="h-5 w-5 text-foreground" />
      //         ) : (
      //           <HelpCircle className="h-5 w-5 text-muted-foreground" />
      //         )}
      //       </div>
      //     )
      //   },
      // },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }: CellContext<ResourceType, unknown>) => (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
              row.original.isActive
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "_count",
        header: "Resources",
        cell: ({ row }: CellContext<ResourceType, unknown>) => row.original._count?.resources ?? 0,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: CellContext<ResourceType, unknown>) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : "-",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: CellContext<ResourceType, unknown>) => {
          const resourceType = row.original
          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedResourceType(resourceType)
                  setEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedResourceType(resourceType)
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const data = resourceTypesQuery.data?.data ?? []
  const isLoading = resourceTypesQuery.isLoading
  const isError = resourceTypesQuery.isError
  const meta = resourceTypesQuery.data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Types</h1>
        <p className="text-muted-foreground mt-1">Manage resource type categories</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
      {isError ? <p className="text-destructive">Failed to load resource types.</p> : null}

      <DataTable
        columns={columns}
        data={data}
        searchKeys={["name", "label"]}
        searchPlaceholder="Search by name or label..."
        controlledSearchValue={searchInput}
        onControlledSearchChange={(v: string) => setSearchInput(v)}
        serverPage={meta?.page ?? page}
        serverPageCount={meta?.totalPages ?? 1}
        onServerPageChange={(nextPage: number) => setPage(nextPage)}
        toolbarRight={
          <ShinyButton onClick={() => setCreateOpen(true)} variant="toolbar">
            <Plus className="h-4 w-4" />
            Add Resource Type
          </ShinyButton>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Resource Type"
        description="Add a new resource type category"
        schema={resourceTypeCreateSchema}
        defaultValues={createDefaultValues}
        onSubmit={onCreateSubmit}
        submitText="Create"
      >
        {(form: UseFormReturn<ResourceTypeCreateFormData>) => (
          <ResourceTypeFormFields form={form} />
        )}
      </FormDialog>

      <FormDialog
        key={selectedResourceType?.id ?? "edit"}
        open={editOpen}
        onOpenChange={(open: boolean) => {
          setEditOpen(open)
          if (!open) setSelectedResourceType(null)
        }}
        title="Edit Resource Type"
        description="Update resource type information"
        schema={resourceTypeUpdateSchema}
        defaultValues={editDefaultValues}
        onSubmit={onEditSubmit}
        submitText="Save"
      >
        {(form: UseFormReturn<ResourceTypeUpdateFormData>) => (
          <ResourceTypeFormFields form={form} />
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open: boolean) => {
          setDeleteOpen(open)
          if (!open) setSelectedResourceType(null)
        }}
        title="Delete Resource Type"
        description={selectedResourceType ? `This will permanently delete resource type "${selectedResourceType.label}".` : undefined}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!selectedResourceType?.id) return
          await deleteMutation.mutateAsync(selectedResourceType.id)
          setDeleteOpen(false)
          setSelectedResourceType(null)
        }}
      />
    </div>
  )
}
