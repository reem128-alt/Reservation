export interface PaymentBookingUser {
  id: number
  email: string
  name: string
}

export interface PaymentBookingResource {
  id: number
  title: string
  type: string
  code: string
}

export interface PaymentBooking {
  id: number
  userId: number
  resourceId: number
  startTime: string
  endTime: string
  status: string
  createdAt: string
  updatedAt: string
  user?: PaymentBookingUser
  resource?: PaymentBookingResource
}

export interface PaymentMethodDetails {
  id: string
  type: string
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  funding?: string
  country?: string
  billingPostalCode?: string
}

export interface Payment {
  id: string
  bookingId: number
  stripePaymentId?: string | null
  amount: number
  currency: string
  status: string
  paymentMethod?: string | null
  paymentMethodDetails?: PaymentMethodDetails | null
  description?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  booking?: PaymentBooking
}

export interface PaymentsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaymentsListResponse {
  data: Payment[]
  meta?: PaymentsMeta
}
