import type { Settings } from '../types'

export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function sendNotification(title: string, body: string, settings: Settings): void {
  if (!settings.notificationsEnabled) return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'podomoro-timer',
      silent: false,
    })
  } catch {
    // ignore
  }
}
