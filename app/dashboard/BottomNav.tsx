'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? "currentColor" : "none"} />
    <polyline points="9 22 9 12 15 12 15 22" stroke={active ? "black" : "currentColor"} />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
)

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"} />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const ACCENT = 'oklch(0.78 0.18 155)'
const INACTIVE = 'var(--dash-text-3)'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Accueil', Icon: HomeIcon },
    { href: '/dashboard/profile', label: 'Profil', Icon: ProfileIcon },
    { href: '/dashboard/settings', label: 'Réglages', Icon: SettingsIcon },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <nav
        className="w-full max-w-[390px] backdrop-blur-xl"
        style={{
          background: 'var(--dash-nav)',
          borderTop: '1px solid var(--dash-border)',
        }}
      >
        <div className="flex justify-around items-center h-16 pb-2">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className="flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200"
                style={{ color: isActive ? ACCENT : INACTIVE }}
              >
                <div className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Icon active={isActive} />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-jetbrains), monospace',
                    fontFeatureSettings: '"zero" 0',
                    color: isActive ? ACCENT : INACTIVE,
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
