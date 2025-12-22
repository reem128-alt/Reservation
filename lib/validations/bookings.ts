import { z } from "zod"

export const bookingCreateSchema = z
  .object({
    userId: z.coerce.number().int().min(1, "User is required"),
    resourceId: z.coerce.number().int().min(1, "Resource is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    paymentMethodId: z.string().min(1, "Payment method is required"),
  })
  .refine(
    (v) => {
      const s = new Date(v.startTime)
      const e = new Date(v.endTime)
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return true
      return e.getTime() > s.getTime()
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )

export const bookingUpdateSchema = bookingCreateSchema

export type BookingCreateFormData = z.infer<typeof bookingCreateSchema>
export type BookingUpdateFormData = z.infer<typeof bookingUpdateSchema>
