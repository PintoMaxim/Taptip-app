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
    const header = 'Code Badge,URL,Statut\n'
    const rows = generatedBadges.map(b => `${b.code},${b.url},Non activé`).join('\n')
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

      {/* Sélecteur de quantité */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">
          Nombre de badges à générer
        </p>
        
        <div className="flex items-center justify-center gap-4">
          {/* Bouton moins */}
          <button
            onClick={() => setCount(Math.max(1, count - 1))}
            className="w-12 h-12 rounded-full bg-gray-100 text-black text-xl font-bold active:bg-gray-200 active:scale-95 transition-all"
          >
            −
          </button>
          
          {/* Nombre */}
          <div className="w-20 text-center">
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              className="w-full text-4xl font-black text-black text-center bg-transparent focus:outline-none"
            />
          </div>
          
          {/* Bouton plus */}
          <button
            onClick={() => setCount(Math.min(100, count + 1))}
            className="w-12 h-12 rounded-full bg-gray-100 text-black text-xl font-bold active:bg-gray-200 active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        {/* Raccourcis */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 5, 10, 25, 50].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                count === n 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton générer */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-black text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Génération...' : `Générer ${count} badge${count > 1 ? 's' : ''}`}
      </button>

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
