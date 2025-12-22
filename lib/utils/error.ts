export function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null

  const e = error as {
    message?: unknown
    response?: {
      data?: unknown
    }
  }

  const data = e.response?.data
  if (data && typeof data === "object") {
    const d = data as { message?: unknown }
    if (typeof d.message === "string" && d.message.trim()) return d.message
  }

  if (typeof e.message === "string" && e.message.trim()) return e.message

  return null
}
