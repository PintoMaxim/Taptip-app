'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
  rotation: number
}

export default function SuccessAnimation() {
  const [show, setShow] = useState(true)
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    // Générer les confettis
    const colors = ['#10b981', '#000000', '#fbbf24', '#ffffff', '#ec4899']
    const newPieces: ConfettiPiece[] = []

    for (let i = 0; i < 60; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      })
    }

    setPieces(newPieces)

    // Masquer après 4 secondes
    const timer = setTimeout(() => setShow(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <>
      {/* Confettis */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute animate-confetti"
            style={{
              left: `${piece.x}%`,
              top: '-20px',
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: '2px',
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Message de succès */}
      <div className="fixed inset-0 flex items-center justify-center z-[99] pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 animate-scale-bounce">
          {/* Cercle de succès */}
          <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center animate-circle-grow shadow-lg shadow-emerald-500/30">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" className="animate-check" />
            </svg>
          </div>

          {/* Texte */}
          <div className="text-center mt-5">
            <h2 className="text-xl font-bold text-black">Merci beaucoup !</h2>
            <p className="text-gray-500 text-sm mt-1">Votre pourboire a été envoyé</p>
          </div>

          {/* Emoji cœur animé */}
          <div className="text-center mt-4">
            <span className="text-3xl animate-pulse-subtle inline-block">💚</span>
          </div>
        </div>
      </div>
    </>
  )
}

