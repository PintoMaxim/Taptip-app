'use client'

import { useEffect, useState } from 'react'
import Confetti from '@/app/components/Confetti'

// Fonction pour jouer le son "cha-ching" style Shopify
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    
    // Son 1: "Cha" - son métallique initial
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, audioContext.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1)
    gain1.gain.setValueAtTime(0.3, audioContext.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    osc1.connect(gain1)
    gain1.connect(audioContext.destination)
    osc1.start(audioContext.currentTime)
    osc1.stop(audioContext.currentTime + 0.1)

    // Son 2: "Ching" - son de clochette satisfaisant
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1800, audioContext.currentTime + 0.08)
    osc2.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.15)
    gain2.gain.setValueAtTime(0, audioContext.currentTime)
    gain2.gain.setValueAtTime(0.4, audioContext.currentTime + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    osc2.connect(gain2)
    gain2.connect(audioContext.destination)
    osc2.start(audioContext.currentTime + 0.08)
    osc2.stop(audioContext.currentTime + 0.5)

    // Son 3: Harmonique pour plus de richesse
    const osc3 = audioContext.createOscillator()
    const gain3 = audioContext.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(3600, audioContext.currentTime + 0.08)
    gain3.gain.setValueAtTime(0, audioContext.currentTime)
    gain3.gain.setValueAtTime(0.15, audioContext.currentTime + 0.08)
    gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    osc3.connect(gain3)
    gain3.connect(audioContext.destination)
    osc3.start(audioContext.currentTime + 0.08)
    osc3.stop(audioContext.currentTime + 0.3)
  } catch {
    // Audio non supporté - pas grave
  }
}

export default function SuccessOverlay() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Jouer le son "cha-ching" style Shopify
    playSuccessSound()
    
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

