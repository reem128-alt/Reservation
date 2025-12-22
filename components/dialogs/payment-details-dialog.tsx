"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { Payment } from "@/lib/api/payments"

export type PaymentDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
}

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

function ValueCell({ value }: { value: React.ReactNode }) {
  return <span className="font-mono text-xs break-all">{value ?? "-"}</span>
}

export function PaymentDetailsDialog({ open, onOpenChange, payment }: PaymentDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Payment Details</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Payment ID</TableCell>
              <TableCell><ValueCell value={payment?.id ?? "-"} /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Stripe Payment ID</TableCell>
              <TableCell><ValueCell value={payment?.stripePaymentId ?? "-"} /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Booking ID</TableCell>
              <TableCell><ValueCell value={payment?.bookingId != null ? `#${payment.bookingId}` : "-"} /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell>
                <ValueCell value={payment ? formatAmount(payment.amount, payment.currency) : "-"} />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell><ValueCell value={payment?.status ?? "-"} /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Payment Method Details</TableCell>
              <TableCell>
                <ValueCell value={payment ? formatPaymentMethodDetails(payment) ?? payment.paymentMethod ?? "-" : "-"} />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">Created</TableCell>
              <TableCell><ValueCell value={payment?.createdAt ? formatDate(payment.createdAt) : "-"} /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
