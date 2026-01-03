'use client'

import { useState } from 'react'
import { createBadges } from '@/app/actions/badges'

interface GeneratedBadge {
  id: string
  code: string
  referral_code: string
  url: string
}

export default function BadgeGenerator() {
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [generatedBadges, setGeneratedBadges] = useState<GeneratedBadge[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)

    const result = await createBadges(count)

    if (result.error) {
      alert(result.error)
    } else if (result.badges) {
      setGeneratedBadges(result.badges)
    }

    setLoading(false)
  }

  const copyToClipboard = async (url: string, code: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAllUrls = async () => {
    const urls = generatedBadges.map(b => b.url).join('\n')
    await navigator.clipboard.writeText(urls)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadCSV = () => {
    const header = 'Code Badge,Code Parrainage,URL,Statut\n'
    const rows = generatedBadges.map(b => `${b.code},${b.referral_code},${b.url},Non activé`).join('\n')
    const csv = header + rows
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `badges-taptip-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <section className="bg-gray-50 rounded-2xl p-5">
      <h2 className="text-base font-bold text-black mb-4">
        🎲 Générer des badges
      </h2>

      {/* Input + Bouton */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">
            Nombre de badges
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            min="1"
            max="100"
            className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-lg font-medium text-center focus:border-black focus:outline-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="h-12 px-6 mt-5 rounded-xl bg-black text-white font-semibold transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? '...' : 'Générer'}
        </button>
      </div>

      {/* Résultats */}
      {generatedBadges.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-black">
              ✅ {generatedBadges.length} badges générés
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyAllUrls}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {copied === 'all' ? '✓ Copié !' : '📋 Tout copier'}
              </button>
              <button
                onClick={downloadCSV}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                📥 CSV
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {generatedBadges.map((badge, index) => (
              <div
                key={badge.id}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                  <code className="flex-1 text-xs text-gray-700 truncate">
                    {badge.url}
                  </code>
                  <button
                    onClick={() => copyToClipboard(badge.url, badge.code)}
                    className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {copied === badge.code ? '✓' : '📋'}
                  </button>
                </div>
                {/* Code parrainage */}
                <div className="flex items-center gap-2 mt-2 ml-6">
                  <span className="text-[10px] text-gray-400">🎁 Code parrain :</span>
                  <code className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {badge.referral_code}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            💡 Copiez chaque URL et programmez-la dans un badge NFC avec NFC Tools
          </p>
        </div>
      )}
    </section>
  )
}
