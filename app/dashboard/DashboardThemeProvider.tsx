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

  // Sync theme-color + apple status bar so Safari chrome/status bar match the theme
  useEffect(() => {
    const color = theme === 'light' ? '#f5f5f7' : '#050505'

    // Remove any existing theme-color meta tags (including Next.js server-rendered one)
    // and replace with a fresh one so iOS Safari picks it up reliably
    document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove())
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', color)
    document.head.appendChild(meta)

    // Update apple-mobile-web-app-status-bar-style for PWA / home screen mode
    const appleBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (appleBar) {
      appleBar.setAttribute('content', theme === 'light' ? 'default' : 'black-translucent')
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
