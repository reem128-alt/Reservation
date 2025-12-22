"use client"

import { useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Users, Clock, MapPin } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Navbar } from "../../components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShinyButton } from "@/components/ui/shiny-button"

import { resourcesApi } from "@/lib/api/resources"

function formatMeta(meta: Record<string, unknown> | undefined) {
  if (!meta) return [] as Array<[string, string]>
  return Object.entries(meta)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      if (v === null) return [k, "null"]
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return [k, String(v)]
      try {
        return [k, JSON.stringify(v)]
      } catch {
        return [k, "[object]"]
      }
    })
}

function formatLocation(resource: { locationText?: string | null; latitude?: number | null; longitude?: number | null }) {
  const text = resource.locationText?.trim()
  if (text) return text
  const lat = resource.latitude
  const lng = resource.longitude
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
  return "-"
}

export default function ResourceDetailPage() {
  const router = useRouter()
  const params = useParams<{ locale?: string; id?: string }>()
  const locale = params?.locale ?? "en"
  const id = Number(params?.id)

  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)

  const resourceQuery = useQuery({
    queryKey: ["user-dashboard", "resources", "detail", id],
    queryFn: () => resourcesApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })

  const resource = resourceQuery.data
  const metaEntries = formatMeta(resource?.meta)
  const resourceAvailable = (resource?.available ?? resource?.isAvailable) ?? false

  const selectedSchedule = useMemo(() => {
    if (!resource || selectedScheduleId == null) return undefined
    return resource.schedules.find((s) => Number(s.id) === Number(selectedScheduleId))
  }, [resource, selectedScheduleId])

  const handleBookNow = () => {
    if (!resource) return
    if (!selectedSchedule) return
    router.push(
      `/${locale}/user-dashboard/payment?resourceId=${resource.id}&startTime=${encodeURIComponent(
        selectedSchedule.startTime
      )}&endTime=${encodeURIComponent(selectedSchedule.endTime)}`
    )
  }

  return (
    <div className="min-h-screen bg-background p-5">
      <Navbar />

      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {!Number.isFinite(id) || id <= 0 ? <p className="text-destructive">Invalid resource id.</p> : null}
        {resourceQuery.isLoading ? <p className="text-muted-foreground">Loading...</p> : null}
        {resourceQuery.isError ? <p className="text-destructive">Failed to load resource.</p> : null}
        {!resourceQuery.isLoading && !resourceQuery.isError && !resource ? (
          <p className="text-muted-foreground">Resource not found.</p>
        ) : null}

        {resource ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Left: Image */}
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[520px]">
                  <Image
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: Main data */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-balance">{resource.title}</CardTitle>
                  <CardDescription className="text-base">
                    {resource.resourceType?.label ?? resource.resourceType?.name ?? ""}
                    {resource.code ? ` • ${resource.code}` : ""}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>
                        Capacity: <strong className="text-foreground">{resource.capacity} persons</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <MapPin className="h-5 w-5" />
                      <span className="truncate">
                        Location: <strong className="text-foreground">{formatLocation(resource)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>
                        Price: <strong className="text-foreground">{resource.price != null ? String(resource.price) : "-"}</strong>
                      </span>
                    </div>
                    {resourceAvailable ? (
                      <Badge variant="secondary">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About this space</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{resource.description || ""}</p>

                  {metaEntries.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="font-semibold text-foreground mb-3">characteristics</h4>
                      <div className="flex flex-wrap gap-2">
                        {metaEntries.map(([k, v]) => (
                          <Badge key={k} variant="secondary">
                            {k}: {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resource.schedules.length === 0 ? <p className="text-sm text-muted-foreground">No schedules.</p> : null}
                  {resource.schedules.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setSelectedScheduleId(Number(s.id))}
                      className={
                        "w-full text-left flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors " +
                        (s.isAvailable ? "hover:bg-accent" : "opacity-60 cursor-not-allowed") +
                        (Number(selectedScheduleId) === Number(s.id) ? " ring-2 ring-ring" : "")
                      }
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.pricing ? (
                            <span className="font-mono">
                              {s.pricing.durationInHours.toFixed(2)}h • {s.pricing.pricePerHour} {s.pricing.currency}/h • Est: {s.pricing.estimatedCost} {s.pricing.currency}
                            </span>
                          ) : (
                            <span>No pricing</span>
                          )}
                        </div>
                      </div>
                      {s.isAvailable ? (
                        <Badge variant="secondary" className="shrink-0">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          Unavailable
                        </Badge>
                      )}
                    </button>
                  ))}

                  <div className="pt-3">
                    <ShinyButton
                      variant="primary"
                      className="w-full h-11 text-base font-semibold"
                      disabled={!selectedSchedule || !selectedSchedule.isAvailable}
                      onClick={handleBookNow}
                    >
                      Book Now
                    </ShinyButton>
                    {!selectedSchedule ? (
                      <p className="mt-2 text-xs text-muted-foreground">Select an available time slot to continue.</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
