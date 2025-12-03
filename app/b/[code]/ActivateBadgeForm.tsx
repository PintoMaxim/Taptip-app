'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { activateBadge } from '@/app/actions/badges'

interface ActivateBadgeFormProps {
  code: string
}

export default function ActivateBadgeForm({ code }: ActivateBadgeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleActivate = async () => {
    setLoading(true)
    setError(null)

    const result = await activateBadge(code)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Rediriger vers le dashboard pour configurer le profil
    router.push('/dashboard?activated=true')
  }

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleActivate}
        disabled={loading}
        className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-black bg-black text-base font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Activation...' : '✨ Activer ce badge'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        En activant ce badge, il sera lié à votre compte.
      </p>
    </div>
  )
}

