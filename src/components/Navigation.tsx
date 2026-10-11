import { Timer, CheckSquare, BarChart2, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../types'

interface NavItem {
  id: View
  label: string
  Icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: 'focus', label: 'Focus', Icon: Timer },
  { id: 'tasks', label: 'Tasks', Icon: CheckSquare },
  { id: 'statistics', label: 'Statistics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 h-screen sticky top-0 pt-6 pb-4 px-3 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-sage-600 flex items-center justify-center">
          <Timer size={14} className="text-white" />
        </div>
        <span className="font-semibold text-stone-800 dark:text-stone-100 tracking-tight text-[15px]">
          Podomoro
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5" role="navigation" aria-label="Main navigation">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                isActive
                  ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} className={isActive ? 'text-sage-600 dark:text-sage-400' : ''} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3">
        <p className="text-[11px] text-stone-400 dark:text-stone-600">
          Stay focused. Ship more.
        </p>
      </div>
    </aside>
  )
}

interface BottomNavProps {
  activeView: View
  onNavigate: (view: View) => void
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 px-2 pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-1 py-2 flex-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-sage-600 dark:text-sage-400'
                  : 'text-stone-400 dark:text-stone-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
