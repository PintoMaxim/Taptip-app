'use client'

import { useState } from 'react'

interface ShareButtonProps {
  userId: string
}

// Icône Partager SVG
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

// Icône Check SVG
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

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
      className={`flex-1 h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl border active:scale-[0.98] transition-all ${
        copied 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
          : 'bg-gray-50 border-gray-100 text-gray-600'
      }`}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
      <span className="text-xs font-medium">
        {copied ? 'Copié !' : 'Partager'}
      </span>
    </button>
  )
}
