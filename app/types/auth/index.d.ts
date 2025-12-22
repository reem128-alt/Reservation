interface AuthInitResponse {
  message: string
  email: string
}

interface VerifyOtpResponse {
  id: number
  email: string
  name: string
  token: string
  message: string
}

interface ForgotPasswordPayload {
  email: string
}

type OtpPurpose = "REGISTER" | "LOGIN"

interface ResendOtpPayload {
  email: string
  purpose: OtpPurpose
}

interface ResendOtpResponse {
  message: string
}

interface ForgotPasswordResponse {
  message: string
}

interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

interface ResetPasswordResponse {
  message: string
}

interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

interface UserProfile {
  id: number
  email: string
  name: string
  image?: string | null
  isVerified: boolean
  role: string
  createdAt: string
}

interface VerifyOtpPayload {
  email: string
  code: string
  purpose: OtpPurpose
}
