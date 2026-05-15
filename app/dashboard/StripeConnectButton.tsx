'use client'

import { useState } from 'react'
import { getStripeOnboardingLink } from '@/app/actions/stripe'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStripeOnboardingLink()
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      if (result.url) {
        window.location.href = result.url
      } else {
        setError('Aucune URL reçue')
        setLoading(false)
      }
    } catch (err) {
      console.error('Erreur Stripe:', err)
      setError('Erreur de connexion à Stripe')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        style={{
          background: 'oklch(0.78 0.18 155)',
          color: '#000',
        }}
      >
        {loading ? '…' : 'Connecter'}
      </button>
      {error && (
        <p className="text-[10px] text-red-400 max-w-[150px] text-right">{error}</p>
      )}
    </div>
  )
}
