'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

interface ReviewDrawerProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function ReviewDrawer({ userId, isOpen, onClose }: ReviewDrawerProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setSending(true)

    const result = await submitReview({
      userId,
      rating,
      comment: comment.trim() || undefined,
    })

    setSending(false)

    if (result.success) {
      setSent(true)
      setTimeout(() => {
        onClose()
        // Reset après fermeture
        setTimeout(() => {
          setRating(0)
          setComment('')
          setSent(false)
        }, 300)
      }, 1500)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Container centré */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        {/* Drawer */}
        <div className="w-full max-w-[390px] bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="px-6 pb-8">
          {sent ? (
            /* Message de succès */
            <div className="py-12 text-center">
              <span className="text-5xl">🙏</span>
              <p className="text-xl font-semibold text-black mt-4">Merci pour votre avis !</p>
            </div>
          ) : (
            <>
              {/* Titre */}
              <h3 className="text-xl font-bold text-black text-center mb-6">
                Laisser un avis
              </h3>

              {/* Étoiles */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl transition-transform active:scale-90"
                  >
                    {star <= (hoverRating || rating) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>

              {/* Texte de la note */}
              <p className="text-center text-gray-500 text-sm mb-6">
                {rating === 0 && 'Appuyez pour noter'}
                {rating === 1 && 'Décevant'}
                {rating === 2 && 'Peut mieux faire'}
                {rating === 3 && 'Correct'}
                {rating === 4 && 'Très bien'}
                {rating === 5 && 'Excellent !'}
              </p>

              {/* Commentaire optionnel */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Un petit mot ? (optionnel)"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none transition-all resize-none text-base"
              />

              {/* Bouton Envoyer */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || sending}
                className="w-full h-14 mt-4 rounded-xl bg-black text-white font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>

              {/* Bouton Annuler */}
              <button
                onClick={onClose}
                className="w-full h-12 mt-2 text-gray-500 font-medium"
              >
                Annuler
              </button>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  )
}

