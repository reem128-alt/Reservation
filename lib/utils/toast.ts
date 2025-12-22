import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/utils/error"

export function toastApiError(title: string, error: unknown, fallbackDescription?: string) {
  const message = getApiErrorMessage(error)
  toast.error(title, { description: message ?? fallbackDescription })
}
