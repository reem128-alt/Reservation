import { apiClient } from "./axios"

function normalizeListResponse(payload: unknown): ResourceTypesListResponse {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.data)) {
      return payload as ResourceTypesListResponse
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload as ResourceType[] }
  }
  return { data: [] }
}

export const resourceTypesApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<ResourceTypesListResponse> => {
    const response = await apiClient.get<unknown>("/resource-types", { params })
    return normalizeListResponse(response.data)
  },

  create: async (data: ResourceTypeCreateData): Promise<ResourceType> => {
    const response = await apiClient.post<ResourceType>("/resource-types", data)
    return response.data
  },

  update: async (id: number, data: ResourceTypeUpdateData): Promise<ResourceType> => {
    const response = await apiClient.patch<ResourceType>(`/resource-types/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resource-types/${id}`)
  },
}
