import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Timer, CheckSquare, Flame, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PomodoroSession, Task } from '../../types'
import {
  getTotalFocusMinutes,
  getTotalSessions,
  getCurrentStreak,
  getTodayFocusMinutes,
  getWeekStats,
} from '../../lib/statistics'

interface StatisticsProps {
  sessions: PomodoroSession[]
  tasks: Task[]
  onStartFocus: () => void
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}

function StatCard({ label, value, sub, icon, accent = 'text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30' }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
          {label}
        </span>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-stone-800 dark:text-stone-100 tracking-tight">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-stone-700 dark:text-stone-200">{label}</p>
      <p className="text-stone-500 dark:text-stone-400">{formatMinutes(payload[0].value)} focus</p>
    </div>
  )
}

export function Statistics({ sessions, tasks, onStartFocus }: StatisticsProps) {
  const weekStats = useMemo(() => getWeekStats(sessions), [sessions])
  const totalMinutes = useMemo(() => getTotalFocusMinutes(sessions), [sessions])
  const totalSessions = useMemo(() => getTotalSessions(sessions), [sessions])
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed).length, [tasks])
  const streak = useMemo(() => getCurrentStreak(sessions), [sessions])
  const todayMinutes = useMemo(() => getTodayFocusMinutes(sessions), [sessions])

  const isEmpty = sessions.length === 0

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16 text-center max-w-xs mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <BarChart2Icon className="text-stone-400" />
        </div>
        <div>
          <p className="font-semibold text-stone-700 dark:text-stone-200">No data yet</p>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
            Complete your first focus session to see your productivity stats here.
          </p>
        </div>
        <button
          onClick={onStartFocus}
          className="mt-2 px-5 py-2 bg-sage-600 dark:bg-sage-500 text-white text-sm font-medium rounded-xl hover:bg-sage-700 dark:hover:bg-sage-600 transition-colors"
        >
          Start your first session
        </button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl">
      <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Statistics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Focus"
          value={formatMinutes(totalMinutes)}
          sub="all time"
          icon={<Timer size={14} />}
        />
        <StatCard
          label="Today"
          value={formatMinutes(todayMinutes)}
          sub={`${totalSessions} sessions total`}
          icon={<TrendingUp size={14} />}
          accent="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard
          label="Tasks Done"
          value={String(completedTasks)}
          sub={`${tasks.length} total`}
          icon={<CheckSquare size={14} />}
          accent="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30"
        />
        <StatCard
          label="Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          sub="current streak"
          icon={<Flame size={14} />}
          accent="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30"
        />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-4">
          Weekly Focus (minutes)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekStats} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-stone-100 dark:text-stone-800" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-stone-400 dark:text-stone-600"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-stone-400 dark:text-stone-600"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="focusMinutes"
              fill="#607f60"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
            Recent Sessions
          </p>
          <div className="flex flex-col gap-1.5">
            {[...sessions]
              .filter((s) => s.mode === 'focus')
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 5)
              .map((s) => {
                const task = tasks.find((t) => t.id === s.taskId)
                const date = new Date(s.completedAt)
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-stone-700 dark:text-stone-200">
                        {task?.title ?? 'Focus session'}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">
                        {date.toLocaleDateString()} ·{' '}
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {formatMinutes(s.durationMinutes)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

// Simple inline icon to avoid import issues
function BarChart2Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
