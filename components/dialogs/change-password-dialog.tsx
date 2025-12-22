"use client"

import * as React from "react"

import { useMutation } from "@tanstack/react-query"
import { Controller, type UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations/auth"
import { toastApiError } from "@/lib/utils/toast"

export type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormData) => authApi.changePassword(values),
    onSuccess: async () => {
      toast.success("Password changed successfully")
      onOpenChange(false)
    },
    onError: (e) => {
      toastApiError("Change password failed", e, "Please try again.")
    },
  })

  const defaultValues: ChangePasswordFormData = React.useMemo(
    () => ({
      oldPassword: "",
      newPassword: "",
    }),
    []
  )

  const onSubmit = async (values: ChangePasswordFormData, form: UseFormReturn<ChangePasswordFormData>) => {
    await mutation.mutateAsync(values)
    form.reset(defaultValues, { keepDefaultValues: false })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change Password"
      description="Enter your current password and choose a new one."
      schema={changePasswordSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText="Update Password"
    >
      {(form) => (
        <>
          <Controller
            name="oldPassword"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  {...field}
                  value={field.value || ""}
                  disabled={mutation.isPending}
                />
                {form.formState.errors.oldPassword ? (
                  <p className="text-sm text-destructive">{String(form.formState.errors.oldPassword.message)}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...field}
                  value={field.value || ""}
                  disabled={mutation.isPending}
                />
                {form.formState.errors.newPassword ? (
                  <p className="text-sm text-destructive">{String(form.formState.errors.newPassword.message)}</p>
                ) : null}
              </div>
            )}
          />
        </>
      )}
    </FormDialog>
  )
}
