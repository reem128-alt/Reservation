"use client"

import * as React from "react"

import L from "leaflet"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LocationPickerValue = {
  locationText?: string
  latitude?: number
  longitude?: number
}

export type LocationPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: LocationPickerValue
  onSave: (value: LocationPickerValue) => void
}

export function LocationPickerDialog({ open, onOpenChange, value, onSave }: LocationPickerDialogProps) {
  const mapRef = React.useRef<L.Map | null>(null)
  const markerRef = React.useRef<L.CircleMarker | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  const [locationText, setLocationText] = React.useState(value.locationText ?? "")
  const [latitude, setLatitude] = React.useState<number | undefined>(value.latitude)
  const [longitude, setLongitude] = React.useState<number | undefined>(value.longitude)
  const [locationTextEdited, setLocationTextEdited] = React.useState(false)
  const [isLookingUp, setIsLookingUp] = React.useState(false)
  const [lookupError, setLookupError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLocationText(value.locationText ?? "")
    setLatitude(value.latitude)
    setLongitude(value.longitude)
    setLocationTextEdited(false)
    setIsLookingUp(false)
    setLookupError(null)
  }, [open, value.latitude, value.locationText, value.longitude])

  React.useEffect(() => {
    if (!open) return
    const map = mapRef.current
    if (!map) return
    requestAnimationFrame(() => {
      map.invalidateSize()
    })
  }, [open])

  React.useEffect(() => {
    if (open) return
    abortRef.current?.abort()
    abortRef.current = null
  }, [open])

  const lookupPlaceName = React.useCallback(async (lat: number, lng: number) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLookingUp(true)
    setLookupError(null)

    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse")
      url.searchParams.set("format", "jsonv2")
      url.searchParams.set("lat", String(lat))
      url.searchParams.set("lon", String(lng))

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`Reverse geocoding failed (${res.status})`)
      }

      const json = (await res.json()) as { display_name?: string }
      const displayName = json.display_name?.trim()

      if (!displayName) {
        setLookupError("No place name found")
        return
      }

      setLookupError(null)
      if (!locationTextEdited) {
        setLocationText(displayName)
      }
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return
      setLookupError((e as Error).message)
    } finally {
      setIsLookingUp(false)
    }
  }, [locationTextEdited])

  React.useEffect(() => {
    if (!open) return
    if (!containerRef.current) return
    if (mapRef.current) return

    const container = containerRef.current as unknown as Record<string, unknown>
    if ("_leaflet_id" in container) {
      // Leaflet keeps an internal id on the container, which can prevent re-init.
      delete container._leaflet_id
    }
    containerRef.current.innerHTML = ""

    const centerLat = typeof value.latitude === "number" ? value.latitude : 30.0444
    const centerLng = typeof value.longitude === "number" ? value.longitude : 31.2357

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: typeof value.latitude === "number" && typeof value.longitude === "number" ? 13 : 5,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    map.on("click", (e: L.LeafletMouseEvent) => {
      const nextLat = Number(e.latlng.lat)
      const nextLng = Number(e.latlng.lng)
      setLatitude(nextLat)
      setLongitude(nextLng)
      setLocationTextEdited(false)

      if (!markerRef.current) {
        markerRef.current = L.circleMarker([nextLat, nextLng], {
          radius: 8,
          color: "#1e3a5f",
          fillColor: "#1e3a5f",
          fillOpacity: 0.35,
        }).addTo(map)
      } else {
        markerRef.current.setLatLng([nextLat, nextLng])
      }

      void lookupPlaceName(nextLat, nextLng)
    })

    if (typeof value.latitude === "number" && typeof value.longitude === "number") {
      markerRef.current = L.circleMarker([value.latitude, value.longitude], {
        radius: 8,
        color: "#1e3a5f",
        fillColor: "#1e3a5f",
        fillOpacity: 0.35,
      }).addTo(map)
      map.setView([value.latitude, value.longitude], 13)
    }

    mapRef.current = map

    setTimeout(() => {
      map.invalidateSize()
    }, 0)

    return () => {
      map.off()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canSave = typeof latitude === "number" && typeof longitude === "number"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Location</DialogTitle>
        <DialogDescription>Click on the map to choose a location.</DialogDescription>
      </DialogHeader>

      <DialogContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="locationText">Location</Label>
          <Input
            id="locationText"
            value={locationText}
            onChange={(e) => {
              abortRef.current?.abort()
              abortRef.current = null
              setIsLookingUp(false)
              setLookupError(null)
              setLocationTextEdited(true)
              setLocationText(e.target.value)
            }}
            placeholder="Downtown - Main Street 12"
          />
          {isLookingUp ? (
            <div className="text-sm text-muted-foreground">Looking up place name…</div>
          ) : lookupError ? (
            <div className="text-sm text-destructive">{lookupError}</div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" value={latitude ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" value={longitude ?? ""} readOnly />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border">
          <div ref={containerRef} style={{ height: 360, width: "100%" }} />
        </div>
      </DialogContent>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canSave}
          onClick={() => {
            onSave({
              locationText: locationText.trim() ? locationText.trim() : undefined,
              latitude,
              longitude,
            })
            onOpenChange(false)
          }}
        >
          Save Location
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
