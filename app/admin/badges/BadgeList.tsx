'use client'

import { useState, useTransition } from 'react'
import { updateBadgeStatus } from '@/app/actions/badges'

interface Badge {
  id: string
  code: string
  url: string
  user_id: string | null
  activated_at: string | null
  created_at: string
  isActivated: boolean
  status: 'available' | 'pending' | 'activated'
  users?: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
}

interface BadgeListProps {
  badges: Badge[]
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
}

export default function BadgeList({ badges }: BadgeListProps) {
  const [filter, setFilter] = useState<'all' | 'activated' | 'pending' | 'available'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredBadges = badges.filter(badge => {
    const effectiveStatus = badge.isActivated ? 'activated' : (badge.status || 'available')
    if (filter === 'all') return true
    return effectiveStatus === filter
  })

  const copyToClipboard = async (url: string, code: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleStatus = async (code: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'available' : 'pending'
    startTransition(async () => {
      await updateBadgeStatus(code, newStatus)
    })
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'activated', label: 'Activés' },
    { key: 'pending', label: 'En attente' },
    { key: 'available', label: 'Vierges' },
  ]

  return (
    <section>
      <div className="flex flex-col gap-4 mb-5">
        <h2 className="text-base font-bold flex items-center justify-between" style={{ color: '#f4f4f4' }}>
          📋 Liste des badges
          <span
            className="text-[10px] px-2 py-1 rounded-full font-normal"
            style={{ ...monoStyle, background: '#141414', color: '#8b8b8d', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''}
          </span>
        </h2>

        {/* Filtres */}
        <div className="flex p-1 rounded-xl" style={{ background: '#141414' }}>
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200"
              style={
                filter === key
                  ? {
                      ...monoStyle,
                      background: '#0c0c0d',
                      color: key === 'activated' ? 'oklch(0.78 0.18 155)' : '#f4f4f4',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    }
                  : { ...monoStyle, color: '#4a4a4c' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredBadges.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: '#0c0c0d', border: '2px dashed rgba(255,255,255,0.08)' }}
        >
          <span className="text-4xl mb-4 block opacity-40">🔍</span>
          <p className="text-sm font-medium" style={{ color: '#8b8b8d' }}>Aucun badge dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBadges.map((badge) => {
            const effectiveStatus = badge.isActivated ? 'activated' : (badge.status || 'available')

            const borderColor =
              effectiveStatus === 'activated' ? 'oklch(0.78 0.18 155 / 0.3)' :
              effectiveStatus === 'pending' ? 'rgba(99,102,241,0.3)' :
              'rgba(255,255,255,0.08)'

            const bgColor =
              effectiveStatus === 'activated' ? 'oklch(0.78 0.18 155 / 0.06)' :
              effectiveStatus === 'pending' ? 'rgba(99,102,241,0.06)' :
              '#0c0c0d'

            return (
              <div
                key={badge.id}
                className="p-4 rounded-2xl transition-all duration-300"
                style={{ background: bgColor, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code
                        className="text-sm font-bold px-2 py-0.5 rounded"
                        style={{
                          ...monoStyle,
                          color: '#f4f4f4',
                          background: '#141414',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {badge.code}
                      </code>

                      {effectiveStatus === 'activated' ? (
                        <span
                          className="text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full"
                          style={{ ...monoStyle, background: 'oklch(0.78 0.18 155)', color: '#000' }}
                        >
                          Activé
                        </span>
                      ) : effectiveStatus === 'pending' ? (
                        <span
                          className="text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full"
                          style={{ ...monoStyle, background: 'rgba(99,102,241,0.8)', color: '#fff' }}
                        >
                          Expédié
                        </span>
                      ) : (
                        <span
                          className="text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full"
                          style={{ ...monoStyle, background: '#141414', color: '#4a4a4c', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          Vierge
                        </span>
                      )}
                    </div>

                    {effectiveStatus === 'activated' && badge.users && (
                      <div className="flex items-center gap-2 text-xs font-medium mb-1" style={{ color: '#8b8b8d' }}>
                        <span className="opacity-50 text-[10px]">👤</span>
                        {badge.users.first_name} {badge.users.last_name}
                      </div>
                    )}

                    <p className="text-[10px]" style={{ ...monoStyle, color: '#4a4a4c' }}>
                      {badge.isActivated && badge.activated_at
                        ? `Activé le ${formatDate(badge.activated_at)}`
                        : `Généré le ${formatDate(badge.created_at)}`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {effectiveStatus !== 'activated' && (
                      <>
                        <button
                          onClick={() => copyToClipboard(badge.url, badge.code)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95"
                          style={
                            copied === badge.code
                              ? { background: 'oklch(0.78 0.18 155)', color: '#000', border: 'none' }
                              : { background: '#141414', color: '#8b8b8d', border: '1px solid rgba(255,255,255,0.08)' }
                          }
                        >
                          {copied === badge.code ? '✓ COPIÉ' : '📋 COPIER'}
                        </button>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={effectiveStatus === 'pending'}
                            onChange={() => !isPending && toggleStatus(badge.code, effectiveStatus)}
                            disabled={isPending}
                            className="w-4 h-4 rounded cursor-pointer"
                            style={{ accentColor: 'oklch(0.78 0.18 155)' }}
                          />
                          <span
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{
                              ...monoStyle,
                              color: effectiveStatus === 'pending' ? 'rgba(99,102,241,0.8)' : '#4a4a4c',
                            }}
                          >
                            Expédié
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
