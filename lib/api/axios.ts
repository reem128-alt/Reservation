import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const requestUrl = String(error.config?.url ?? "")
      const isChangePasswordRequest = requestUrl.includes("/auth/change-password")
      if (isChangePasswordRequest) {
        return Promise.reject(error)
      }

      const hadAuthHeader = Boolean(error.config?.headers?.Authorization)
      if (hadAuthHeader) {
        localStorage.removeItem("token")
      }

      const pathname = window.location.pathname
      const localeSegment = pathname.split("/")[1]
      const locale = localeSegment === "en" || localeSegment === "ar" ? localeSegment : "en"
      const isAuthRoute = pathname.includes("/auth/")

      if (!isAuthRoute) {
        window.location.href = `/${locale}/auth/login`
      }
    }
    return Promise.reject(error)
  }
)
