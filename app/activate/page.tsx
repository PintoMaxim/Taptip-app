'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function ActivatePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanCode = code.trim().toUpperCase()

    if (cleanCode.length !== 12) {
      setError('Le code doit contenir 12 caractères')
      return
    }

    setLoading(true)

    // Vérifier si le badge existe via l'API
    try {
      // Rediriger vers la page d'activation du badge
      router.push(`/b/${cleanCode}`)
    } catch {
      setError('Erreur lors de la vérification')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6"
          >
            <span>←</span>
            <span>Retour</span>
          </Link>
          
          <div className="text-center">
            <Image
              src="/logo.png"
              alt="TapTip Logo"
              width={60}
              height={60}
              className="mx-auto mb-4 drop-shadow-sm"
              priority
            />
            <h1 className="text-xl font-bold text-black mb-2">
              Activer un badge
            </h1>
            <p className="text-gray-500 text-sm">
              Entrez le code inscrit sous votre badge ou scannez-le avec votre téléphone
            </p>
          </div>
        </header>

        {/* Formulaire */}
        <main className="flex-1 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Code du badge
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: K7XM4PQ9WN2F"
                maxLength={12}
                className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-lg font-mono text-center tracking-wider text-black placeholder-gray-300 transition-all focus:border-black focus:outline-none uppercase"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                12 caractères (lettres et chiffres)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 12}
              className="w-full h-14 rounded-xl bg-black text-white font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Activer ce badge'}
            </button>
          </form>

          {/* Info NFC */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-medium text-black">
                  Vous avez un badge NFC ?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Approchez simplement votre téléphone du badge pour l'activer automatiquement.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Besoin d'aide ?{' '}
            <a href="mailto:contact.taptip@gmail.com" className="underline">
              Contactez-nous
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

