import { apiClient } from "./axios"

export interface DetailedStatistics {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  bookingsByStatus: Record<string, number>
  revenueByMonth: Array<unknown>
  topResources: Array<unknown>
}

export const statisticsApi = {
  detailed: async (): Promise<DetailedStatistics> => {
    const response = await apiClient.get<DetailedStatistics>("/statistics/detailed")
    return response.data
  },
}
