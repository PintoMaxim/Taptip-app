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
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-base font-bold text-black flex items-center justify-between">
          📋 Liste des badges
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-normal">
            {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''}
          </span>
        </h2>

        {/* Filtres Pro */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button onClick={() => setFilter('all')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Tous</button>
          <button onClick={() => setFilter('activated')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${filter === 'activated' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Activés</button>
          <button onClick={() => setFilter('pending')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>En attente</button>
          <button onClick={() => setFilter('available')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${filter === 'available' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-400'}`}>Vierges</button>
        </div>
      </div>

      {filteredBadges.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <span className="text-4xl mb-4 block opacity-50">🔍</span>
          <p className="text-gray-500 text-sm font-medium">Aucun badge dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBadges.map((badge) => {
            const effectiveStatus = badge.isActivated ? 'activated' : (badge.status || 'available')
            
            return (
              <div
                key={badge.id}
                className={`group p-4 rounded-2xl border transition-all duration-300 ${
                  effectiveStatus === 'activated' ? 'bg-emerald-50/30 border-emerald-100' :
                  effectiveStatus === 'pending' ? 'bg-blue-50/30 border-blue-100' :
                  'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-black bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {badge.code}
                      </code>
                      
                      {effectiveStatus === 'activated' ? (
                        <span className="text-[9px] uppercase tracking-tighter font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm shadow-emerald-200">Activé</span>
                      ) : effectiveStatus === 'pending' ? (
                        <span className="text-[9px] uppercase tracking-tighter font-black bg-blue-500 text-white px-2 py-0.5 rounded-full shadow-sm shadow-blue-200">Expédié</span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-tighter font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Vierge</span>
                      )}
                    </div>

                    {effectiveStatus === 'activated' && badge.users && (
                      <div className="flex items-center gap-2 text-xs text-gray-700 font-medium mb-1">
                        <span className="opacity-50 text-[10px]">👤</span>
                        {badge.users.first_name} {badge.users.last_name}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400 font-medium">
                      {badge.isActivated && badge.activated_at 
                        ? `Activé le ${formatDate(badge.activated_at)}`
                        : `Généré le ${formatDate(badge.created_at)}`
                      }
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {effectiveStatus !== 'activated' && (
                      <>
                        <button
                          onClick={() => copyToClipboard(badge.url, badge.code)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                            copied === badge.code 
                              ? 'bg-black text-white border-black scale-95' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-black active:scale-95'
                          }`}
                        >
                          {copied === badge.code ? '✓ COPIÉ' : '📋 COPIER'}
                        </button>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={effectiveStatus === 'pending'}
                            onChange={() => !isPending && toggleStatus(badge.code, effectiveStatus)}
                            disabled={isPending}
                            className="w-4 h-4 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                          />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${effectiveStatus === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>
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
