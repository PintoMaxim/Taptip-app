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

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const getUserName = (user?: { first_name?: string; last_name?: string; email?: string }) => {
    if (!user) return '?'
    if (user.first_name || user.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    return user.email?.split('@')[0] || '?'
  }

  const getInitials = (user?: { first_name?: string; last_name?: string; email?: string }) => {
    if (!user) return '?'
    if (user.first_name) return user.first_name.charAt(0).toUpperCase()
    if (user.email) return user.email.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <div className="space-y-2">
      {error && (
        <div
          className="rounded-xl p-3 mb-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <p className="text-xs text-center" style={{ color: '#f87171' }}>{error}</p>
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
            className="rounded-xl p-4"
            style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: '#141414', color: '#f4f4f4', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {getInitials(referral.referrer)}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#f4f4f4' }}>
                  {getUserName(referral.referrer)}
                </p>
                <p className="text-[10px]" style={{ ...monoStyle, color: '#4a4a4c' }}>
                  Parrainé par {getUserName(referral.referee)} · {formatDate(referral.created_at)}
                </p>
              </div>

              {/* Montant + Statut */}
              <div className="text-right">
                <p className="text-base font-bold" style={{ ...monoStyle, color: '#f4f4f4' }}>
                  {(referral.amount / 100).toFixed(0)}€
                </p>
                {isPaid ? (
                  <span className="text-[10px] font-medium" style={{ color: 'oklch(0.78 0.18 155)' }}>Payé ✓</span>
                ) : (
                  <span className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>En attente</span>
                )}
              </div>
            </div>

            {/* Bouton payer */}
            {isPending && (
              <div
                className="mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {!hasStripeAccount ? (
                  <p className="text-[10px] text-center" style={{ color: '#f87171' }}>
                    Stripe non configuré pour ce parrain
                  </p>
                ) : (
                  <button
                    onClick={() => handlePay(referral.id)}
                    disabled={isLoading}
                    className="w-full font-semibold text-sm py-2.5 rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 hover:brightness-110"
                    style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
                  >
                    {isLoading ? 'Paiement…' : 'Payer 10€'}
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
