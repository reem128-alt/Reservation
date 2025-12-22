import { apiClient } from "./axios"

export interface ResourcesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ResourceType {
  id: number
  name: string
  label: string
  description?: string | null
  icon?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id?: number
  code: string
  title: string
  resourceTypeId: number
  price?: number
  image?: string | null
  description?: string | null
  capacity?: number
  locationText?: string | null
  latitude?: number | null
  longitude?: number | null
  meta?: Record<string, unknown>
  createdAt?: string
  resourceType?: ResourceType
  schedules?: ResourceSchedule[]
  _count?: {
    bookings: number
  }
}

export interface ResourceSchedule {
  id: number
  resourceId: number
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt?: string
  pricing?: {
    durationInHours: number
    estimatedCost: number
    pricePerHour: number
    currency: string
  }
}

export interface ResourceBooking {
  id: number
  resourceId: number
  startTime?: string
  endTime?: string
  createdAt?: string
  [key: string]: unknown
}

export interface ResourceDetails extends Resource {
  id: number
  available?: boolean
  isAvailable?: boolean
  schedules: ResourceSchedule[]
  bookings?: ResourceBooking[]
}

export interface ResourcesListResponse {
  data: Resource[]
  meta?: ResourcesMeta
}

function normalizeListResponse(payload: unknown): ResourcesListResponse {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.data)) {
      return payload as ResourcesListResponse
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload as Resource[] }
  }
  return { data: [] }
}

export const resourcesApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<ResourcesListResponse> => {
    const response = await apiClient.get<unknown>("/resources", { params })
    return normalizeListResponse(response.data)
  },

  getTypes: async (): Promise<ResourceType[]> => {
    try {
      const response = await apiClient.get<{ data: ResourceType[] } | ResourceType[]>("/resource-types", {
        params: { limit: 1000 }
      })
      // Handle both paginated response {data: [...]} and direct array response
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return Array.isArray(response.data.data) ? response.data.data : []
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Failed to fetch resource types:", error)
      return []
    }
  },

  get: async (id: number): Promise<ResourceDetails> => {
    const response = await apiClient.get<ResourceDetails>(`/resources/${id}`)
    return response.data
  },

  create: async (data: Omit<Resource, "id" | "createdAt">): Promise<Resource> => {
    const response = await apiClient.post<Resource>("/resources", data)
    return response.data
  },

  update: async (id: number, data: Partial<Omit<Resource, "id" | "createdAt">>): Promise<Resource> => {
    const response = await apiClient.patch<Resource>(`/resources/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resources/${id}`)
  },

  createAvailability: async (data: {
    resourceId: number
    startTime: string
    endTime: string
    isAvailable?: boolean
  }): Promise<ResourceSchedule> => {
    const response = await apiClient.post<ResourceSchedule>("/availability", data)
    return response.data
  },
}
