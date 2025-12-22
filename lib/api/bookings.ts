import { apiClient } from "./axios"

function normalizeListResponse(payload: unknown): BookingsListResponse {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.data)) {
      return payload as BookingsListResponse
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload as Booking[] }
  }
  return { data: [] }
}

function normalizeMyBookingsResponse(payload: unknown): MyBookingsResponse {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.data)) {
      return payload as MyBookingsResponse
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload as MyBooking[] }
  }
  return { data: [] }
}

export const bookingsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<BookingsListResponse> => {
    const response = await apiClient.get<unknown>("/bookings", { params })
    return normalizeListResponse(response.data)
  },

  my: async (): Promise<MyBookingsResponse> => {
    const response = await apiClient.get<unknown>("/bookings/my")
    return normalizeMyBookingsResponse(response.data)
  },

  create: async (data: Omit<Booking, "id" | "createdAt">): Promise<Booking> => {
    const response = await apiClient.post<Booking>("/bookings", data)
    return response.data
  },

  update: async (id: number, data: Partial<Omit<Booking, "id" | "createdAt">>): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}`, data)
    return response.data
  },

  confirm: async (id: number): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/confirm`)
    return response.data
  },

  cancel: async (id: number): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`)
  },
}
