interface AnalyticsSummary {
  overview: {
    totalUsers: number
    totalResources: number
    totalResourceTypes: number
    totalBookings: number
    totalRevenue: number
    activeBookings: number
  }
  bookingAnalytics: {
    totalBookings: number
    confirmedBookings: number
    pendingBookings: number
    canceledBookings: number
    confirmationRate: number
    bookingsByStatus: Array<{
      label: string
      value: number
    }>
    bookingTrend: Array<{
      date: string
      bookings: number
      confirmed: number
      pending: number
      canceled: number
    }>
  }
  revenueAnalytics: {
    totalRevenue: number
    averageRevenuePerBooking: number
    averageMonthlyRevenue: number
    revenueByMonth: Array<{
      label: string
      value: number
    }>
    revenueByResourceType: Array<{
      label: string
      value: number
    }>
  }
  userAnalytics: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    userRegistrationTrend: Array<{
      label: string
      value: number
    }>
  }
  resourceTypeStats: Array<{
    type: string
    label: string
    totalResources: number
    totalBookings: number
    totalRevenue: number
    utilizationRate: number
  }>
  topResources: Array<{
    id: number
    code: string
    title: string
    resourceType: string
    resourceTypeLabel: string
    bookingCount: number
    totalRevenue: number
  }>
  topRevenueResources: Array<{
    id: number
    code: string
    title: string
    resourceType: string
    resourceTypeLabel: string
    bookingCount: number
    totalRevenue: number
  }>
}
