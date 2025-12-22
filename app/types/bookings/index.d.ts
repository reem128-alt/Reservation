interface BookingUser {
  id: number
  email: string
  name: string
}

interface Booking {
  id?: number
  userId: number
  resourceId: number
  startTime: string
  endTime: string
  status?: string
  paymentMethodId?: string
  createdAt?: string
  updatedAt?: string
  user?: BookingUser
  resource?: BookingResource
  payment?: BookingPayment | null
}

interface BookingResource {
  id: number
  code: string
  title: string
  type: string
  description?: string | null
  capacity?: number
  image?: string | null
  available?: boolean
  meta?: Record<string, unknown>
  createdAt?: string
  resourceType?: {
    id: number
    name: string
    label: string
    description?: string | null
  }
}

interface BookingPayment {
  id: string
  bookingId: number
  stripePaymentId?: string | null
  amount: number
  currency?: string | null
  status: string
  paymentMethod?: string | null
  description?: string | null
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

interface MyBooking {
  id: number
  userId: number
  resourceId: number
  startTime: string
  endTime: string
  status: string
  createdAt?: string
  updatedAt?: string
  resource?: BookingResource
  payment?: BookingPayment | null
}

interface BookingsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface BookingsListResponse {
  data: Booking[]
  meta?: BookingsMeta
}

interface MyBookingsResponse {
  data: MyBooking[]
}
