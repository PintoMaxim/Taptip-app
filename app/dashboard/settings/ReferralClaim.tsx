'use client'

import { useState, useEffect } from 'react'
import { claimReferral } from '@/app/actions/referral'
import { Lock, Timer, CheckCircle, ArrowRight } from 'lucide-react'

interface ReferralClaimProps {
  isStripeComplete: boolean
  hasAlreadyClaimed: boolean
  firstBadgeActivationDate?: string | null
}

export default function ReferralClaim({ 
  isStripeComplete, 
  hasAlreadyClaimed, 
  firstBadgeActivationDate 
}: ReferralClaimProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  // Calcul du temps restant (7 jours)
  useEffect(() => {
    if (!firstBadgeActivationDate || hasAlreadyClaimed) return

    const calculateTime = () => {
      const activatedAt = new Date(firstBadgeActivationDate)
      const expiryDate = new Date(activatedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      const now = new Date()
      
      const diff = expiryDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft('Expiré')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) {
        setTimeLeft(`${days}j ${hours}h restants`)
      } else {
        setTimeLeft(`${hours}h restantes`)
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 3600000) // Update chaque heure
    return () => clearInterval(interval)
  }, [firstBadgeActivationDate, hasAlreadyClaimed])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || loading) return

    setLoading(true)
    setError(null)

    const result = await claimReferral(code)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  // Si déjà parrainé ou succès immédiat
  if (hasAlreadyClaimed || success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
          <CheckCircle size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-green-900">Parrainage validé ✨</p>
          <p className="text-[10px] text-green-600 font-medium">Merci ! Votre collègue recevra 10€.</p>
        </div>
      </div>
    )
  }

  // Si le délai est dépassé (et qu'il n'a pas réclamé)
  if (timeLeft === 'Expiré') {
    return null // On cache la section comme convenu
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] text-gray-400 uppercase tracking-wider">
          Offre de parrainage
        </h2>
        {isStripeComplete && timeLeft && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
            <Timer size={12} />
            <span>{timeLeft}</span>
          </div>
        )}
      </div>

      <div className={`relative bg-gray-50 rounded-xl p-4 transition-all ${!isStripeComplete ? 'opacity-80' : ''}`}>
        {!isStripeComplete ? (
          /* État 1 : Stripe non connecté (Cadenas) */
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              <Lock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Avez-vous été parrainé ?</p>
              <p className="text-[10px] text-gray-400">
                Connectez Stripe pour saisir votre code.
              </p>
            </div>
          </div>
        ) : (
          /* État 2 : Stripe connecté (Formulaire) */
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                <span className="text-lg">🎁</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">Avez-vous été parrainé ?</p>
                <p className="text-[10px] text-gray-400">
                  Entrez le code de votre collègue pour lui faire gagner 10€.
                </p>
              </div>
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX: MAXIM99"
                className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 text-sm font-bold text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={loading || !code}
                className="absolute right-1.5 top-1.5 w-9 h-9 bg-black text-white rounded-md flex items-center justify-center active:scale-95 transition-all disabled:bg-gray-200"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
            
            {error && (
              <p className="text-[10px] text-red-500 font-medium px-1">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

