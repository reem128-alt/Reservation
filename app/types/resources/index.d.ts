export interface ResourcesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ResourceType {
  id: number
  name: string
  label: string
  description?: string | null
  icon?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id?: number
  code: string
  title: string
  resourceTypeId: number
  price?: number
  image?: string | null
  description?: string | null
  capacity?: number
  locationText?: string | null
  latitude?: number | null
  longitude?: number | null
  meta?: Record<string, unknown>
  createdAt?: string
  resourceType?: ResourceType
  schedules?: ResourceSchedule[]
  _count?: {
    bookings: number
  }
}

export interface ResourceSchedule {
  id: number
  resourceId: number
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt?: string
  pricing?: {
    durationInHours: number
    estimatedCost: number
    pricePerHour: number
    currency: string
  }
}

export interface ResourceBooking {
  id: number
  resourceId: number
  startTime?: string
  endTime?: string
  createdAt?: string
  [key: string]: unknown
}

export interface ResourceDetails extends Resource {
  id: number
  available?: boolean
  isAvailable?: boolean
  schedules: ResourceSchedule[]
  bookings?: ResourceBooking[]
}

export interface ResourcesListResponse {
  data: Resource[]
  meta?: ResourcesMeta
}
