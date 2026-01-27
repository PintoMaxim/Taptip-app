'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PullToRefreshProps {
  children: React.ReactNode
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter()
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const threshold = 70

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // On enregistre le départ seulement si on est au sommet
      if (container.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshing || container.scrollTop > 0) return

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current

      // Uniquement si on tire vers le bas au sommet avec une intention claire (> 15px)
      if (distance > 15) {
        // On ne bloque PAS le scroll natif (pas de preventDefault)
        // On se contente d'afficher l'indicateur
        setPullDistance(Math.min(distance * 0.3, 80))
      } else {
        if (pullDistance !== 0) setPullDistance(0)
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true)
        setPullDistance(50)
        
        await new Promise(resolve => setTimeout(resolve, 800))
        router.refresh()
        
        setRefreshing(false)
      }
      setPullDistance(0)
    }

    // Utilisation de passive: true pour garantir que le scroll n'est JAMAIS bloqué
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, refreshing, router])

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Indicateur de pull - Flotte au-dessus sans déplacer le contenu */}
      <div 
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-50"
        style={{ 
          height: pullDistance,
          top: 0,
          opacity: pullDistance > 30 ? 1 : 0,
          transition: pullDistance === 0 ? 'all 0.3s ease' : 'none'
        }}
      >
        <div className="mt-2 bg-white shadow-lg rounded-full p-2 border border-gray-100">
          <div className={`w-6 h-6 border-2 border-gray-200 border-t-black rounded-full ${refreshing ? 'animate-spin' : ''}`}
            style={{
              transform: refreshing ? 'none' : `rotate(${pullDistance * 4}deg)`,
            }}
          />
        </div>
      </div>

      {/* Contenu - Ne bouge plus du tout pour une fluidité 100% native */}
      <div>
        {children}
      </div>
    </div>
  )
}
