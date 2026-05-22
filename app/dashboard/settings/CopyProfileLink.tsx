'use client'

import { useState } from 'react'

export default function CopyProfileLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `app.taptip.fr/p/${userId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span
      onClick={handleCopy}
      className="relative inline-flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all duration-200"
      style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '11px',
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.1)',
        color: copied ? 'oklch(0.78 0.18 155)' : '#8b8b8d',
      }}
      title="Cliquer pour copier"
    >
      {url}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
        style={{ color: copied ? 'oklch(0.78 0.18 155)' : '#4a4a4c' }}
      >
        {copied ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      {copied && (
        <span
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-md animate-fade-in-up"
          style={{ background: '#0c0c0d', color: 'oklch(0.78 0.18 155)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Copié !
        </span>
      )}
    </span>
  )
}
