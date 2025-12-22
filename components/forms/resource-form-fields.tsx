"use client"

import * as React from "react"

import { Controller, type UseFormReturn } from "react-hook-form"

import { MetaFields } from "@/components/forms/meta-fields"
import { LocationPickerDialog } from "@/components/dialogs/location-picker-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ResourceFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  resourceTypes?: ResourceType[]
}

type RootErrors = {
  meta?: { message?: unknown }
}

function getMetaMessage(errors: unknown): unknown {
  if (!errors || typeof errors !== "object") return undefined
  const meta = (errors as RootErrors).meta
  return meta?.message
}

export function ResourceFormFields({ form, resourceTypes = [] }: ResourceFormFieldsProps) {
  const metaMessage = getMetaMessage(form.formState.errors)

  const [locationOpen, setLocationOpen] = React.useState(false)
  const locationText = form.watch("locationText") as string | undefined
  const latitude = form.watch("latitude") as number | undefined
  const longitude = form.watch("longitude") as number | undefined
  const hasLocation = typeof latitude === "number" && typeof longitude === "number"

  const activeResourceTypes = resourceTypes.filter((rt) => rt.isActive !== false)

  return (
    <>
      <Controller
        name="code"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" {...field} value={field.value || ""} />
            {form.formState.errors.code ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.code.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="title"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...field} value={field.value || ""} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.title.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="price"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
            {form.formState.errors.price ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.price.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="resourceTypeId"
        control={form.control}
        render={({ field }) => {
          return (
            <div className="space-y-2">
              <Label htmlFor="resourceTypeId">Type</Label>
              <Select 
                value={field.value ? String(field.value) : ""} 
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="resourceTypeId">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {activeResourceTypes.length > 0 ? (
                    activeResourceTypes.map((rt) => {
                      return (
                        <SelectItem key={rt.id} value={String(rt.id)}>
                          <div className="flex items-center gap-2">
                          
                            <span>{rt.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem value="" disabled>
                      No resource types available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.resourceTypeId ? (
                <p className="text-sm text-destructive">{String(form.formState.errors.resourceTypeId.message)}</p>
              ) : null}
            </div>
          )
        }}
      />

      <Controller
        name="image"
        control={form.control}
        render={({ field }) => (
          <ImageUpload
            value={field.value || ""}
            onChange={field.onChange}
            error={form.formState.errors.image ? String(form.formState.errors.image.message) : undefined}
            label="Resource Image"
          />
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...field} value={field.value || ""} />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.description.message)}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="capacity"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
            {form.formState.errors.capacity ? (
              <p className="text-sm text-destructive">{String(form.formState.errors.capacity.message)}</p>
            ) : null}
          </div>
        )}
      />

      <div className="space-y-2">
        <MetaFields
          value={form.getValues("meta") ?? {}}
          onChange={(next) => {
            form.setValue("meta", next, { shouldDirty: true, shouldValidate: true })
          }}
          errorMessage={metaMessage ? String(metaMessage) : undefined}
        />
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-1">
            <div className="text-sm font-medium">Location</div>
            <div className="text-sm text-muted-foreground">Optional location for this resource.</div>
          </div>
          <Button type="button" variant="outline" onClick={() => setLocationOpen(true)}>
            {hasLocation ? "Edit Location" : "Add Location"}
          </Button>
        </div>

        <Controller
          name="locationText"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="locationText">Location text</Label>
              <Input id="locationText" {...field} value={field.value || ""} readOnly />
            </div>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            name="latitude"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" value={field.value ?? ""} readOnly />
              </div>
            )}
          />
          <Controller
            name="longitude"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" value={field.value ?? ""} readOnly />
              </div>
            )}
          />
        </div>
      </div>

      <LocationPickerDialog
        open={locationOpen}
        onOpenChange={setLocationOpen}
        value={{
          locationText,
          latitude,
          longitude,
        }}
        onSave={(next) => {
          form.setValue("locationText", next.locationText ?? "", { shouldDirty: true, shouldValidate: true })
          form.setValue("latitude", next.latitude, { shouldDirty: true, shouldValidate: true })
          form.setValue("longitude", next.longitude, { shouldDirty: true, shouldValidate: true })
        }}
      />
    </>
  )
}
