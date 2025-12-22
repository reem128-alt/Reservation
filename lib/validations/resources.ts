import { z } from "zod"

export const resourceMetaSchema = z.record(z.unknown())

const optionalNumber = z.preprocess(
  (v) => {
    if (v === "" || v === null || v === undefined) return undefined
    return v
  },
  z.coerce.number().optional()
)

export const resourceCreateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  title: z.string().min(1, "Title is required"),
  resourceTypeId: z.coerce.number().int().positive("Resource type is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater").optional(),
  image: z.union([z.instanceof(File), z.string().url()]).optional(),
  description: z.string().optional(),
  capacity: z.coerce.number().int().min(0, "Capacity must be 0 or greater").optional(),
  locationText: z.string().optional(),
  latitude: optionalNumber,
  longitude: optionalNumber,
  meta: resourceMetaSchema.optional(),
})

export const resourceUpdateSchema = resourceCreateSchema

export const availabilityCreateSchema = z.object({
  resourceId: z.coerce.number().int().positive("Resource ID is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isAvailable: z.boolean().default(true),
})

export type ResourceCreateFormData = z.infer<typeof resourceCreateSchema>
export type ResourceUpdateFormData = z.infer<typeof resourceUpdateSchema>
export type AvailabilityCreateFormData = z.infer<typeof availabilityCreateSchema>
