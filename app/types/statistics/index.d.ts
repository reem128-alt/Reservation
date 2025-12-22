export interface DetailedStatistics {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  bookingsByStatus: Record<string, number>
  revenueByMonth: Array<unknown>
  topResources: Array<unknown>
}
