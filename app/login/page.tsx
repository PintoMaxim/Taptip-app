'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Traduction des erreurs courantes
  const translateError = (err: string) => {
    if (err.includes('Database error saving new user')) {
      return "Une erreur est survenue lors de la création de votre profil. Veuillez réessayer."
    }
    if (err.includes('User already registered')) {
      return "Cet email est déjà utilisé par un autre compte."
    }
    if (err.includes('Invalid login credentials')) {
      return "Email ou mot de passe incorrect."
    }
    if (err.includes('Password should be at least 6 characters')) {
      return "Le mot de passe doit faire au moins 6 caractères."
    }
    return err
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(translateError(error.message))
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(translateError(error.message))
    } else {
      setMessage('Vérifiez votre email pour confirmer votre inscription.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/logo.png"
            alt="TapTip Logo"
            width={100}
            height={100}
            className="drop-shadow-sm"
            priority
          />
        </div>

        {/* Formulaire */}
        <form className="flex w-full flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-base text-black placeholder-gray-400 transition-all focus:border-black focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-base text-black placeholder-gray-400 transition-all focus:border-black focus:outline-none"
            required
          />

          {/* Messages */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-600 text-center">{message}</p>
          )}

          {/* Boutons */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="h-14 w-full rounded-xl border-2 border-black bg-black text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '...' : 'Se connecter'}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="h-14 w-full rounded-xl border-2 border-black bg-white text-base font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '...' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}
