'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { activateBadge } from '@/app/actions/badges'
import { useRouter } from 'next/navigation'

interface ActivationFormProps {
  code: string
  isLoggedIn: boolean
}

export default function ActivationForm({ code, isLoggedIn }: ActivationFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(isLoggedIn ? 'activate' as any : 'signup')
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
      return "Le mot de passe doit contenir au moins 6 caractères."
    }
    return err
  }

  // Si déjà connecté, activer directement
  const handleActivate = async () => {
    setLoading(true)
    setError(null)

    const result = await activateBadge(code)

    if (result.error) {
      setError(translateError(result.error))
      setLoading(false)
      return
    }

    // Rediriger vers le dashboard pour configurer le profil
    router.push('/dashboard/profile?activated=true')
  }

  // Connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(translateError(authError.message))
      setLoading(false)
      return
    }

    // Activer le badge après connexion
    const result = await activateBadge(code)

    if (result.error) {
      setError(translateError(result.error))
      setLoading(false)
      return
    }

    router.push('/dashboard/profile?activated=true')
  }

  // Inscription
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/b/${code}/confirm`,
      },
    })

    if (authError) {
      setError(translateError(authError.message))
      setLoading(false)
      return
    }

    setMessage('Vérifiez votre email pour confirmer votre inscription, puis revenez ici.')
    setLoading(false)
  }

  // Si déjà connecté, afficher bouton d'activation
  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <span className="text-2xl mb-2 block">✅</span>
          <p className="text-green-700 text-sm font-medium">
            Vous êtes déjà connecté
          </p>
        </div>

        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Activation...' : 'Activer ce badge sur mon compte'}
        </button>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toggle Login/Signup */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
            mode === 'signup'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Créer un compte
        </button>
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
            mode === 'login'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          J'ai déjà un compte
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-black mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-base text-black placeholder-gray-400 transition-all focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-black mb-1 block">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 text-base text-black placeholder-gray-400 transition-all focus:border-black focus:outline-none"
          />
          {mode === 'signup' && (
            <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm text-blue-600 text-center">{message}</p>
          </div>
        )}

        {/* Bouton Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
        >
          {loading 
            ? '...' 
            : mode === 'login' 
              ? 'Se connecter et activer' 
              : "S'inscrire et activer"
          }
        </button>
      </form>

      {/* Info */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          💡 Après l'activation, vous pourrez personnaliser votre profil et connecter votre compte bancaire.
        </p>
      </div>
    </div>
  )
}

