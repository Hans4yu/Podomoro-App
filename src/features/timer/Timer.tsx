import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TimerMode, Settings, Task, PomodoroSession } from '../../types'
import { useTimer } from '../../hooks/useTimer'
import { formatTime, getModeLabel } from '../../lib/timer'
import { CircularProgress } from '../../components/CircularProgress'

interface TimerProps {
  settings: Settings
  activeTaskId?: string
  tasks: Task[]
  onSessionComplete?: (session: PomodoroSession) => void
  onFocusComplete?: (taskId?: string) => void
}

const MODE_TABS: { id: TimerMode; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'shortBreak', label: 'Short Break' },
  { id: 'longBreak', label: 'Long Break' },
]

export function Timer({
  settings,
  activeTaskId,
  tasks,
  onSessionComplete,
  onFocusComplete,
}: TimerProps) {
  const { state, displayRemaining, progress, start, pause, resume, reset, skip, setMode } =
    useTimer({
      settings,
      activeTaskId,
      tasks,
      onSessionComplete,
      onFocusComplete: () => onFocusComplete?.(activeTaskId),
    })

  const activeTask = tasks.find((t) => t.id === activeTaskId)

  const handleMainAction = () => {
    if (state.status === 'idle') start()
    else if (state.status === 'running') pause()
    else resume()
  }

  const dotsCount = settings.longBreakInterval
  const filledDots = state.completedFocusSessions % settings.longBreakInterval

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Mode Tabs */}
      <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1 gap-1" role="tablist">
        {MODE_TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={state.mode === id}
            onClick={() => setMode(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              state.mode === id
                ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <CircularProgress progress={progress} mode={state.mode} size={240} strokeWidth={7}>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
            {getModeLabel(state.mode)}
          </span>
          <motion.span
            key={displayRemaining}
            className="text-5xl font-semibold tabular-nums tracking-tight text-stone-800 dark:text-stone-100"
            initial={{ scale: 0.97 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatTime(displayRemaining)}
          </motion.span>
          {activeTask && (
            <span className="text-xs text-stone-400 dark:text-stone-500 max-w-[160px] truncate mt-1">
              {activeTask.title}
            </span>
          )}
        </div>
      </CircularProgress>

      {/* Session dots */}
      <div className="flex items-center gap-1.5" aria-label={`${filledDots} of ${dotsCount} sessions completed`}>
        {Array.from({ length: dotsCount }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < filledDots
                ? 'bg-sage-500 dark:bg-sage-400'
                : 'bg-stone-200 dark:bg-stone-700'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          title="Reset"
          aria-label="Reset timer"
          className="p-2.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <RotateCcw size={18} />
        </button>

        <motion.button
          onClick={handleMainAction}
          aria-label={
            state.status === 'idle'
              ? 'Start timer'
              : state.status === 'running'
              ? 'Pause timer'
              : 'Resume timer'
          }
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-8 py-3 bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white rounded-2xl font-medium text-sm shadow-sm transition-colors"
        >
          {state.status === 'running' ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
          <span>
            {state.status === 'idle' ? 'Start' : state.status === 'running' ? 'Pause' : 'Resume'}
          </span>
        </motion.button>

        <button
          onClick={skip}
          title="Skip session"
          aria-label="Skip current session"
          className="p-2.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Total session counter */}
      <p className="text-xs text-stone-400 dark:text-stone-600">
        {state.completedFocusSessions} focus session
        {state.completedFocusSessions !== 1 ? 's' : ''} completed today
      </p>
    </div>
  )
}
