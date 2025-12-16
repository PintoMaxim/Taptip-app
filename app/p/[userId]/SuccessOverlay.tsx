'use client'

import { useEffect, useState } from 'react'
import Confetti from '@/app/components/Confetti'

export default function SuccessOverlay() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Vibration haptique si disponible
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    
    const timer = setTimeout(() => setShow(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-sm w-full text-center animate-scale-bounce">
          {/* Cercle de succès */}
          <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-4 animate-circle-grow shadow-lg shadow-emerald-500/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="animate-check" />
            </svg>
          </div>
          
          {/* Message */}
          <h2 className="text-2xl font-bold text-black mb-1">Merci beaucoup !</h2>
          <p className="text-gray-500">Votre pourboire a bien été envoyé</p>
          
          {/* Emoji de gratitude */}
          <div className="mt-4 text-4xl animate-pulse-subtle">🙏</div>
          
          {/* Barre de progression */}
          <div className="mt-6 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: '100%',
                animation: 'shrink 4s linear forwards',
              }}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  )
}

