import React from 'react'
import type { Settings as SettingsType } from '../../types'
import { useTheme } from '../../contexts/ThemeContext'
import { Sun, Moon, Monitor, Volume2, VolumeX, Bell, BellOff } from 'lucide-react'
import { requestNotificationPermission } from '../../lib/notifications'

interface SettingsProps {
  settings: SettingsType
  onUpdateSettings: (updates: Partial<SettingsType>) => void
  onResetSessions: () => void
}

interface NumberInputProps {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (v: number) => void
}

function NumberInput({ label, value, min, max, unit, onChange }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
        {unit && <p className="text-xs text-stone-400 dark:text-stone-500">{unit}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium tabular-nums text-stone-800 dark:text-stone-100">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  icon?: React.ReactNode
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, icon, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="text-stone-400 dark:text-stone-500">{icon}</span>
        )}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
          {description && (
            <p className="text-xs text-stone-400 dark:text-stone-500">{description}</p>
          )}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500 ${
          checked ? 'bg-sage-600 dark:bg-sage-500' : 'bg-stone-200 dark:bg-stone-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function SettingsPage({ settings, onUpdateSettings, onResetSessions }: SettingsProps) {
  const { theme, setTheme } = useTheme()

  const handleEnableNotifications = async () => {
    requestNotificationPermission()
    onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg">
      <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Settings</h2>

      {/* Appearance */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">
          Appearance
        </p>
        <div className="flex gap-2">
          {(
            [
              { value: 'light', label: 'Light', Icon: Sun },
              { value: 'dark', label: 'Dark', Icon: Moon },
              { value: 'system', label: 'System', Icon: Monitor },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all flex-1 justify-center ${
                theme === value
                  ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-800 border-stone-800 dark:border-stone-100'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
              aria-pressed={theme === value}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Timer Durations */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
          Timer Durations
        </p>
        <NumberInput
          label="Focus"
          value={settings.focusDuration}
          min={1}
          max={120}
          unit="minutes"
          onChange={(v) => onUpdateSettings({ focusDuration: v })}
        />
        <NumberInput
          label="Short Break"
          value={settings.shortBreakDuration}
          min={1}
          max={30}
          unit="minutes"
          onChange={(v) => onUpdateSettings({ shortBreakDuration: v })}
        />
        <NumberInput
          label="Long Break"
          value={settings.longBreakDuration}
          min={5}
          max={60}
          unit="minutes"
          onChange={(v) => onUpdateSettings({ longBreakDuration: v })}
        />
        <NumberInput
          label="Long Break Interval"
          value={settings.longBreakInterval}
          min={2}
          max={8}
          unit="sessions before long break"
          onChange={(v) => onUpdateSettings({ longBreakInterval: v })}
        />
      </section>

      {/* Automation */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
          Automation
        </p>
        <ToggleRow
          label="Auto-start Breaks"
          description="Automatically start break after focus ends"
          checked={settings.autoStartBreaks}
          onChange={(v) => onUpdateSettings({ autoStartBreaks: v })}
        />
        <ToggleRow
          label="Auto-start Focus"
          description="Automatically start focus after break ends"
          checked={settings.autoStartFocus}
          onChange={(v) => onUpdateSettings({ autoStartFocus: v })}
        />
      </section>

      {/* Notifications & Sound */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
          Notifications & Sound
        </p>
        <ToggleRow
          label="Sound"
          description="Play a sound when sessions complete"
          checked={settings.soundEnabled}
          icon={settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          onChange={(v) => onUpdateSettings({ soundEnabled: v })}
        />
        <ToggleRow
          label="Browser Notifications"
          description="Show a notification when sessions complete"
          checked={settings.notificationsEnabled}
          icon={settings.notificationsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
          onChange={handleEnableNotifications}
        />
      </section>

      {/* Danger Zone */}
      <section className="bg-white dark:bg-stone-900 border border-red-100 dark:border-red-900/40 rounded-xl p-4">
        <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-3">
          Danger Zone
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Reset all session data
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Permanently delete all productivity history
            </p>
          </div>
          <button
            onClick={onResetSessions}
            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Reset data
          </button>
        </div>
      </section>
    </div>
  )
}
