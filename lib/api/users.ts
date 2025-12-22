import { apiClient } from "./axios"

export interface UsersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: number
  email: string
  password?: string
  name: string
  image?: string | null
  otp?: string | null
  otpExpiry?: string | null
  isVerified: boolean
  role: string
  createdAt: string
}

export interface UsersListResponse {
  data: User[]
  meta: UsersMeta
}

export const usersApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<UsersListResponse> => {
    const response = await apiClient.get<UsersListResponse>("/users", { params })
    return response.data
  },

  create: async (data: { email: string; password: string; name: string; role: string; image?: string }): Promise<User> => {
    const response = await apiClient.post<User>("/users", data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  update: async (
    id: number,
    data: Partial<Pick<User, "name" | "email" | "role" | "image" | "password">>
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data)
    return response.data
  },
}
