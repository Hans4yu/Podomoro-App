import type { TimerMode, Settings } from '../types'

export function getDurationSeconds(mode: TimerMode, settings: Settings): number {
  switch (mode) {
    case 'focus':
      return settings.focusDuration * 60
    case 'shortBreak':
      return settings.shortBreakDuration * 60
    case 'longBreak':
      return settings.longBreakDuration * 60
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60)
  const s = Math.max(0, seconds) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getNextMode(
  current: TimerMode,
  completedFocusSessions: number,
  settings: Settings,
): TimerMode {
  if (current !== 'focus') return 'focus'
  if (completedFocusSessions % settings.longBreakInterval === 0) {
    return 'longBreak'
  }
  return 'shortBreak'
}

export function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case 'focus':
      return 'Focus'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}
