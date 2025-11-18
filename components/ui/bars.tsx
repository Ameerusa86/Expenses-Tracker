import React from 'react'

export function Bars({
  values,
  width = 160,
  height = 60,
  positiveColor = '#22c55e',
  negativeColor = '#ef4444',
  className,
}: {
  values: number[]
  width?: number
  height?: number
  positiveColor?: string
  negativeColor?: string
  className?: string
}) {
  const n = values.length
  const w = width
  const h = height
  const barGap = 2
  const barWidth = Math.max(1, Math.floor((w - barGap * (n - 1)) / n))
  const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)))
  const mid = h / 2

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden
    >
      {values.map((v, i) => {
        const isPos = v >= 0
        const ratio = Math.abs(v) / maxAbs
        const bh = Math.max(1, Math.round((h / 2) * ratio))
        const x = i * (barWidth + barGap)
        const y = isPos ? mid - bh : mid
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={bh}
            rx={1}
            fill={isPos ? positiveColor : negativeColor}
          />
        )
      })}
      {/* mid line */}
      <line x1={0} y1={mid} x2={w} y2={mid} stroke="#e5e7eb" strokeWidth={1} />
    </svg>
  )
}
