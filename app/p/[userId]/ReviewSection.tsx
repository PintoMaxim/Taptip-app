'use client'

import { useState } from 'react'
import ReviewDrawer from './ReviewDrawer'

interface ReviewSectionProps {
  userId: string
  latestReviews?: any[]
}

export default function ReviewSection({ userId, latestReviews = [] }: ReviewSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      {/* Liste des derniers avis (Style Apple App Store) */}
      {latestReviews.length > 0 && (
        <div className="w-full max-w-[380px] mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-black">Avis récents</h2>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <span>Vérifiés</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3">
            {latestReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 animate-fade-in-up"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-[10px] text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? "fill-current" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-snug italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Séparateur */}
      <div className="w-full max-w-[380px] flex items-center gap-4 mt-10 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-300 text-xs uppercase tracking-wider">ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Bouton Laisser un avis */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="w-full max-w-[380px] h-14 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Laisser un avis</span>
      </button>

      {/* Drawer */}
      <ReviewDrawer
        userId={userId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}

