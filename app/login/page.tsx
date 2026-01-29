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

  const translateError = (err: string) => {
    if (err.includes('Database error saving new user')) return "Erreur de création de profil. Réessayez."
    if (err.includes('User already registered')) return "Cet email est déjà utilisé."
    if (err.includes('Invalid login credentials')) return "Email ou mot de passe incorrect."
    return err
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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

    await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    // On tente la connexion immédiate quoi qu'il arrive
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInData.session) {
      router.push('/dashboard')
    } else if (signInError) {
      setError(translateError(signInError.message))
      setLoading(false)
    } else {
      setMessage('Compte créé ! Connectez-vous.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="mb-10"><Image src="/logo.png" alt="Logo" width={100} height={100} priority /></div>
        <form className="flex w-full flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-xl border-2 border-gray-200 px-4 focus:border-black focus:outline-none" required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 w-full rounded-xl border-2 border-gray-200 px-4 focus:border-black focus:outline-none" required />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}
          <button type="submit" onClick={handleLogin} disabled={loading} className="h-14 w-full rounded-xl bg-black text-white font-semibold active:scale-[0.98] disabled:opacity-50">Se connecter</button>
          <button type="button" onClick={handleSignUp} disabled={loading} className="h-14 w-full rounded-xl border-2 border-black text-black font-semibold active:scale-[0.98] disabled:opacity-50">S'inscrire</button>
        </form>
      </div>
    </div>
  )
}
