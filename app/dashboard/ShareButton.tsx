'use client'

import { useState } from 'react'

interface ShareButtonProps {
  userId: string
}

export default function ShareButton({ userId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${userId}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon profil TapTip',
          text: 'Laissez-moi un pourboire !',
          url: profileUrl,
        })
        return
      } catch {
        // Annulé
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(`Copiez ce lien : ${profileUrl}`)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 h-16 flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-xl border border-gray-100 active:scale-[0.98] transition-transform"
    >
      <span className="text-xl">{copied ? '✓' : '🔗'}</span>
      <span className="text-xs font-medium text-black">
        {copied ? 'Copié !' : 'Partager'}
      </span>
    </button>
  )
}
