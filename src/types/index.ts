export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  remainingSeconds: number
  completedFocusSessions: number
  startedAt: number | null       // epoch ms when current session started (or resumed)
  pausedAt: number | null        // epoch ms when paused
  totalPausedMs: number          // cumulative paused duration
}

export interface Settings {
  focusDuration: number          // minutes
  shortBreakDuration: number     // minutes
  longBreakDuration: number      // minutes
  longBreakInterval: number      // sessions between long breaks
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  completed: boolean
  createdAt: number
  completedAt?: number
}

export interface PomodoroSession {
  id: string
  taskId?: string
  startedAt: number
  completedAt: number
  durationMinutes: number        // actual focus minutes
  mode: TimerMode
}

export type View = 'focus' | 'tasks' | 'statistics' | 'settings'
