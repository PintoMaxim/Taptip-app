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

  const translateError = (err: string) => {
    if (err.includes('Database error saving new user')) return "Erreur de création de profil. Réessayez."
    if (err.includes('User already registered')) return "Cet email est déjà utilisé."
    if (err.includes('Invalid login credentials')) return "Email ou mot de passe incorrect."
    return err
  }

  const handleActivate = async () => {
    setLoading(true)
    const result = await activateBadge(code)
    if (result.error) {
      setError(translateError(result.error))
      setLoading(false)
      return
    }
    router.push('/dashboard/profile?activated=true')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(translateError(authError.message))
      setLoading(false)
      return
    }
    await activateBadge(code)
    router.push('/dashboard/profile?activated=true')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. On tente l'inscription
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })

    // 2. Si déjà inscrit ou si ça a marché, on FORCE la connexion immédiate
    // On ignore totalement le message de confirmation par mail
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInData.session) {
      await activateBadge(code)
      router.push('/dashboard/profile?activated=true')
      return
    }

    if (authError) {
      setError(translateError(authError.message))
    } else {
      // Si on arrive ici, c'est que la session n'est pas encore prête, on redirige quand même vers le login
      setMode('login')
      setMessage("Compte créé ! Connectez-vous pour continuer.")
    }
    setLoading(false)
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 text-sm font-medium">Vous êtes déjà connecté</p>
        </div>
        <button onClick={handleActivate} disabled={loading} className="w-full h-14 rounded-xl bg-black text-white font-semibold active:scale-[0.98] disabled:opacity-50">
          {loading ? 'Activation...' : 'Activer ce badge'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => setMode('signup')} className={`flex-1 py-3 text-sm font-medium rounded-lg ${mode === 'signup' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>Créer un compte</button>
        <button onClick={() => setMode('login')} className={`flex-1 py-3 text-sm font-medium rounded-lg ${mode === 'login' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>Se connecter</button>
      </div>

      <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 focus:border-black focus:outline-none" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required minLength={6} className="w-full h-14 rounded-xl border-2 border-gray-200 px-4 focus:border-black focus:outline-none" />
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-blue-600 text-center">{message}</p>}
        <button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-black text-white font-semibold active:scale-[0.98] disabled:opacity-50">
          {loading ? '...' : mode === 'login' ? 'Se connecter et activer' : "S'inscrire et activer"}
        </button>
      </form>
    </div>
  )
}
