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
      {/* Bouton Laisser un avis */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="mt-8 flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors active:scale-95"
      >
        <span>💬</span>
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

