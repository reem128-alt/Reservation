"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100vw-2rem)] max-w-lg rounded-2xl border bg-background p-0 text-foreground shadow-2xl",
          "overflow-visible",
          "transition duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 p-6 pb-2", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-2", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)} {...props} />
}
