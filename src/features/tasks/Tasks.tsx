import { useState } from 'react'
import { Plus, Check, Trash2, Edit2, X, Play, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task } from '../../types'

interface TasksProps {
  tasks: Task[]
  activeTaskId?: string
  onAddTask: (title: string, estimatedPomodoros: number) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onSetActiveTask: (id: string | undefined) => void
}

interface EditingState {
  id: string
  title: string
  estimatedPomodoros: number
}

export function Tasks({
  tasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSetActiveTask,
}: TasksProps) {
  const [newTitle, setNewTitle] = useState('')
  const [newEstimate, setNewEstimate] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    onAddTask(title, newEstimate)
    setNewTitle('')
    setNewEstimate(1)
    setShowAddForm(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const title = editing.title.trim()
    if (!title) return
    onUpdateTask(editing.id, {
      title,
      estimatedPomodoros: editing.estimatedPomodoros,
    })
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteTask(id)
      setDeleteConfirm(null)
      if (activeTaskId === id) onSetActiveTask(undefined)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const pending = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
          Tasks
          {pending.length > 0 && (
            <span className="ml-2 text-xs font-normal text-stone-400">
              {pending.length} remaining
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sage-700 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/30 rounded-lg transition-colors"
          aria-label="Add new task"
        >
          <Plus size={15} />
          Add task
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleAdd}
            className="flex flex-col gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3 overflow-hidden"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What are you working on?"
              autoFocus
              maxLength={120}
              className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>Estimated:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNewEstimate((v) => Math.max(1, v - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors font-medium"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-medium tabular-nums">{newEstimate}</span>
                  <button
                    type="button"
                    onClick={() => setNewEstimate((v) => Math.min(20, v + 1))}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors font-medium"
                  >
                    +
                  </button>
                </div>
                <span>
                  🍅 pomodoro{newEstimate !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 text-xs bg-sage-600 dark:bg-sage-500 text-white rounded-lg hover:bg-sage-700 dark:hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add task
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {tasks.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2 py-12 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-1">
            <Check size={20} className="text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No tasks yet</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Add a task to link with your focus sessions
          </p>
        </motion.div>
      )}

      {/* Pending Tasks */}
      <AnimatePresence initial={false}>
        {pending.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isActive={activeTaskId === task.id}
            editing={editing}
            deleteConfirm={deleteConfirm}
            onSetActive={() =>
              onSetActiveTask(activeTaskId === task.id ? undefined : task.id)
            }
            onToggleComplete={() =>
              onUpdateTask(task.id, {
                completed: !task.completed,
                completedAt: !task.completed ? Date.now() : undefined,
              })
            }
            onStartEdit={() =>
              setEditing({
                id: task.id,
                title: task.title,
                estimatedPomodoros: task.estimatedPomodoros,
              })
            }
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditing(null)}
            onEditChange={(updates) =>
              setEditing((prev) => (prev ? { ...prev, ...updates } : prev))
            }
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </AnimatePresence>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-stone-400 dark:text-stone-600 uppercase tracking-wider mb-2">
            Completed ({completed.length})
          </p>
          <AnimatePresence initial={false}>
            {completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={false}
                editing={editing}
                deleteConfirm={deleteConfirm}
                onSetActive={() => {}}
                onToggleComplete={() =>
                  onUpdateTask(task.id, { completed: false, completedAt: undefined })
                }
                onStartEdit={() =>
                  setEditing({
                    id: task.id,
                    title: task.title,
                    estimatedPomodoros: task.estimatedPomodoros,
                  })
                }
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditing(null)}
                onEditChange={(updates) =>
                  setEditing((prev) => (prev ? { ...prev, ...updates } : prev))
                }
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TaskCard
// ──────────────────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  isActive: boolean
  editing: EditingState | null
  deleteConfirm: string | null
  onSetActive: () => void
  onToggleComplete: () => void
  onStartEdit: () => void
  onSaveEdit: (e: React.FormEvent) => void
  onCancelEdit: () => void
  onEditChange: (updates: Partial<EditingState>) => void
  onDelete: () => void
}

function TaskCard({
  task,
  isActive,
  editing,
  deleteConfirm,
  onSetActive,
  onToggleComplete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onDelete,
}: TaskCardProps) {
  const isEditing = editing?.id === task.id
  const confirmDelete = deleteConfirm === task.id

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex flex-col gap-2 p-3 rounded-xl border transition-all mb-2 ${
        isActive
          ? 'border-sage-300 dark:border-sage-700 bg-sage-50/50 dark:bg-sage-900/20'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600'
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      {isEditing ? (
        <form onSubmit={onSaveEdit} className="flex flex-col gap-2">
          <input
            type="text"
            value={editing.title}
            onChange={(e) => onEditChange({ title: e.target.value })}
            autoFocus
            maxLength={120}
            className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-100 focus:outline-none border-b border-stone-200 dark:border-stone-700 pb-1"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <button
                type="button"
                onClick={() =>
                  onEditChange({ estimatedPomodoros: Math.max(1, editing.estimatedPomodoros - 1) })
                }
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                −
              </button>
              <span className="w-4 text-center font-medium tabular-nums">
                {editing.estimatedPomodoros}
              </span>
              <button
                type="button"
                onClick={() =>
                  onEditChange({ estimatedPomodoros: Math.min(20, editing.estimatedPomodoros + 1) })
                }
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                +
              </button>
              <span className="ml-1">🍅</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <X size={14} />
              </button>
              <button
                type="submit"
                className="px-2 py-0.5 text-xs bg-sage-600 text-white rounded hover:bg-sage-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-2.5">
          {/* Checkbox */}
          <button
            onClick={onToggleComplete}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors ${
              task.completed
                ? 'bg-sage-500 border-sage-500 flex items-center justify-center'
                : 'border-stone-300 dark:border-stone-600 hover:border-sage-400'
            }`}
          >
            {task.completed && <Check size={10} className="text-white" />}
          </button>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-snug text-stone-800 dark:text-stone-100 ${
                task.completed ? 'line-through text-stone-400 dark:text-stone-600' : ''
              }`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-0.5">
                🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
              {isActive && (
                <span className="text-[10px] font-medium text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/40 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!task.completed && (
              <button
                onClick={onSetActive}
                aria-label={isActive ? 'Deselect task' : 'Set as active task'}
                title={isActive ? 'Deselect' : 'Focus on this'}
                className="p-1.5 rounded-lg text-stone-400 hover:text-sage-600 dark:hover:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/30 transition-colors"
              >
                {isActive ? <Circle size={13} /> : <Play size={13} />}
              </button>
            )}
            <button
              onClick={onStartEdit}
              aria-label="Edit task"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={onDelete}
              aria-label={confirmDelete ? 'Confirm delete' : 'Delete task'}
              className={`p-1.5 rounded-lg transition-colors ${
                confirmDelete
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
