"use client"

import * as React from "react"

import type { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type DefaultValues,
  type UseFormReturn,
  useForm,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type FormDialogProps<TSchema extends z.ZodTypeAny> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  schema: TSchema
  defaultValues: DefaultValues<z.infer<TSchema>>
  onSubmit: (values: z.infer<TSchema>, form: UseFormReturn<z.infer<TSchema>>) => void | Promise<void>
  children: (form: UseFormReturn<z.infer<TSchema>>) => React.ReactNode
  submitText?: string
  cancelText?: string
}

export function FormDialog<TSchema extends z.ZodTypeAny>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  children,
  submitText = "Save",
  cancelText = "Cancel",
}: FormDialogProps<TSchema>) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues, { keepDefaultValues: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(defaultValues)])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] p-3">
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values, form)
          })}
          className="flex max-h-[85vh] flex-col"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">{children(form)}</div>
          </div>

          <DialogFooter className="shrink-0 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
              {cancelText}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
