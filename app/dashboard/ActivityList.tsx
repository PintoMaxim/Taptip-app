'use client'

import { useState } from 'react'

interface ActivityItem {
  id: string
  type: 'tip' | 'review'
  amount?: number
  rating?: number
  comment?: string | null
  created_at: string
}

interface ActivityListProps {
  activities: ActivityItem[]
  initialLimit?: number
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export default function ActivityList({ activities, initialLimit }: ActivityListProps) {
  const [showAll, setShowAll] = useState(!initialLimit)

  if (activities.length === 0) {
    return (
      <div className="text-center py-10 rounded-xl" style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: '#141414' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a4a4c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        </div>
        <p className="text-xs" style={{ color: '#4a4a4c' }}>Aucune activité pour le moment</p>
      </div>
    )
  }

  const displayedActivities = showAll ? activities : activities.slice(0, initialLimit)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <h2 className="text-base font-bold" style={{ color: '#f4f4f4' }}>Activité récente</h2>
        {initialLimit && activities.length > initialLimit && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all"
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              color: '#8b8b8d',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {showAll ? 'Réduire' : 'Tout voir'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-xl cursor-default animate-fade-in-up transition-colors duration-200"
            style={{
              background: '#0c0c0d',
              border: '1px solid rgba(255,255,255,0.06)',
              animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#141414')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0c0c0d')}
          >
            {/* Icône */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={
                activity.type === 'tip'
                  ? { background: 'oklch(0.78 0.18 155 / 0.12)', border: '2px solid oklch(0.78 0.18 155)' }
                  : { background: '#141414' }
              }
            >
              <span
                className="text-sm font-semibold"
                style={{ color: activity.type === 'tip' ? 'oklch(0.78 0.18 155)' : '#f59e0b' }}
              >
                {activity.type === 'tip' ? '€' : '★'}
              </span>
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: '#f4f4f4' }}>
                {activity.type === 'tip' ? 'Pourboire reçu' : 'Nouvel avis'}
              </p>
              {activity.type === 'review' && activity.comment && (
                <p className="text-[10px] truncate" style={{ color: '#8b8b8d' }}>
                  &ldquo;{activity.comment}&rdquo;
                </p>
              )}
              <p className="text-[10px]" style={{ color: '#4a4a4c', fontFamily: 'var(--font-jetbrains), monospace' }}>
                {formatDate(activity.created_at)}
              </p>
            </div>

            {/* Valeur */}
            <div className="text-right">
              {activity.type === 'tip' ? (
                <span className="text-base font-bold" style={{ color: 'oklch(0.78 0.18 155)', fontFamily: 'var(--font-jetbrains), monospace' }}>
                  +{formatAmount(activity.amount!)}
                </span>
              ) : (
                <div className="flex items-center gap-0.5">
                  <span className="text-xs" style={{ color: '#f59e0b' }}>★</span>
                  <span className="font-semibold text-sm" style={{ color: '#f4f4f4' }}>{activity.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
