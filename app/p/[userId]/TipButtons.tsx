'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/payment'

interface TipButtonsProps {
  userId: string
  stripeAccountId: string
}

const tipAmounts = [
  { label: '2', value: 200, popular: false },
  { label: '5', value: 500, popular: true },
  { label: '10', value: 1000, popular: false },
]

export default function TipButtons({ userId, stripeAccountId }: TipButtonsProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [selected, setSelected] = useState<number | null>(1) // 5€ par défaut

  const handleTip = async (amountInCents: number, index: number) => {
    setSelected(index)
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
    <div className="w-full">
      {/* Grille de montants premium */}
      <div className="flex gap-3 mb-4">
        {tipAmounts.map((tip, index) => (
          <button
            key={tip.value}
            onClick={() => handleTip(tip.value, index)}
            disabled={loading !== null}
            className={`relative flex-1 h-20 rounded-2xl font-bold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 ${
              selected === index
                ? 'bg-black text-white shadow-xl shadow-black/30 scale-[1.02]'
                : 'bg-white text-black border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {tip.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                Populaire
              </span>
            )}
            <span className="text-2xl">{loading === index ? '•••' : `${tip.label}€`}</span>
          </button>
        ))}
      </div>

      {/* Bouton Autre montant */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          disabled={loading !== null}
        className={`w-full h-14 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${
          showCustom 
            ? 'bg-black text-white' 
            : 'bg-transparent border-2 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-600'
        }`}
        >
        {showCustom ? 'Montant personnalisé' : 'Autre montant'}
        </button>

      {/* Input montant personnalisé */}
      {showCustom && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
          <input
            type="number"
              placeholder="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            step="0.5"
              className="w-full h-16 rounded-xl bg-white border-2 border-gray-200 px-4 pr-16 text-2xl text-black text-center font-bold focus:border-black focus:outline-none transition-all shadow-sm"
          />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">€</span>
          </div>
          <button
            onClick={handleCustomTip}
            disabled={loading !== null || !customAmount}
            className="w-full h-14 mt-3 rounded-xl bg-emerald-500 text-white font-bold transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-300 shadow-lg shadow-emerald-500/25"
          >
            {loading === 99 ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : (
              `Envoyer ${customAmount || '0'}€`
            )}
          </button>
        </div>
      )}
    </div>
  )
}

