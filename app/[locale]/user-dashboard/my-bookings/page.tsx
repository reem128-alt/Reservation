"use client"

import * as React from "react"

import Image from "next/image"

import { useQuery } from "@tanstack/react-query"
import { CalendarClock, CreditCard, PackageOpen, Calendar, TrendingUp, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { bookingsApi } from "@/lib/api/bookings"
import { formatDateTime, formatMoney } from "@/lib/utils/format"
import { StatusBadge } from "@/lib/utils/status"
import { Navbar } from "../components/navbar"

function BookingCard({ booking, index }: { booking: MyBooking; index: number }) {
  const resourceTitle = booking.resource?.title ?? `Resource #${booking.resourceId}`
  const resourceCode = booking.resource?.code
  const resourceType = booking.resource?.type
  const imageSrc = booking.resource?.image ? String(booking.resource.image) : ""

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-primary/50 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-44 w-full bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={resourceTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PackageOpen className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{resourceTitle}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {resourceCode ? <span className="font-medium">{resourceCode}</span> : null}
              {resourceCode && resourceType ? " • " : null}
              {resourceType ? <span className="capitalize">{resourceType}</span> : null}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={booking.status} type="booking" />
            <span className="text-xs text-muted-foreground">#{booking.id}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-2 text-sm">
            <CalendarClock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="font-medium">Time</p>
              <p className="text-muted-foreground">
                {formatDateTime(booking.startTime, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" — "}
                {formatDateTime(booking.endTime, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">Payment</p>
                {booking.payment?.status ? (
                  <StatusBadge status={booking.payment.status} type="payment" />
                ) : null}
              </div>
              {booking.payment ? (
                <p className="text-muted-foreground">
                  {formatMoney(booking.payment.amount, booking.payment.currency)}
                  {booking.payment.description ? ` • ${booking.payment.description}` : ""}
                </p>
              ) : (
                <p className="text-muted-foreground">No payment</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyBookingsPage() {
  const myBookingsQuery = useQuery({
    queryKey: ["bookings", "my"],
    queryFn: () => bookingsApi.my(),
  })

  const data = myBookingsQuery.data?.data ?? []
  const confirmedCount = data.filter((b: MyBooking) => b.status?.toUpperCase() === 'CONFIRMED').length
  const completedCount = data.filter((b: MyBooking) => b.status?.toUpperCase() === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />
      
      <main className="container py-8">
        {/* Header Section */}
        <div className="mb-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              My Bookings
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Track and manage your reservations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
                <Calendar className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{data.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All reservations</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Confirmed</div>
                <TrendingUp className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{confirmedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Active bookings</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-muted-foreground">Completed</div>
                <Clock className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{completedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Past bookings</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {myBookingsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <CardHeader className="space-y-3">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
        
        {myBookingsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-destructive/10 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load bookings</h3>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        ) : null}

        {!myBookingsQuery.isLoading && !myBookingsQuery.isError && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="p-6 bg-muted/50 rounded-full mb-6">
              <PackageOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No bookings yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              When you book a resource, it will show up here. Start exploring available resources!
            </p>
          </div>
        ) : null}

        {!myBookingsQuery.isLoading && !myBookingsQuery.isError && data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data
              .slice()
              .sort((a: MyBooking, b: MyBooking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((booking: MyBooking, index: number) => (
                <BookingCard key={booking.id} booking={booking} index={index} />
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
