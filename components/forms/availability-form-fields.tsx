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

interface AvailabilityFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  resources?: Array<{ id: number; code: string; title: string }>
}

export function AvailabilityFormFields({ form, resources = [] }: AvailabilityFormFieldsProps) {
  return (
    <>
      <Controller
        name="resourceId"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="resourceId">Resource</Label>
            <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
              <SelectTrigger id="resourceId">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={String(resource.id)}>
                    {resource.code} - {resource.title}
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
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="datetime-local" {...field} value={field.value || ""} />
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
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="datetime-local" {...field} value={field.value || ""} />
            {form.formState.errors.endTime ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.endTime.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="isAvailable"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="isAvailable">Status</Label>
            <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
              <SelectTrigger id="isAvailable">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.isAvailable ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.isAvailable.message)}</p>
            ) : null}
          </div>
        )}
      />
    </>
  )
}
