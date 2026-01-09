'use client'

import { useState } from 'react'
import { payReferrer } from '@/app/actions/stripe'
import { Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface Referral {
  id: string
  referrer_id: string
  referee_id: string
  status: string
  amount: number
  created_at: string
  paid_at?: string
  stripe_transfer_id?: string
  referrer?: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
    stripe_account_id?: string
  }
  referee?: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
  }
}

interface ReferralListProps {
  referrals: Referral[]
}

export default function ReferralList({ referrals }: ReferralListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set())

  const handlePay = async (referralId: string) => {
    setLoading(referralId)
    setError(null)

    const result = await payReferrer(referralId)

    if (result.error) {
      setError(result.error)
    } else {
      setPaidIds(prev => new Set(prev).add(referralId))
    }

    setLoading(null)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (user?: { first_name?: string; last_name?: string; email?: string }) => {
    if (!user) return 'Utilisateur inconnu'
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user.email || 'Utilisateur inconnu'
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {referrals.map((referral) => {
        const isPending = referral.status === 'pending' && !paidIds.has(referral.id)
        const isPaid = referral.status === 'paid' || paidIds.has(referral.id)
        const isLoading = loading === referral.id
        const hasStripeAccount = !!referral.referrer?.stripe_account_id

        return (
          <div
            key={referral.id}
            className={`border rounded-xl p-4 ${
              isPending 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {isPending ? (
                  <Clock size={16} className="text-amber-500" />
                ) : (
                  <CheckCircle size={16} className="text-emerald-500" />
                )}
                <span className={`text-xs font-bold uppercase ${
                  isPending ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {isPending ? 'En attente' : 'Payé'}
                </span>
              </div>
              <span className="text-xl font-black text-black">
                {(referral.amount / 100).toFixed(0)}€
              </span>
            </div>

            {/* Détails */}
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Parrain (reçoit les 10€)</p>
                <p className="text-sm font-medium text-black">{getUserName(referral.referrer)}</p>
                <p className="text-[10px] text-gray-400">{referral.referrer?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Filleul (a utilisé le code)</p>
                <p className="text-sm font-medium text-black">{getUserName(referral.referee)}</p>
                <p className="text-[10px] text-gray-400">{referral.referee?.email}</p>
              </div>
            </div>

            {/* Date */}
            <p className="text-[10px] text-gray-400 mb-3">
              {isPaid && referral.paid_at 
                ? `Payé le ${formatDate(referral.paid_at)}`
                : `Créé le ${formatDate(referral.created_at)}`
              }
            </p>

            {/* Bouton payer */}
            {isPending && (
              <>
                {!hasStripeAccount ? (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-2">
                    <p className="text-[10px] text-red-600 text-center">
                      ⚠️ Le parrain n'a pas de compte Stripe
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePay(referral.id)}
                    disabled={isLoading}
                    className="w-full bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl 
                             hover:bg-emerald-600 active:scale-[0.98] transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Paiement en cours...
                      </>
                    ) : (
                      <>
                        💰 Valider & Payer 10€
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Transfer ID si payé */}
            {isPaid && referral.stripe_transfer_id && (
              <p className="text-[10px] text-gray-400 text-center">
                Transfer: {referral.stripe_transfer_id}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

