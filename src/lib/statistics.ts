import type { PomodoroSession } from '../types'

export interface DailyStat {
  date: string        // YYYY-MM-DD
  focusMinutes: number
  sessions: number
}

export interface WeekStat {
  day: string         // Mon, Tue, …
  focusMinutes: number
  sessions: number
}

export function getTotalFocusMinutes(sessions: PomodoroSession[]): number {
  return sessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0)
}

export function getTotalSessions(sessions: PomodoroSession[]): number {
  return sessions.filter((s) => s.mode === 'focus').length
}

export function getDailyStats(sessions: PomodoroSession[], days = 7): DailyStat[] {
  const result: DailyStat[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)

    const daySessions = sessions.filter((s) => {
      const sd = new Date(s.startedAt).toISOString().slice(0, 10)
      return sd === dateStr && s.mode === 'focus'
    })

    result.push({
      date: dateStr,
      focusMinutes: daySessions.reduce((a, s) => a + s.durationMinutes, 0),
      sessions: daySessions.length,
    })
  }

  return result
}

export function getWeekStats(sessions: PomodoroSession[]): WeekStat[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return getDailyStats(sessions, 7).map((d) => ({
    day: days[new Date(d.date + 'T12:00:00').getDay()],
    focusMinutes: d.focusMinutes,
    sessions: d.sessions,
  }))
}

export function getCurrentStreak(sessions: PomodoroSession[]): number {
  if (sessions.length === 0) return 0

  const focusSessions = sessions.filter((s) => s.mode === 'focus')
  if (focusSessions.length === 0) return 0

  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let checkDate = new Date()

  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    const hasSession = focusSessions.some(
      (s) => new Date(s.startedAt).toISOString().slice(0, 10) === dateStr,
    )

    if (!hasSession) {
      // Allow today to be empty (streak counts completed past days + today if any)
      if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      }
      break
    }

    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

export function getTodayFocusMinutes(sessions: PomodoroSession[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return sessions
    .filter(
      (s) => s.mode === 'focus' && new Date(s.startedAt).toISOString().slice(0, 10) === today,
    )
    .reduce((a, s) => a + s.durationMinutes, 0)
}
