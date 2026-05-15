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
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) {
          setError("Cet email est déjà utilisé. Connectez-vous.")
          setLoading(false)
          return
        }
      } else {
        setError("Erreur lors de l'inscription.")
        setLoading(false)
        return
      }
    }

    if (!data.session) {
      await supabase.auth.signInWithPassword({ email, password })
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex justify-center">
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col items-center justify-center px-6 page-transition">

        {/* Logo */}
        <div className="mb-12">
          <Image src="/logo.png" alt="TapTip" width={90} height={90} priority />
        </div>

        {/* Form */}
        <form className="flex w-full flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 w-full rounded-xl bg-[#0c0c0d] border border-[rgba(255,255,255,0.08)] px-4 text-[#f4f4f4] placeholder-[#4a4a4c] text-[15px] transition-all duration-200 focus:border-[oklch(0.78_0.18_155)] focus:outline-none focus:ring-0"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 w-full rounded-xl bg-[#0c0c0d] border border-[rgba(255,255,255,0.08)] px-4 text-[#f4f4f4] placeholder-[#4a4a4c] text-[15px] transition-all duration-200 focus:border-[oklch(0.78_0.18_155)] focus:outline-none focus:ring-0"
          />

          {error && (
            <p className="text-sm text-red-400 text-center py-1">{error}</p>
          )}

          {/* Bouton primaire — vert */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="mt-1 h-14 w-full rounded-xl bg-[oklch(0.78_0.18_155)] text-black font-semibold text-[15px] tracking-wide btn-press disabled:opacity-40 transition-all duration-200 hover:brightness-110"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            <span className="text-[#4a4a4c] text-xs font-mono uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          {/* Bouton secondaire — outline */}
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="h-14 w-full rounded-xl border border-[rgba(255,255,255,0.2)] text-[#f4f4f4] font-semibold text-[15px] btn-press disabled:opacity-40 transition-all duration-200 hover:border-[rgba(255,255,255,0.35)] hover:bg-[#141414]"
          >
            {loading ? '…' : "S'inscrire"}
          </button>
        </form>

      </div>
    </div>
  )
}
