import { z } from "zod"

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  image: z.string().optional(),
})

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  image: z.string().optional(),
})

export const profileUpdateSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  image: z.string().optional(),
})

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>
export type UserCreateFormData = z.infer<typeof userCreateSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
