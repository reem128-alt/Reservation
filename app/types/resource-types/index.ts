interface ResourceType {
  id?: number
  name: string
  label: string
  description?: string | null
  icon?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  _count?: {
    resources: number
  }
}

interface ResourceTypesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ResourceTypesListResponse {
  data: ResourceType[]
  meta?: ResourceTypesMeta
}

interface ResourceTypeCreateData {
  name: string
  label: string
  description?: string
  icon?: string
  isActive?: boolean
}

interface ResourceTypeUpdateData {
  name?: string
  label?: string
  description?: string
  icon?: string
  isActive?: boolean
}
