"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive"
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      <DialogContent />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
