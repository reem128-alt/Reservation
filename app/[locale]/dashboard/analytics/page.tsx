"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingUp, Users, Package, Calendar, DollarSign, Activity } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api/analytics"
import { LineChart } from "@/components/charts/line-chart"
import { PieChart } from "@/components/charts/pie-chart"

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string
  value: string | number
  icon: React.ElementType
  description?: string 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.getSummary(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-destructive mt-1">Failed to load analytics data.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Overview of your business performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={data.overview.totalUsers}
          icon={Users}
          description={`${data.userAnalytics.activeUsers} active users`}
        />
        <StatCard
          title="Total Resources"
          value={data.overview.totalResources}
          icon={Package}
          description={`${data.overview.totalResourceTypes} resource types`}
        />
        <StatCard
          title="Total Bookings"
          value={data.overview.totalBookings}
          icon={Calendar}
          description={`${data.overview.activeBookings} active bookings`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.overview.totalRevenue)}
          icon={DollarSign}
          description={`Avg: ${formatCurrency(data.revenueAnalytics.averageRevenuePerBooking)}/booking`}
        />
        <StatCard
          title="Confirmation Rate"
          value={`${data.bookingAnalytics.confirmationRate}%`}
          icon={TrendingUp}
          description={`${data.bookingAnalytics.confirmedBookings} confirmed`}
        />
        <StatCard
          title="Avg Monthly Revenue"
          value={formatCurrency(data.revenueAnalytics.averageMonthlyRevenue)}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={data.bookingAnalytics.bookingsByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Resource Type</CardTitle>
            <CardDescription>Revenue breakdown by resource category</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={data.revenueAnalytics.revenueByResourceType}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Trend</CardTitle>
          <CardDescription>Daily booking activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={data.bookingAnalytics.bookingTrend.map(item => ({
              label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: item.bookings
            }))}
            height={250}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={data.revenueAnalytics.revenueByMonth}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Registration Trend</CardTitle>
            <CardDescription>New user registrations by month</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={data.userAnalytics.userRegistrationTrend}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Type Statistics</CardTitle>
          <CardDescription>Performance metrics by resource type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.resourceTypeStats.map((stat) => (
              <div key={stat.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold capitalize">{stat.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stat.totalResources} resources • {stat.totalBookings} bookings • {formatCurrency(stat.totalRevenue)} revenue
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.utilizationRate}%</div>
                    <div className="text-xs text-muted-foreground">Utilization</div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stat.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Resources by Bookings</CardTitle>
            <CardDescription>Most frequently booked resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topResources.map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.code}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{resource.bookingCount}</p>
                    <p className="text-xs text-muted-foreground">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Resources by Revenue</CardTitle>
            <CardDescription>Highest revenue generating resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topRevenueResources.map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600 font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.code}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{formatCurrency(resource.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">{resource.bookingCount} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
