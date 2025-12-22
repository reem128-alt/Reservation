"use client"

import * as React from "react"

import { Controller, type UseFormReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type BookingUserOption = {
  id: number
  label: string
}

export type BookingResourceOption = {
  id: number
  label: string
}

interface BookingFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  users: BookingUserOption[]
  resources: BookingResourceOption[]
}

function toDatetimeLocalValue(iso: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(v: string) {
  if (!v) return ""
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString()
}

export function BookingFormFields({ form, users, resources }: BookingFormFieldsProps) {
  return (
    <>
      <Controller
        name="userId"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="userId">User</Label>
            <Select value={String(field.value ?? "")} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger id="userId">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userId ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.userId.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="resourceId"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="resourceId">Resource</Label>
            <Select value={String(field.value ?? "")} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger id="resourceId">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.resourceId ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.resourceId.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="startTime"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={toDatetimeLocalValue(String(field.value ?? ""))}
              onChange={(e) => field.onChange(fromDatetimeLocalValue(e.target.value))}
            />
            {form.formState.errors.startTime ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.startTime.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="endTime"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={toDatetimeLocalValue(String(field.value ?? ""))}
              onChange={(e) => field.onChange(fromDatetimeLocalValue(e.target.value))}
            />
            {form.formState.errors.endTime ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.endTime.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="paymentMethodId"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="paymentMethodId">Payment method</Label>
            <Input id="paymentMethodId" {...field} value={field.value || ""} />
            {form.formState.errors.paymentMethodId ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.paymentMethodId.message)}</p>
            ) : null}
          </div>
        )}
      />
    </>
  )
}
