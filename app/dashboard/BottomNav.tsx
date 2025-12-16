'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Accueil',
      icon: '🏠',
      activeIcon: '🏠',
    },
    {
      href: '/dashboard/profile',
      label: 'Profil',
      icon: '👤',
      activeIcon: '👤',
    },
    {
      href: '/dashboard/settings',
      label: 'Réglages',
      icon: '⚙️',
      activeIcon: '⚙️',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-[390px] mx-auto flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-20 py-2 transition-all ${
                isActive 
                  ? 'scale-110' 
                  : 'opacity-50 hover:opacity-75'
              }`}
            >
              <span className="text-2xl mb-0.5">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

