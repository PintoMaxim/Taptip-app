'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/payment'

interface TipButtonsProps {
  userId: string
  stripeAccountId: string
}

const tipAmounts = [
  { label: '2€', value: 200 },
  { label: '5€', value: 500 },
  { label: '10€', value: 1000 },
]

export default function TipButtons({ userId, stripeAccountId }: TipButtonsProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleTip = async (amountInCents: number, index: number) => {
    setLoading(index)

    const { url, error } = await createCheckoutSession({
      amount: amountInCents,
      destinationAccountId: stripeAccountId,
      userId,
    })

    if (error) {
      alert(error)
      setLoading(null)
      return
    }

    if (url) {
      window.location.href = url
    }
  }

  const handleCustomTip = async () => {
    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount < 1) {
      alert('Montant minimum : 1€')
      return
    }

    setLoading(99)
    const amountInCents = Math.round(amount * 100)

    const { url, error } = await createCheckoutSession({
      amount: amountInCents,
      destinationAccountId: stripeAccountId,
      userId,
    })

    if (error) {
      alert(error)
      setLoading(null)
      return
    }

    if (url) {
      window.location.href = url
    }
  }

  return (
    <div className="w-full max-w-xs">
      {/* Grille de montants */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {tipAmounts.map((tip, index) => (
          <button
            key={tip.value}
            onClick={() => handleTip(tip.value, index)}
            disabled={loading !== null}
            className="h-16 rounded-2xl bg-black text-white text-xl font-bold transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50"
          >
            {loading === index ? '...' : tip.label}
          </button>
        ))}

        {/* Bouton Autre */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          disabled={loading !== null}
          className="h-16 rounded-2xl border-2 border-black bg-white text-black text-xl font-bold transition-all hover:bg-gray-50 active:scale-[0.97] disabled:opacity-50"
        >
          Autre
        </button>
      </div>

      {/* Input montant personnalisé */}
      {showCustom && (
        <div className="flex gap-2 mt-4 animate-in fade-in duration-200">
          <input
            type="number"
            placeholder="Montant"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            step="0.5"
            className="flex-1 h-14 rounded-xl border-2 border-gray-200 px-4 text-lg text-black text-center focus:border-black focus:outline-none"
          />
          <button
            onClick={handleCustomTip}
            disabled={loading !== null}
            className="h-14 px-6 rounded-xl bg-black text-white font-bold transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50"
          >
            {loading === 99 ? '...' : '€'}
          </button>
        </div>
      )}
    </div>
  )
}

