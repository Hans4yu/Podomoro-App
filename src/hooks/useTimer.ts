import { useEffect, useRef, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { TimerState, TimerMode, Settings, PomodoroSession, Task } from '../types'
import { getDurationSeconds, getNextMode } from '../lib/timer'
import { sendNotification } from '../lib/notifications'
import { useSound } from './useSound'

const STORAGE_KEY = 'podomoro-timer-state'
const SESSIONS_KEY = 'podomoro-sessions'

function defaultTimerState(settings: Settings): TimerState {
  return {
    mode: 'focus',
    status: 'idle',
    remainingSeconds: settings.focusDuration * 60,
    completedFocusSessions: 0,
    startedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
  }
}

interface UseTimerOptions {
  settings: Settings
  activeTaskId?: string
  onSessionComplete?: (session: PomodoroSession) => void
  onFocusComplete?: () => void
  tasks: Task[]
}

export function useTimer({
  settings,
  activeTaskId,
  onSessionComplete,
  onFocusComplete,
  tasks,
}: UseTimerOptions) {
  const [state, setState] = useLocalStorage<TimerState>(
    STORAGE_KEY,
    defaultTimerState(settings),
  )
  const [, setSessions] = useLocalStorage<PomodoroSession[]>(SESSIONS_KEY, [])
  const sound = useSound(settings)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Recalculate remaining time from timestamps for accuracy
  const calculateRemaining = useCallback((s: TimerState): number => {
    if (s.status !== 'running' || s.startedAt === null) return s.remainingSeconds
    const elapsed = (Date.now() - s.startedAt - s.totalPausedMs) / 1000
    const duration = getDurationSeconds(s.mode, settings)
    return Math.max(0, Math.round(duration - elapsed))
  }, [settings])

  const completeSession = useCallback((completedState: TimerState) => {
    const isFocus = completedState.mode === 'focus'
    const newCompleted = isFocus
      ? completedState.completedFocusSessions + 1
      : completedState.completedFocusSessions

    // Save session record
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId: activeTaskId,
      startedAt: completedState.startedAt ?? Date.now(),
      completedAt: Date.now(),
      durationMinutes: getDurationSeconds(completedState.mode, settings) / 60,
      mode: completedState.mode,
    }

    setSessions((prev) => [...prev, session])
    onSessionComplete?.(session)

    if (isFocus) {
      sound.playFocusComplete()
      sendNotification('Focus session complete!', 'Time for a break.', settings)
      onFocusComplete?.()
    } else {
      sound.playBreakComplete()
      sendNotification('Break time over!', 'Ready to focus?', settings)
    }

    const nextMode = getNextMode(completedState.mode, newCompleted, settings)

    if (
      (isFocus && settings.autoStartBreaks) ||
      (!isFocus && settings.autoStartFocus)
    ) {
      const nextDuration = getDurationSeconds(nextMode, settings)
      setState({
        mode: nextMode,
        status: 'running',
        remainingSeconds: nextDuration,
        completedFocusSessions: newCompleted,
        startedAt: Date.now(),
        pausedAt: null,
        totalPausedMs: 0,
      })
    } else {
      setState({
        mode: nextMode,
        status: 'idle',
        remainingSeconds: getDurationSeconds(nextMode, settings),
        completedFocusSessions: newCompleted,
        startedAt: null,
        pausedAt: null,
        totalPausedMs: 0,
      })
    }
  }, [settings, activeTaskId, onSessionComplete, onFocusComplete, setSessions, sound, setState])

  // Tick interval
  useEffect(() => {
    const tick = () => {
      const s = stateRef.current
      if (s.status !== 'running') return

      const remaining = calculateRemaining(s)

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        completeSession(s)
        return
      }

      setState((prev) => ({
        ...prev,
        remainingSeconds: calculateRemaining(prev),
      }))
    }

    if (state.status === 'running') {
      intervalRef.current = setInterval(tick, 500)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.status, calculateRemaining, completeSession, setState])

  // Update document title
  useEffect(() => {
    const remaining = state.status === 'running'
      ? calculateRemaining(state)
      : state.remainingSeconds
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    const activeTask = tasks.find((t) => t.id === activeTaskId)
    const taskLabel = activeTask ? ` — ${activeTask.title}` : ''
    document.title =
      state.status === 'running'
        ? `${timeStr}${taskLabel} · Podomoro`
        : 'Podomoro'
    return () => {
      document.title = 'Podomoro'
    }
  }, [state, calculateRemaining, activeTaskId, tasks])

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'running',
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
      remainingSeconds: getDurationSeconds(prev.mode, settings),
    }))
  }, [setState, settings])

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev
      return {
        ...prev,
        status: 'paused',
        pausedAt: Date.now(),
        remainingSeconds: calculateRemaining(prev),
      }
    })
  }, [setState, calculateRemaining])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused' || prev.pausedAt === null) return prev
      const pausedDuration = Date.now() - prev.pausedAt
      return {
        ...prev,
        status: 'running',
        pausedAt: null,
        totalPausedMs: prev.totalPausedMs + pausedDuration,
      }
    })
  }, [setState])

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      remainingSeconds: getDurationSeconds(prev.mode, settings),
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
    }))
  }, [setState, settings])

  const skip = useCallback(() => {
    setState((prev) => {
      const isFocus = prev.mode === 'focus'
      const newCompleted = isFocus
        ? prev.completedFocusSessions + 1
        : prev.completedFocusSessions
      const nextMode = getNextMode(prev.mode, newCompleted, settings)
      return {
        mode: nextMode,
        status: 'idle',
        remainingSeconds: getDurationSeconds(nextMode, settings),
        completedFocusSessions: newCompleted,
        startedAt: null,
        pausedAt: null,
        totalPausedMs: 0,
      }
    })
  }, [setState, settings])

  const setMode = useCallback(
    (mode: TimerMode) => {
      setState({
        mode,
        status: 'idle',
        remainingSeconds: getDurationSeconds(mode, settings),
        completedFocusSessions: state.completedFocusSessions,
        startedAt: null,
        pausedAt: null,
        totalPausedMs: 0,
      })
    },
    [setState, settings, state.completedFocusSessions],
  )

  const displayRemaining =
    state.status === 'running' ? calculateRemaining(state) : state.remainingSeconds

  const totalDuration = getDurationSeconds(state.mode, settings)
  const progress = totalDuration > 0 ? 1 - displayRemaining / totalDuration : 0

  return {
    state,
    displayRemaining,
    progress,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
  }
}
