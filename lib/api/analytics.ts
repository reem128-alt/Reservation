import { apiClient } from "./axios"


export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get<AnalyticsSummary>("/analytics/summary")
    return response.data
  },
}
