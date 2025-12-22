interface PieChartProps {
  data: Array<{ label: string; value: number }>
  size?: number
  colors?: string[]
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
]

export function PieChart({ data, size = 200, colors = DEFAULT_COLORS }: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data available</div>
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return <div className="text-sm text-muted-foreground">No data to display</div>
  }

  const slices = data.reduce<Array<{
    pathData: string
    color: string
    percentage: number
    label: string
    value: number
    endAngle: number
  }>>((acc, item, index) => {
    const currentAngle = acc.length === 0 ? 0 : acc[acc.length - 1].endAngle
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    let pathData: string
    
    if (angle >= 359.99) {
      pathData = `M 50 10 A 40 40 0 1 1 49.99 10 Z`
    } else {
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = 50 + 40 * Math.cos(startRad)
      const y1 = 50 + 40 * Math.sin(startRad)
      const x2 = 50 + 40 * Math.cos(endRad)
      const y2 = 50 + 40 * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(" ")
    }

    acc.push({
      pathData,
      color: colors[index % colors.length],
      percentage,
      endAngle,
      label: item.label,
      value: item.value,
    })

    return acc
  }, [])

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <svg viewBox="0 0 100 100" className="shrink-0" style={{ width: size, height: size }}>
        {slices.map((slice, index) => (
          <path key={index} d={slice.pathData} fill={slice.color} className="hover:opacity-80 transition-opacity" />
        ))}
      </svg>
      <div className="space-y-2 flex-1">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm truncate">{slice.label}</span>
            </div>
            <div className="text-sm font-medium whitespace-nowrap">
              {slice.value} ({slice.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
