interface LineChartProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

export function LineChart({ data, height = 200, color = "#3b82f6" }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No data available</div>
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1

  const padding = 10
  const chartWidth = 100 - padding * 2
  const chartHeight = 100 - padding * 2

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth
    const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight
    return { x, y, value: item.value, label: item.label }
  })

  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L"
      return `${command} ${point.x} ${point.y}`
    })
    .join(" ")

  const areaPath = data.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${100 - padding} L ${padding} ${100 - padding} Z`
    : ""

  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 100 100"
        className="w-full border rounded-lg bg-muted/20"
        style={{ height: `${height}px` }}
        preserveAspectRatio="xMidYMid meet"
      >
        {areaPath && (
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1"
            fill={color}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="truncate max-w-[80px]">{item.label}</div>
            <div className="font-medium text-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
