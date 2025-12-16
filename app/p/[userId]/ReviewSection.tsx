'use client'

import { useState } from 'react'
import ReviewDrawer from './ReviewDrawer'

interface ReviewSectionProps {
  userId: string
}

export default function ReviewSection({ userId }: ReviewSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      {/* Séparateur */}
      <div className="w-full max-w-[380px] flex items-center gap-4 mt-8 mb-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-300 text-xs uppercase tracking-wider">ou</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Bouton Laisser un avis */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="w-full max-w-[380px] h-14 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
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

