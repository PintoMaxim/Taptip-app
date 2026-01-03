'use client'

import { useState } from 'react'
import { Copy, Check, Users, Gift } from 'lucide-react'

interface ReferralCardProps {
  referralCode: string
  referralCount: number
}

export default function ReferralCard({ referralCode, referralCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  // Message de partage avec le code
  const shareMessage = `🎁 Rejoins TapTip et utilise mon code ${referralCode} pour me faire gagner 10€ ! Commande ton badge sur taptip.fr`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur copie:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TapTip - Parrainage',
          text: shareMessage,
        })
      } catch (err) {
        // L'utilisateur a annulé le partage
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
      {/* Petit badge décoratif */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-100 rounded-full opacity-20" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Gift size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900">Parrainez vos collègues</h3>
            <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider">Gagnez des avantages exclusifs</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white border border-indigo-100 rounded-xl p-3 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Mon Code</span>
            <span className="text-lg font-black text-black tracking-tight">{referralCode}</span>
          </div>
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-black text-white active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copié !
              </>
            ) : (
              <>
                <Copy size={14} />
                Partager
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-indigo-900/70 font-medium">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-indigo-500" />
            <span><strong>{referralCount}</strong> parrainage{referralCount > 1 ? 's' : ''}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-indigo-200" />
          <span>Gagnez <strong>10€</strong> par collègue parrainé !</span>
        </div>
      </div>
    </div>
  )
}

