'use client'

import { useState } from 'react'

interface ShareButtonProps {
  userId: string
}

// Icône Lien SVG
const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span className="text-xs font-medium">
        {copied ? 'Lien copié !' : 'Lien de bio'}
      </span>
    </button>
  )
}
