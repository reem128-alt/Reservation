"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, MapPin, Clock } from "lucide-react"
import { Navbar } from "../../components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data - in real app, fetch based on params.id
const resource = {
  id: 1,
  title: "Meeting Room 101",
  type: "Meeting Room",
  capacity: 6,
  location: "Floor 1, Building A",
  image: "/modern-meeting-room-interior.jpg",
  description:
    "A modern and well-equipped meeting room perfect for team collaborations, client presentations, and brainstorming sessions. Features high-speed WiFi, a large display screen, whiteboard, and comfortable seating.",
  amenities: ["WiFi", "Projector", "Whiteboard", "Video Conference", "Coffee Machine"],
  availableSlots: [
    { time: "10:00 - 11:00", available: true },
    { time: "11:00 - 12:00", available: true },
    { time: "01:00 - 02:00", available: true },
    { time: "02:00 - 03:00", available: false },
    { time: "03:00 - 04:00", available: true },
    { time: "04:00 - 05:00", available: true },
  ],
}

export default function ResourceDetailPage() {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const handleBooking = (time: string) => {
    setSelectedSlot(time)
    // In real app: create booking API call
    alert(`Booking confirmed for ${time}`)
  }

  return (
    <div className="min-h-screen bg-background">
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

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Left: Image */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img
                src={resource.image || "/placeholder.svg"}
                alt={resource.title}
                className="h-[500px] w-full object-cover"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About this space</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{resource.description}</p>

                <div className="mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Details Card */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl text-balance">{resource.title}</CardTitle>
                <CardDescription className="text-base">{resource.type}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>
                      Capacity: <strong className="text-foreground">{resource.capacity} persons</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-foreground">{resource.location}</span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Available Times</h3>
                  </div>

                  <div className="space-y-2">
                    {resource.availableSlots.map((slot) => (
                      <div key={slot.time} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <span className="font-medium text-sm text-foreground">{slot.time}</span>
                        {slot.available ? (
                          <Button size="sm" onClick={() => handleBooking(slot.time)} className="shrink-0">
                            Book
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">
                            Booked
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
