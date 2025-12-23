"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DataTableSkeleton({
  columns,
  rowCount = 5,
  searchable = true,
  filterable = false,
}: {
  columns: number
  rowCount?: number
  searchable?: boolean
  filterable?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {searchable && <Skeleton className="h-10 w-64" />}
        <Skeleton className="h-10 w-28" />
      </div>

      {filterable && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="p-4 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
