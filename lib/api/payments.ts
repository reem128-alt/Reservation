import { apiClient } from "./axios"
import type {
  PaymentBookingUser,
  PaymentBookingResource,
  PaymentBooking,
  PaymentMethodDetails,
  Payment,
  PaymentsMeta,
  PaymentsListResponse,
} from "../../app/types/payments"

export type {
  PaymentBookingUser,
  PaymentBookingResource,
  PaymentBooking,
  PaymentMethodDetails,
  Payment,
  PaymentsMeta,
  PaymentsListResponse,
}

function normalizeListResponse(payload: unknown): PaymentsListResponse {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.data)) {
      return payload as PaymentsListResponse
    }
  }
  if (Array.isArray(payload)) {
    return { data: payload as Payment[] }
  }
  return { data: [] }
}

export const paymentsApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaymentsListResponse> => {
    const response = await apiClient.get<unknown>("/payments", { params })
    return normalizeListResponse(response.data)
  },
}
