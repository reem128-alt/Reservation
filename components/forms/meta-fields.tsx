"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type MetaRow = {
  key: string
  value: string
}

function coerceMetaValue(value: string): unknown {
  const trimmed = value.trim()
  if (trimmed === "") return ""
  if (trimmed === "true") return true
  if (trimmed === "false") return false
  const num = Number(trimmed)
  if (!Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(trimmed)) return num
  return value
}

export function rowsFromMeta(meta: unknown): MetaRow[] {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [{ key: "", value: "" }]
  const entries = Object.entries(meta as Record<string, unknown>)
  if (entries.length === 0) return [{ key: "", value: "" }]
  return entries.map(([k, v]) => {
    if (v === null) return { key: k, value: "null" }
    if (typeof v === "string") return { key: k, value: v }
    if (typeof v === "number" || typeof v === "boolean") return { key: k, value: String(v) }
    try {
      return { key: k, value: JSON.stringify(v) }
    } catch {
      return { key: k, value: "" }
    }
  })
}

export function metaFromRows(rows: MetaRow[]): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  for (const row of rows) {
    const k = row.key.trim()
    if (!k) continue
    next[k] = coerceMetaValue(row.value)
  }
  return next
}

export type MetaFieldsProps = {
  label?: string
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  errorMessage?: string
}

export function MetaFields({ label = "Meta", value, onChange, errorMessage }: MetaFieldsProps) {
  const [rows, setRows] = React.useState<MetaRow[]>(() => rowsFromMeta(value))

  React.useEffect(() => {
    setRows(rowsFromMeta(value))
  }, [value])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder="Key"
              value={row.key}
              onChange={(e) => {
                const nextRows = rows.map((r, i) => (i === idx ? { ...r, key: e.target.value } : r))
                setRows(nextRows)
                onChange(metaFromRows(nextRows))
              }}
            />
            <Input
              placeholder="Value"
              value={row.value}
              onChange={(e) => {
                const nextRows = rows.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r))
                setRows(nextRows)
                onChange(metaFromRows(nextRows))
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="px-3"
              onClick={() => {
                const nextRows = rows.filter((_, i) => i !== idx)
                const safeNextRows = nextRows.length ? nextRows : [{ key: "", value: "" }]
                setRows(safeNextRows)
                onChange(metaFromRows(safeNextRows))
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const nextRows = [...rows, { key: "", value: "" }]
              setRows(nextRows)
            }}
          >
            Add meta field
          </Button>
        </div>
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
