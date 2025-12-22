import React from "react"

export type StatusType = "booking" | "payment"

export interface StatusConfig {
  label: string
  className: string
}

export function getStatusConfig(status: string | null | undefined, type: StatusType = "booking"): StatusConfig {
  if (!status) {
    return {
      label: "-",
      className: "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const s = status.toLowerCase()

  if (type === "booking") {
    if (s.includes("confirm") || s.includes("paid") || s.includes("complete") || s.includes("success")) {
      return {
        label: status,
        className: "bg-green-100 text-green-700 border-green-300"
      }
    }
    if (s.includes("pend") || s.includes("hold") || s.includes("process")) {
      return {
        label: status,
        className: "bg-yellow-100 text-yellow-700 border-yellow-300"
      }
    }
    if (s.includes("cancel") || s.includes("fail") || s.includes("reject")) {
      return {
        label: status,
        className: "bg-red-100 text-red-700 border-red-300"
      }
    }
  }

  if (type === "payment") {
    if (s.includes("completed") || s.includes("success") || s.includes("paid")) {
      return {
        label: status,
        className: "bg-green-100 text-green-700 border-green-300"
      }
    }
    if (s.includes("pending") || s.includes("processing")) {
      return {
        label: status,
        className: "bg-yellow-100 text-yellow-700 border-yellow-300"
      }
    }
    if (s.includes("failed") || s.includes("cancelled") || s.includes("refunded")) {
      return {
        label: status,
        className: "bg-red-100 text-red-700 border-red-300"
      }
    }
  }

  return {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-300"
  }
}

export function StatusBadge({ 
  status, 
  type = "booking" 
}: { 
  status: string | null | undefined
  type?: StatusType 
}) {
  const config = getStatusConfig(status, type)
  
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export function bookingStatusVariant(status: string | null | undefined): BadgeVariant {
  const s = (status ?? "").toUpperCase()
  if (s === "CONFIRMED" || s === "COMPLETED") return "default"
  if (s === "CANCELLED" || s === "CANCELED" || s === "FAILED") return "destructive"
  return "secondary"
}

export function paymentStatusVariant(status: string | null | undefined): BadgeVariant {
  const s = (status ?? "").toUpperCase()
  if (s === "COMPLETED" || s === "SUCCEEDED") return "default"
  if (s === "FAILED") return "destructive"
  return "secondary"
}
