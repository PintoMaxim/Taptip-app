'use client'

import { useState } from 'react'
import { payReferrer } from '@/app/actions/stripe'

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
    })
  }

  const getUserName = (user?: { first_name?: string; last_name?: string; email?: string }) => {
    if (!user) return '?'
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    return user.email?.split('@')[0] || '?'
  }

  const getInitials = (user?: { first_name?: string; last_name?: string; email?: string }) => {
    if (!user) return '?'
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return '?'
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 rounded-xl p-3 mb-3">
          <p className="text-xs text-red-600 text-center">{error}</p>
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
            className="bg-gray-50 rounded-xl p-4"
          >
            {/* Ligne principale */}
            <div className="flex items-center gap-3">
              {/* Avatar parrain */}
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                {getInitials(referral.referrer)}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {getUserName(referral.referrer)}
                </p>
                <p className="text-[10px] text-gray-400">
                  Parrainé par {getUserName(referral.referee)} · {formatDate(referral.created_at)}
                </p>
              </div>

              {/* Montant + Statut */}
              <div className="text-right">
                <p className="text-base font-bold text-black">
                  {(referral.amount / 100).toFixed(0)}€
                </p>
                {isPaid ? (
                  <span className="text-[10px] text-emerald-600 font-medium">Payé ✓</span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-medium">En attente</span>
                )}
              </div>
            </div>

            {/* Bouton payer - seulement si en attente */}
            {isPending && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {!hasStripeAccount ? (
                  <p className="text-[10px] text-red-500 text-center">
                    Stripe non configuré pour ce parrain
                  </p>
                ) : (
                  <button
                    onClick={() => handlePay(referral.id)}
                    disabled={isLoading}
                    className="w-full bg-black text-white font-medium text-sm py-2.5 rounded-xl 
                             active:scale-[0.98] transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Paiement...' : 'Payer 10€'}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

