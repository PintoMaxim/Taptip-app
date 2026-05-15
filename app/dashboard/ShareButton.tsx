'use client'

import { useState } from 'react'

interface ShareButtonProps {
  userId: string
}

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function ShareButton({ userId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${userId}`

  const handleCopy = async () => {
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
      onClick={handleCopy}
      className="flex-1 h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl active:scale-[0.98] transition-all duration-200"
      style={
        copied
          ? {
              background: 'oklch(0.78 0.18 155 / 0.12)',
              border: '1px solid oklch(0.78 0.18 155 / 0.4)',
              color: 'oklch(0.78 0.18 155)',
            }
          : {
              background: '#0c0c0d',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#8b8b8d',
            }
      }
    >
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span className="text-xs font-medium" style={{ color: 'inherit' }}>
        {copied ? 'Lien copié !' : 'Lien de bio'}
      </span>
    </button>
  )
}
