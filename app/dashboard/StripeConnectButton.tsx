'use client'

import { useState } from 'react'
import { getStripeOnboardingLink } from '@/app/actions/stripe'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    
    const { url, error } = await getStripeOnboardingLink()
    
    if (error) {
      alert(error)
      setLoading(false)
      return
    }

    if (url) {
      window.location.href = url
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
    >
      {loading ? '...' : 'Connecter'}
    </button>
  )
}
