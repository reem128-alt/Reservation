export interface UsersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: number
  email: string
  password?: string
  name: string
  image?: string | null
  otp?: string | null
  otpExpiry?: string | null
  isVerified: boolean
  role: string
  createdAt: string
}

export interface UsersListResponse {
  data: User[]
  meta: UsersMeta
}
