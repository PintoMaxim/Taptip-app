'use client'

import { useState } from 'react'

interface Badge {
  id: string
  code: string
  url: string
  user_id: string | null
  activated_at: string | null
  created_at: string
  isActivated: boolean
  users?: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface BadgeListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  badges: any[]
}

export default function BadgeList({ badges }: BadgeListProps) {
  const [filter, setFilter] = useState<'all' | 'activated' | 'available'>('all')
  const [copied, setCopied] = useState<string | null>(null)

  const filteredBadges = badges.filter(badge => {
    if (filter === 'activated') return badge.isActivated
    if (filter === 'available') return !badge.isActivated
    return true
  })

  const copyToClipboard = async (url: string, code: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-black">
          📋 Liste des badges ({filteredBadges.length})
        </h2>

      {/* Filtres */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            filter === 'all' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-black'
          }`}
        >
            Tous
        </button>
        <button
            onClick={() => setFilter('activated')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'activated' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-black'
          }`}
        >
            Activés
        </button>
        <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'available' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-black'
          }`}
        >
            Disponibles
        </button>
        </div>
      </div>

      {filteredBadges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <span className="text-4xl mb-3 block">🏷️</span>
          <p className="text-gray-500 text-sm">Aucun badge trouvé</p>
          <p className="text-gray-400 text-xs mt-1">
            Générez des badges ci-dessus
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all ${
                badge.isActivated 
                  ? 'bg-green-50 border-green-100' 
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Code Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono font-bold text-black">
                      {badge.code}
                    </code>
                    {badge.isActivated ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Activé
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Disponible
                      </span>
                    )}
                  </div>

                  {/* Info utilisateur si activé */}
                  {badge.isActivated && badge.users && (
                    <p className="text-xs text-gray-600 mt-1">
                      👤 {badge.users.first_name || ''} {badge.users.last_name || ''} 
                      {!badge.users.first_name && badge.users.email && (
                        <span className="text-gray-400"> ({badge.users.email})</span>
                      )}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-1">
                    {badge.isActivated && badge.activated_at 
                      ? `Activé le ${formatDate(badge.activated_at)}`
                      : `Créé le ${formatDate(badge.created_at)}`
                    }
                  </p>
                </div>

                {/* Actions */}
                {!badge.isActivated && (
                  <button
                    onClick={() => copyToClipboard(badge.url, badge.code)}
                    className="text-xs text-gray-500 hover:text-black px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    {copied === badge.code ? '✓ Copié' : '📋 Copier URL'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
