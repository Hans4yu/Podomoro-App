import { useState, useCallback } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Sidebar, BottomNav } from './components/Navigation'
import { Timer } from './features/timer/Timer'
import { Tasks } from './features/tasks/Tasks'
import { Statistics } from './features/statistics/Statistics'
import { SettingsPage } from './features/settings/Settings'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Task, PomodoroSession, Settings, View } from './types'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: false,
  theme: 'system',
}

function generateId(): string {
  return crypto.randomUUID()
}

function AppContent() {
  const [view, setView] = useState<View>('focus')
  const [settings, setSettings] = useLocalStorage<Settings>('podomoro-settings', DEFAULT_SETTINGS)
  const [tasks, setTasks] = useLocalStorage<Task[]>('podomoro-tasks', [])
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('podomoro-sessions', [])
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>()

  const handleAddTask = useCallback(
    (title: string, estimatedPomodoros: number) => {
      const task: Task = {
        id: generateId(),
        title,
        estimatedPomodoros,
        completedPomodoros: 0,
        completed: false,
        createdAt: Date.now(),
      }
      setTasks((prev) => [task, ...prev])
    },
    [setTasks],
  )

  const handleUpdateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    },
    [setTasks],
  )

  const handleDeleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    },
    [setTasks],
  )

  const handleSessionComplete = useCallback(
    (session: PomodoroSession) => {
      setSessions((prev) => [...prev, session])
    },
    [setSessions],
  )

  const handleFocusComplete = useCallback(
    (taskId?: string) => {
      if (!taskId) return
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t,
        ),
      )
    },
    [setTasks],
  )

  const handleUpdateSettings = useCallback(
    (updates: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...updates }))
    },
    [setSettings],
  )

  const handleResetSessions = useCallback(() => {
    if (window.confirm('Are you sure? This will permanently delete all session history.')) {
      setSessions([])
    }
  }, [setSessions])

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <Sidebar activeView={view} onNavigate={setView} />

      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            {view === 'focus' && (
              <FocusView
                settings={settings}
                tasks={tasks}
                sessions={sessions}
                activeTaskId={activeTaskId}
                onSetActiveTask={setActiveTaskId}
                onSessionComplete={handleSessionComplete}
                onFocusComplete={handleFocusComplete}
              />
            )}
            {view === 'tasks' && (
              <div className="flex-1 flex flex-col px-4 md:px-8 py-6 max-w-2xl w-full mx-auto md:mx-0">
                <Tasks
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onSetActiveTask={setActiveTaskId}
                />
              </div>
            )}
            {view === 'statistics' && (
              <div className="flex-1 flex flex-col px-4 md:px-8 py-6 max-w-2xl w-full mx-auto md:mx-0">
                <Statistics
                  sessions={sessions}
                  tasks={tasks}
                  onStartFocus={() => setView('focus')}
                />
              </div>
            )}
            {view === 'settings' && (
              <div className="flex-1 flex flex-col px-4 md:px-8 py-6 max-w-lg w-full mx-auto md:mx-0">
                <SettingsPage
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetSessions={handleResetSessions}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeView={view} onNavigate={setView} />
    </div>
  )
}

interface FocusViewProps {
  settings: Settings
  tasks: Task[]
  sessions: PomodoroSession[]
  activeTaskId?: string
  onSetActiveTask: (id: string | undefined) => void
  onSessionComplete: (session: PomodoroSession) => void
  onFocusComplete: (taskId?: string) => void
}

function FocusView({
  settings,
  tasks,
  sessions: _sessions,
  activeTaskId,
  onSetActiveTask,
  onSessionComplete,
  onFocusComplete,
}: FocusViewProps) {
  const pendingTasks = tasks.filter((t) => !t.completed)

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-0">
      {/* Timer Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 min-h-[60vh] md:min-h-screen">
        <Timer
          settings={settings}
          activeTaskId={activeTaskId}
          tasks={tasks}
          onSessionComplete={onSessionComplete}
          onFocusComplete={onFocusComplete}
        />
      </div>

      {/* Task Quick-Select */}
      {pendingTasks.length > 0 && (
        <aside className="md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 px-4 py-6 bg-white dark:bg-stone-900/50 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
            Focus on
          </p>
          <div className="flex flex-col gap-1.5">
            {pendingTasks.map((task) => (
              <button
                key={task.id}
                onClick={() =>
                  onSetActiveTask(activeTaskId === task.id ? undefined : task.id)
                }
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                  activeTaskId === task.id
                    ? 'bg-sage-50 dark:bg-sage-900/30 border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200'
                    : 'border-transparent text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span className="flex-1 truncate">{task.title}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                  🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
