'use client'

import { useEffect, useState } from 'react'
import Confetti from './Confetti'

interface SuccessAnimationProps {
  message?: string
  subMessage?: string
}

export default function SuccessAnimation({ 
  message = "Merci beaucoup !", 
  subMessage = "Votre pourboire a bien été envoyé" 
}: SuccessAnimationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-sm w-full text-center animate-scale-bounce">
          {/* Cercle de succès */}
          <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-4 animate-circle-grow">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="animate-check" />
            </svg>
          </div>
          
          {/* Message */}
          <h2 className="text-xl font-bold text-black mb-1">{message}</h2>
          <p className="text-gray-500 text-sm">{subMessage}</p>
          
          {/* Barre de progression */}
          <div className="mt-6 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{
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

