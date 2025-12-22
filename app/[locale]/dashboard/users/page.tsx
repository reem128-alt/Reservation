"use client"

import * as React from "react"

import type { CellContext, ColumnDef } from "@tanstack/react-table"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Pencil, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FormDialog } from "@/components/ui/form-dialog"
import { UserFormFields } from "@/components/forms/user-form-fields"
import { ChatWindow } from "@/components/chat/chat-window"
import { usersApi, type User } from "@/lib/api/users"
import { chatApi } from "@/lib/api/chat"
import { toastApiError } from "@/lib/utils/toast"
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormData,
  type UserUpdateFormData,
} from "@/lib/validations/users"
import { ShinyButton } from "@/components/ui/shiny-button"

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function UsersPage() {
  const pathname = usePathname()
  const router = useRouter()
  const localeSegment = pathname?.split("/")?.[1]
  const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"

  const queryClient = useQueryClient()
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

  const usersQuery = useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: () => usersApi.list({ page, limit, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: async () => {
      toast.success("User deleted")
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (e) => {
      toastApiError("Delete failed", e, "Please try again.")
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: UserCreateFormData) => usersApi.create(data),
    onSuccess: async () => {
      toast.success("User created")
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (e) => {
      toastApiError("Create failed", e, "Please try again.")
    },
  })

  const editMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<Pick<User, "name" | "email" | "role" | "image">>
    }) => usersApi.update(id, data),
    onSuccess: async () => {
      toast.success("User updated")
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (e) => {
      toastApiError("Update failed", e, "Please try again.")
    },
  })

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [chatOpen, setChatOpen] = React.useState(false)
  const [chatUser, setChatUser] = React.useState<User | null>(null)
  const [chatConversationId, setChatConversationId] = React.useState<number | undefined>(undefined)

  const openEdit = React.useCallback(
    (user: User) => {
      setSelectedUser({
        ...user,
        role: user.role ? user.role.trim().toUpperCase() : "USER",
      })
      setEditOpen(true)
    },
    []
  )

  const openDelete = React.useCallback((user: User) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }, [])

  const openChat = React.useCallback(async (user: User) => {
    setChatUser(user)
    setChatOpen(true)
    
    try {
      const conversation = await chatApi.getConversationByUserId(user.id)
      if (conversation) {
        setChatConversationId(conversation.id)
      } else {
        setChatConversationId(undefined)
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error)
      setChatConversationId(undefined)
    }
  }, [])

  const onCreateSubmit = async (values: UserCreateFormData) => {
    await createMutation.mutateAsync(values)
    setCreateOpen(false)
  }

  const onEditSubmit = async (values: UserUpdateFormData) => {
    if (!selectedUser) return
    await editMutation.mutateAsync({ id: selectedUser.id, data: values })
    setEditOpen(false)
    setSelectedUser(null)
  }

  const createDefaultValues: UserCreateFormData = {
    email: "",
    password: "",
    name: "",
    role: "USER",
  }

  const editDefaultValues = React.useMemo<UserUpdateFormData>(
    () => ({
      name: selectedUser?.name ?? "",
      email: selectedUser?.email ?? "",
      role: (selectedUser?.role ? selectedUser.role.trim().toUpperCase() : "USER"),
      image: selectedUser?.image ?? "",
    }),
    [selectedUser]
  )

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: CellContext<User, unknown>) => {
          const imageUrl = row.original.image
          return imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={row.original.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-border">
              <span className="text-xs text-muted-foreground">No Image</span>
            </div>
          )
        },
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: CellContext<User, unknown>) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: CellContext<User, unknown>) => {
          const user = row.original
          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openChat(user)}
                title="Chat with user"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEdit(user)}
                title="Edit user"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => openDelete(user)}
                title="Delete user"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [locale, openChat, openDelete, openEdit, router]
  )

  const data = usersQuery.data?.data ?? []
  const isLoading = usersQuery.isLoading
  const isError = usersQuery.isError
  const meta = usersQuery.data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage and organize your users</p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
      {isError ? <p className="text-destructive">Failed to load users.</p> : null}

      <DataTable
        columns={columns}
        data={data}
        searchKeys={["email", "name"]}
        searchPlaceholder="Search by email or name..."
        controlledSearchValue={searchInput}
        onControlledSearchChange={(v) => setSearchInput(v)}
        serverPage={meta?.page ?? page}
        serverPageCount={meta?.totalPages ?? 1}
        onServerPageChange={(nextPage) => setPage(nextPage)}
        toolbarRight={(
          <ShinyButton
            onClick={() => setCreateOpen(true)}
            variant="toolbar"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </ShinyButton>
        )}
      />

      <FormDialog
        key={selectedUser?.id ?? "edit"}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setSelectedUser(null)
        }}
        title="Edit User"
        description="Update the user information and save changes."
        schema={userUpdateSchema}
        defaultValues={editDefaultValues}
        onSubmit={onEditSubmit}
        submitText="Save"
      >
        {(form) => <UserFormFields form={form} />}
      </FormDialog>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create User"
        description="Add a new user to the system."
        schema={userCreateSchema}
        defaultValues={createDefaultValues}
        onSubmit={onCreateSubmit}
        submitText="Create"
      >
        {(form) => <UserFormFields form={form} includePassword />}
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setSelectedUser(null)
        }}
        title="Delete user?"
        description={selectedUser ? `This will permanently delete ${selectedUser.email}.` : undefined}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!selectedUser) return
          await deleteMutation.mutateAsync(selectedUser.id)
          setDeleteOpen(false)
          setSelectedUser(null)
        }}
      />

      <Dialog open={chatOpen} onOpenChange={(open) => {
        setChatOpen(open)
        if (!open) {
          setChatUser(null)
          setChatConversationId(undefined)
        }
      }}>
        <DialogContent className=" h-[600px] p-0 flex flex-col">
          {chatUser && (
            <ChatWindow 
              initialConversationId={chatConversationId}
              targetUserId={chatUser.id}
              className="h-full"
              onClose={() => {
                setChatOpen(false)
                setChatUser(null)
                setChatConversationId(undefined)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
