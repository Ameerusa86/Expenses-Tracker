import React from 'react'

export function Sparkline({
  points,
  width = 80,
  height = 28,
  stroke = 'currentColor',
  className,
}: {
  points: number[]
  width?: number
  height?: number
  stroke?: string
  className?: string
}) {
  const n = points.length
  const w = width
  const h = height
  const min = Math.min(...points, 0)
  const max = Math.max(...points, 0)
  const span = max - min || 1
  const step = n > 1 ? w / (n - 1) : w
  const d = points
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / span) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  )
}
