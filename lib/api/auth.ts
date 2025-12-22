import { apiClient } from "./axios"
import type { LoginFormData, RegisterFormData } from "../validations/auth"

type RegisterPayload = Omit<RegisterFormData, "confirmPassword">

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthInitResponse> => {
    const response = await apiClient.post<AuthInitResponse>("/auth/login", data)
    return response.data
  },

  register: async (data: RegisterPayload): Promise<AuthInitResponse> => {
    const response = await apiClient.post<AuthInitResponse>("/auth/register", data)
    return response.data
  },

  verifyOtp: async (data: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>("/auth/otp/verify", data)
    return response.data
  },

  resendOtp: async (data: ResendOtpPayload): Promise<ResendOtpResponse> => {
    const response = await apiClient.post<ResendOtpResponse>("/auth/otp/resend", data)
    return response.data
  },
  

  forgotPassword: async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", data)
    return response.data
  },

  resetPassword: async (data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>("/auth/reset-password", data)
    return response.data
  },

  profile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/auth/profile")
    return response.data
  },

  updateProfile: async (data: Partial<Pick<UserProfile, "name" | "image">>): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>("/auth/profile", data)
    return response.data
  },

  changePassword: async (data: ChangePasswordPayload): Promise<unknown> => {
    const response = await apiClient.post<unknown>("/auth/change-password", data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
    localStorage.removeItem("token")
  },
}
