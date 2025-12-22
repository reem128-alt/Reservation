export function formatDateTime(
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
  fallback = "-"
) {
  if (value == null) return fallback

  const raw =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : ""

  if (!raw) return fallback

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString(undefined, options)
}

export function formatMoney(amount: number, currency?: string | null | undefined, options?: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
      ...options,
    }).format(amount)
  } catch {
    return `${amount} ${currency || "USD"}`
  }
}

export function formatMoneyWithCurrency(amount: number, currency: unknown, options?: Intl.NumberFormatOptions) {
  const c = typeof currency === "string" ? currency : typeof currency === "number" ? String(currency) : ""
  return formatMoney(amount, c || "USD", options)
}

export function formatDistanceToNow(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return past.toLocaleDateString()
}
