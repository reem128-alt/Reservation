"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, Users, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Resource } from "@/lib/api/resources"

function formatMeta(meta: Record<string, unknown> | undefined) {
  if (!meta) return ""
  const entries = Object.entries(meta).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return ""

  return entries
    .map(([k, v]) => {
      if (v === null) return `${k}: null`
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return `${k}: ${String(v)}`
      try {
        return `${k}: ${JSON.stringify(v)}`
      } catch {
        return `${k}: [object]`
      }
    })
    .join(", ")
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

export function ResourceCard({
  resource,
  locale,
  animationDelayMs = 0,
}: {
  resource: Resource
  locale: string
  animationDelayMs?: number
}) {
  return (
    <Card
      key={resource.id}
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-primary/50 animate-fade-in-up"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        <Image
          src={resource.image || "/placeholder.svg"}
          alt={resource.title || "Resource"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3">
          <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-foreground">
            {resource.resourceType?.label || resource.resourceType?.name || "Resource"}
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{resource.title}</h3>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm">
          <span className="text-muted-foreground">Price</span>
          <span className="font-mono text-xs text-foreground">{resource.price != null ? String(resource.price) : "-"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-medium">Capacity: {resource.capacity} persons</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium truncate">{formatLocation(resource)}</span>
        </div>

        {resource.meta && Object.keys(resource.meta).length > 0 ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{formatMeta(resource.meta)}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No additional details</p>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/${locale}/user-dashboard/resources/${resource.id}`} className="w-full">
          <Button className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" disabled={!resource.id}>
            <Eye className="h-4 w-4" />
            View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
