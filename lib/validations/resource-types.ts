import { z } from "zod"

export const resourceTypeCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  label: z.string().min(1, "Label is required").max(100, "Label must be less than 100 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

export const resourceTypeUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
  label: z.string().min(1, "Label is required").max(100, "Label must be less than 100 characters").optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type ResourceTypeCreateFormData = z.infer<typeof resourceTypeCreateSchema>
export type ResourceTypeUpdateFormData = z.infer<typeof resourceTypeUpdateSchema>
