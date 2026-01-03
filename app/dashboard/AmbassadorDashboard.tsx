'use client'

import { useState } from 'react'
import { Share2, Users, Wallet, CheckCircle, Copy, Gift } from 'lucide-react'

interface AmbassadorDashboardProps {
  referralCode: string
  stats: {
    pending: number
    available: number
    paid: number
    totalCount: number
  }
}

export default function AmbassadorDashboard({ referralCode, stats }: AmbassadorDashboardProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `Salut ! Rejoins TapTip pour booster tes pourboires. Utilise mon code de parrainage ${referralCode} pour recevoir un bonus de bienvenue.`
  const shareUrl = `${window.location.origin}/activate` // On renvoie vers l'activation

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TapTip - Programme Ambassadeur',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Erreur partage:', err)
      }
    } else {
      copyCode()
    }
  }

  return (
    <div className="bg-black rounded-2xl p-6 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
            <Gift size={16} />
          </div>
          <h3 className="text-sm font-bold tracking-tight">Programme Ambassadeur</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Wallet size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">En attente</span>
            </div>
            <p className="text-xl font-black">{stats.pending.toFixed(2)}€</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-1.5 text-green-400 mb-1">
              <CheckCircle size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider text-green-400/80">Disponible</span>
            </div>
            <p className="text-xl font-black">{stats.available.toFixed(2)}€</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={copyCode}
            className="flex-1 h-12 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copié !' : `CODE : ${referralCode}`}
          </button>
          
          <button 
            onClick={handleShare}
            className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all border border-white/10"
          >
            <Share2 size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Users size={12} />
          <span>{stats.totalCount} collègue{stats.totalCount > 1 ? 's' : ''} parrainé{stats.totalCount > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

