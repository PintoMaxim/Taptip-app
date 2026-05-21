'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'dark', toggle: () => {} })

export const useDashTheme = () => useContext(ThemeContext)

export default function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('dash-theme') as Theme | null
    if (stored === 'light' || stored === 'dark') setTheme(stored)
  }, [])

  // Sync theme-color meta tag so Safari status bar + browser chrome match the theme
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f5f5f7' : '#050505')
    }
    return () => {
      // Restore default on unmount (when leaving dashboard)
      if (meta) meta.setAttribute('content', '#050505')
    }
  }, [theme])

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dash-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        data-dash-theme={theme}
        style={{ minHeight: '100dvh', background: 'var(--dash-bg)', transition: 'background 300ms ease' }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
