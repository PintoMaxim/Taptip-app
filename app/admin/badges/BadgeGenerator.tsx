'use client'

import { useState } from 'react'
import { createBadges } from '@/app/actions/badges'

interface GeneratedBadge {
  id: string
  code: string
  referral_code: string
  url: string
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), monospace',
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
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `badges-taptip-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h2 className="text-base font-bold mb-4" style={{ color: '#f4f4f4' }}>
        🎲 Générer des badges
      </h2>

      {/* Sélecteur de quantité */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p
          className="text-[10px] uppercase tracking-wider mb-3"
          style={{ ...monoStyle, color: '#4a4a4c' }}
        >
          Nombre de badges à générer
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCount(Math.max(1, count - 1))}
            className="w-12 h-12 rounded-full text-xl font-bold active:scale-95 transition-all duration-200"
            style={{ background: '#1a1a1c', color: '#f4f4f4', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            −
          </button>
          <div className="w-20 text-center">
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              className="w-full text-4xl font-black text-center bg-transparent focus:outline-none"
              style={{ color: '#f4f4f4', ...monoStyle }}
            />
          </div>
          <button
            onClick={() => setCount(Math.min(100, count + 1))}
            className="w-12 h-12 rounded-full text-xl font-bold active:scale-95 transition-all duration-200"
            style={{ background: '#1a1a1c', color: '#f4f4f4', border: '1px solid rgba(255,255,255,0.08)' }}
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95"
              style={
                count === n
                  ? { background: 'oklch(0.78 0.18 155)', color: '#000' }
                  : { background: '#1a1a1c', color: '#8b8b8d', border: '1px solid rgba(255,255,255,0.06)' }
              }
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
        className="w-full h-12 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 hover:brightness-110"
        style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
      >
        {loading ? 'Génération…' : `Générer ${count} badge${count > 1 ? 's' : ''}`}
      </button>

      {/* Résultats */}
      {generatedBadges.length > 0 && (
        <div
          className="mt-5 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>
              ✅ {generatedBadges.length} badges générés
            </p>
            <div className="flex gap-3">
              <button
                onClick={copyAllUrls}
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: copied === 'all' ? 'oklch(0.78 0.18 155)' : '#8b8b8d' }}
              >
                {copied === 'all' ? '✓ Copié !' : '📋 Tout copier'}
              </button>
              <button
                onClick={downloadCSV}
                className="text-xs font-medium"
                style={{ color: '#8b8b8d' }}
              >
                📥 CSV
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {generatedBadges.map((badge, index) => (
              <div
                key={badge.id}
                className="rounded-lg p-3 flex items-center gap-2"
                style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xs w-6" style={{ color: '#4a4a4c', ...monoStyle }}>{index + 1}.</span>
                <code className="flex-1 text-xs truncate" style={{ color: '#8b8b8d', ...monoStyle }}>
                  {badge.url}
                </code>
                <button
                  onClick={() => copyToClipboard(badge.url, badge.code)}
                  className="text-xs px-2 py-1 rounded transition-all duration-200 active:scale-95"
                  style={{
                    background: copied === badge.code ? 'oklch(0.78 0.18 155 / 0.15)' : '#1a1a1c',
                    color: copied === badge.code ? 'oklch(0.78 0.18 155)' : '#8b8b8d',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {copied === badge.code ? '✓' : '📋'}
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs mt-3 text-center" style={{ color: '#4a4a4c' }}>
            💡 Copiez chaque URL et programmez-la dans un badge NFC avec NFC Tools
          </p>
        </div>
      )}
    </section>
  )
}
