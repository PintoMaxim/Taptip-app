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
            /* Message de succès animé */
            <div className="py-10 text-center animate-scale-bounce">
              <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xl font-bold text-black">Merci !</p>
              <p className="text-gray-500 text-sm mt-1">Votre avis compte beaucoup</p>
            </div>
          ) : (
            <>
              {/* Titre */}
              <h3 className="text-xl font-bold text-black text-center mb-6">
                Laisser un avis
              </h3>

              {/* Étoiles premium */}
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      star <= (hoverRating || rating)
                        ? 'bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/30'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`text-xl ${star <= (hoverRating || rating) ? 'text-white' : 'text-gray-400'}`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              {/* Texte de la note */}
              <p className={`text-center text-sm mb-6 font-medium transition-all ${rating > 0 ? 'text-black' : 'text-gray-400'}`}>
                {rating === 0 && 'Appuyez pour noter'}
                {rating === 1 && 'Décevant 😕'}
                {rating === 2 && 'Peut mieux faire 😐'}
                {rating === 3 && 'Correct 🙂'}
                {rating === 4 && 'Très bien 😊'}
                {rating === 5 && 'Excellent ! 🤩'}
              </p>

              {/* Commentaire optionnel */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Un petit mot ? (optionnel)"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none transition-all resize-none text-base"
              />

              {/* Bouton Envoyer */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || sending}
                className={`w-full h-14 mt-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                  rating > 0
                    ? 'bg-black text-white shadow-lg shadow-black/20 hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Envoi...
                  </span>
                ) : 'Envoyer'}
              </button>

              {/* Bouton Annuler */}
              <button
                onClick={onClose}
                className="w-full h-12 mt-2 text-gray-400 font-medium hover:text-gray-600 transition-colors"
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

