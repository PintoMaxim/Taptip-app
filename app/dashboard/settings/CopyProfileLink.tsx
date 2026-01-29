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
      className="relative font-mono bg-gray-100 px-2 py-0.5 rounded cursor-pointer active:bg-gray-200 transition-all inline-flex items-center gap-2 text-black font-medium group"
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
        className={`transition-all duration-300 ${copied ? 'text-emerald-500 scale-110' : 'text-gray-400'}`}
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
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md animate-in fade-in zoom-in duration-200">
          Copié !
        </span>
      )}
    </span>
  )
}
