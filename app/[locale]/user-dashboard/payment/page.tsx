"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
 import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Navbar } from "../components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bookingsApi } from "@/lib/api/bookings"
 import { resourcesApi } from "@/lib/api/resources"
import { toastApiError } from "@/lib/utils/toast"
import { useStore } from "@/lib/store/store"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

function PaymentForm(props: { userId: number; resourceId: number; startTime: string; endTime: string; onDone: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    const card = elements.getElement(CardElement)
    if (!card) return

    setIsSubmitting(true)
    try {
      const pmResult = await stripe.createPaymentMethod({
        type: "card",
        card,
      })

      if (pmResult.error || !pmResult.paymentMethod) {
        toast.error(pmResult.error?.message || "Failed to create payment method")
        return
      }

      await bookingsApi.create({
        userId: props.userId,
        resourceId: props.resourceId,
        startTime: props.startTime,
        endTime: props.endTime,
        paymentMethodId: pmResult.paymentMethod.id,
      })

      toast.success("Booking created successfully")
      props.onDone()
    } catch (e) {
      toastApiError("Failed to create booking", e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                "::placeholder": { color: "#94a3b8" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold"
        disabled={!stripe || !elements || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Pay & Confirm Booking"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Your card details are securely processed by Stripe. We only receive a payment method id.
      </p>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? "en"
  const searchParams = useSearchParams()

  const profile = useStore((s) => s.profile)
  const fetchProfile = useStore((s) => s.fetchProfile)

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const resourceId = Number(searchParams.get("resourceId"))
  const startTime = searchParams.get("startTime") || ""
  const endTime = searchParams.get("endTime") || ""

  const resourceQuery = useQuery({
    queryKey: ["user-dashboard", "resources", "detail", resourceId],
    queryFn: () => resourcesApi.get(resourceId),
    enabled: Number.isFinite(resourceId) && resourceId > 0,
  })

  const resource = resourceQuery.data

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

  const canRenderPayment = useMemo(() => {
    return Boolean(stripeKey) && Number.isFinite(resourceId) && resourceId > 0 && Boolean(startTime) && Boolean(endTime)
  }, [stripeKey, resourceId, startTime, endTime])

  const handleDone = () => {
    router.push(`/${locale}/user-dashboard/my-bookings`)
  }

  return (
    <div className="min-h-screen bg-background p-5">
      <Navbar />

      <main className="container py-8">
        <div className="max-w-xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Payment</CardTitle>
              <CardDescription>Enter your card details to confirm your booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!profile ? <p className="text-sm text-muted-foreground">Loading your profile...</p> : null}

              {!stripeKey ? (
                <p className="text-destructive text-sm">
                  Missing Stripe publishable key. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.
                </p>
              ) : null}

              {!Number.isFinite(resourceId) || resourceId <= 0 ? (
                <p className="text-destructive text-sm">Invalid resourceId.</p>
              ) : null}

              {!startTime || !endTime ? (
                <p className="text-destructive text-sm">Missing startTime/endTime.</p>
              ) : null}

              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resource</span>
                  <span className="font-medium">
                    {resource?.title ? resource.title : `#${Number.isFinite(resourceId) ? resourceId : "-"}`}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{resource?.price != null ? String(resource.price) : "-"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Start</span>
                  <span className="font-medium">{startTime ? new Date(startTime).toLocaleString() : "-"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">End</span>
                  <span className="font-medium">{endTime ? new Date(endTime).toLocaleString() : "-"}</span>
                </div>
              </div>

              {canRenderPayment && profile ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    userId={profile.id}
                    resourceId={resourceId}
                    startTime={startTime}
                    endTime={endTime}
                    onDone={handleDone}
                  />
                </Elements>
              ) : (
                <div className="pt-2">
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                    Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
