'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { activateBadge } from '@/app/actions/badges'
import { useRouter } from 'next/navigation'

interface ActivationFormProps {
  code: string
  isLoggedIn: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '56px',
  borderRadius: '12px',
  padding: '0 16px',
  background: '#0c0c0d',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f4f4f4',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 200ms',
}

export default function ActivationForm({ code, isLoggedIn }: ActivationFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(isLoggedIn ? 'activate' as any : 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getFocusStyle = (field: string): React.CSSProperties =>
    focusedField === field
      ? { ...inputStyle, borderColor: 'oklch(0.78 0.18 155)' }
      : inputStyle

  const handleActivate = async () => {
    setLoading(true)
    const result = await activateBadge(code)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push('/dashboard/profile?activated=true')
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError("Email ou mot de passe incorrect.")
        setLoading(false)
        return
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
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
    }

    const result = await activateBadge(code)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard/profile?activated=true')
    }
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'oklch(0.78 0.18 155 / 0.1)',
            border: '1px solid oklch(0.78 0.18 155 / 0.3)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'oklch(0.78 0.18 155)' }}>
            Vous êtes déjà connecté
          </p>
        </div>
        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full h-14 rounded-xl font-semibold text-[15px] active:scale-[0.98] disabled:opacity-40 transition-all duration-200 hover:brightness-110"
          style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
        >
          {loading ? 'Activation…' : 'Activer ce badge'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toggle Créer / Connecter */}
      <div
        className="flex p-1 rounded-xl"
        style={{ background: '#141414' }}
      >
        <button
          onClick={() => setMode('signup')}
          className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200"
          style={
            mode === 'signup'
              ? { background: '#0c0c0d', color: '#f4f4f4', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
              : { color: '#4a4a4c' }
          }
        >
          Créer un compte
        </button>
        <button
          onClick={() => setMode('login')}
          className="flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200"
          style={
            mode === 'login'
              ? { background: '#0c0c0d', color: '#f4f4f4', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
              : { color: '#4a4a4c' }
          }
        >
          Se connecter
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={getFocusStyle('email')}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          minLength={6}
          style={getFocusStyle('password')}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />
        {error && (
          <p className="text-sm text-center" style={{ color: '#f87171' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl font-semibold text-[15px] active:scale-[0.98] disabled:opacity-40 transition-all duration-200 hover:brightness-110"
          style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
        >
          {loading
            ? 'Chargement…'
            : mode === 'login'
            ? 'Se connecter et activer'
            : "S'inscrire et activer"}
        </button>
      </form>
    </div>
  )
}
