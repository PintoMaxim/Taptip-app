'use client'

import { useDashTheme } from './DashboardThemeProvider'

export default function ThemeSettingRow() {
  const { theme, toggle } = useDashTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggle}
      className="w-full p-4 flex items-center justify-between active:scale-[0.99] transition-all duration-200 text-left"
      aria-label={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--dash-surface-2)', border: '1px solid var(--dash-border)' }}
        >
          {isLight ? (
            /* Lune */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dash-text-2)' }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            /* Soleil */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dash-text-2)' }}>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--dash-text)' }}>
            {isLight ? 'Mode sombre' : 'Mode clair'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--dash-text-2)' }}>
            {isLight ? 'Actuellement en mode clair' : 'Actuellement en mode sombre'}
          </p>
        </div>
      </div>

      {/* Toggle pill */}
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: isLight ? 'oklch(0.78 0.18 155)' : 'var(--dash-surface-2)', border: '1px solid var(--dash-border)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-sm"
          style={{
            background: isLight ? '#000' : 'var(--dash-text-3)',
            left: isLight ? 'calc(100% - 22px)' : '2px',
          }}
        />
      </div>
    </button>
  )
}
