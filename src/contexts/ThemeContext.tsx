import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeStorage] = useLocalStorage<Theme>('podomoro-theme', 'system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  const resolve = useCallback(
    (t: Theme): ResolvedTheme => {
      if (t === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return t
    },
    [],
  )

  useEffect(() => {
    const resolved = resolve(theme)
    setResolvedTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [theme, resolve])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        const resolved = resolve('system')
        setResolvedTheme(resolved)
        document.documentElement.classList.toggle('dark', resolved === 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, resolve])

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeStorage(t)
    },
    [setThemeStorage],
  )

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
