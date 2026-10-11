import React from 'react'


interface CircularProgressProps {
  progress: number     // 0..1
  size?: number
  strokeWidth?: number
  mode: 'focus' | 'shortBreak' | 'longBreak'
  children: React.ReactNode
}

const MODE_COLORS = {
  focus: '#4c6b4c',       // sage-600
  shortBreak: '#2563eb',  // blue-600
  longBreak: '#7c3aed',   // violet-600
}

const MODE_COLORS_DARK = {
  focus: '#86efac',       // green-300
  shortBreak: '#93c5fd',  // blue-300
  longBreak: '#c4b5fd',   // violet-300
}

export function CircularProgress({
  progress,
  size = 260,
  strokeWidth = 8,
  mode,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))

  // Detect dark mode via class on html element
  const isDark = document.documentElement.classList.contains('dark')
  const color = isDark ? MODE_COLORS_DARK[mode] : MODE_COLORS[mode]

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200 dark:text-stone-700"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
