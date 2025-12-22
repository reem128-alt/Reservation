"use client"

import * as React from "react"

import { Controller, type UseFormReturn } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { IconSelector } from "@/components/ui/icon-selector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ResourceTypeFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function ResourceTypeFormFields({ form }: ResourceTypeFormFieldsProps) {
  return (
    <>
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="room" {...field} value={field.value || ""} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="label"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input id="label" placeholder="Hotel Room" {...field} value={field.value || ""} />
            {form.formState.errors.label ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.label.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Bookable hotel rooms and suites" {...field} value={field.value || ""} />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.description.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="icon"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <IconSelector
              value={field.value || ""}
              onValueChange={field.onChange}
              placeholder="Select an icon..."
            />
            {form.formState.errors.icon ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.icon.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="isActive"
        control={form.control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Active
            </Label>
            {form.formState.errors.isActive ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.isActive.message)}</p>
            ) : null}
          </div>
        )}
      />
    </>
  )
}
