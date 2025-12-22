interface BarChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

export function BarChart({ data, color = "hsl(var(--primary))" }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data available</div>
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate">{item.label}</span>
              <span className="text-muted-foreground ml-2">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
