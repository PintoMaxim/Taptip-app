'use client'

import { useState } from 'react'

const tipAmounts = [
  { label: '2€', value: 200 },
  { label: '5€', value: 500 },
  { label: '10€', value: 1000 },
]

export default function TestProfilePage() {
  const [loading, setLoading] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleTip = async (amountInCents: number, index: number) => {
    setLoading(index)
    
    // Simuler un délai de paiement
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(null)
    setSuccess(true)
    
    // Reset après 3 secondes
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      {/* Message de succès */}
      {success && (
        <div className="fixed top-4 left-4 right-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center animate-pulse">
          <span className="text-2xl">🎉</span>
          <p className="text-green-700 font-semibold mt-1">Merci pour votre pourboire !</p>
        </div>
      )}

      {/* Badge TEST */}
      <div className="fixed top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
        MODE TEST
      </div>

      {/* Avatar */}
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-lg">
        <span className="text-4xl font-bold text-gray-400">M</span>
      </div>

      {/* Nom */}
      <h1 className="text-2xl font-bold text-black mb-1">
        Marie Dupont
      </h1>

      {/* Métier / Description */}
      <p className="text-gray-500 text-base mb-10">
        Serveuse au Café de Paris
      </p>

      {/* Boutons de pourboire */}
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
          <div className="flex gap-2 mt-4">
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
              onClick={() => handleTip(parseInt(customAmount) * 100, 99)}
              disabled={loading !== null}
              className="h-14 px-6 rounded-xl bg-black text-white font-bold transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50"
            >
              {loading === 99 ? '...' : '€'}
            </button>
          </div>
        )}
      </div>

      {/* Bouton Avis */}
      <button className="mt-8 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">
        💬 Laisser un avis
      </button>

      {/* Footer */}
      <p className="fixed bottom-6 text-xs text-gray-300">
        Propulsé par <span className="font-bold">KOD</span>
      </p>
    </div>
  )
}

