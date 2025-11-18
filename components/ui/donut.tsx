'use client'
import * as React from 'react'

export type DonutProps = {
  value: number // 0..100
  size?: number
  stroke?: number
  trackColor?: string
  valueColor?: string
  center?: React.ReactNode
  className?: string
}

export function Donut({
  value,
  size = 72,
  stroke = 8,
  trackColor = '#e5e7eb', // tailwind gray-200
  valueColor = '#22c55e', // tailwind green-500
  center,
  className,
}: DonutProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={valueColor}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        {center ?? <span>{clamped.toFixed(0)}%</span>}
      </div>
    </div>
  )
}
