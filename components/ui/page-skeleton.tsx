import { Skeleton } from "./skeleton"

type PageSkeletonProps = {
  header?: boolean
  stats?: number
  tableRows?: number
  tableCols?: number
  cardRows?: number
  cardCols?: number
}

export function PageSkeleton({
  header = true,
  stats = 3,
  tableRows = 5,
  tableCols = 5,
  cardRows = 0,
  cardCols = 3,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      {header && (
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        </div>
      )}

      {stats > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: stats }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      )}

      {cardRows > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cardCols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cardRows * cardCols }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {tableCols > 0 && tableRows > 0 && (
        <div className="rounded-2xl border overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-4">
            <div className="w-full overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {Array.from({ length: tableCols }).map((_, i) => (
                      <th key={i} className="px-4 py-3 text-left">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: tableRows }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      {Array.from({ length: tableCols }).map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                          <Skeleton className="h-4 w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading spinner component
export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
