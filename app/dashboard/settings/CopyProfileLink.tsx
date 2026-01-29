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
      className="font-mono bg-gray-100 px-1 rounded cursor-pointer active:bg-gray-200 transition-colors inline-flex items-center gap-1 text-black font-medium"
      title="Cliquer pour copier"
    >
      {url}
      <span className="text-[8px]">{copied ? '✅' : '📋'}</span>
    </span>
  )
}
