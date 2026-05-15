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
    try {
      router.push(`/b/${cleanCode}`)
    } catch {
      setError('Erreur lors de la vérification')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col page-transition">

        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-200"
            style={{ color: '#8b8b8d' }}
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
              className="mx-auto mb-5"
              priority
            />
            <h1 className="text-xl font-bold mb-2" style={{ color: '#f4f4f4' }}>
              Activer un badge
            </h1>
            <p className="text-sm" style={{ color: '#8b8b8d' }}>
              Entrez le code inscrit sous votre badge ou scannez-le avec votre téléphone
            </p>
          </div>
        </header>

        {/* Formulaire */}
        <main className="flex-1 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#f4f4f4' }}>
                Code du badge
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: K7XM4PQ9WN2F"
                maxLength={12}
                className="w-full h-14 rounded-xl px-4 text-lg text-center tracking-widest uppercase transition-all duration-200 focus:outline-none"
                style={{
                  fontFamily: 'var(--font-jetbrains), monospace',
                  background: '#0c0c0d',
                  border: `1px solid ${code.length === 12 ? 'oklch(0.78 0.18 155)' : 'rgba(255,255,255,0.08)'}`,
                  color: '#f4f4f4',
                }}
              />
              <p
                className="text-xs mt-2 text-center"
                style={{ color: '#4a4a4c', fontFamily: 'var(--font-jetbrains), monospace' }}
              >
                12 caractères (lettres et chiffres)
              </p>
            </div>

            {error && (
              <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <p className="text-sm text-center" style={{ color: '#f87171' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 12}
              className="w-full h-14 rounded-xl font-semibold text-[15px] transition-all duration-200 active:scale-[0.98] disabled:opacity-40 hover:brightness-110"
              style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
            >
              {loading ? 'Vérification…' : 'Activer ce badge'}
            </button>
          </form>

          {/* Info NFC */}
          <div
            className="mt-8 p-4 rounded-xl flex items-start gap-3"
            style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-2xl flex-shrink-0">📱</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>
                Vous avez un badge NFC ?
              </p>
              <p className="text-xs mt-1" style={{ color: '#8b8b8d' }}>
                Approchez simplement votre téléphone du badge pour l&apos;activer automatiquement.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="py-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#4a4a4c' }}>
            Besoin d&apos;aide ?{' '}
            <a
              href="mailto:contact.taptip@gmail.com"
              className="underline transition-colors duration-200"
              style={{ color: '#8b8b8d' }}
            >
              Contactez-nous
            </a>
          </p>
        </footer>

      </div>
    </div>
  )
}
