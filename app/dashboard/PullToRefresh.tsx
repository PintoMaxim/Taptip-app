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

  const threshold = 80

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // On ne stocke le point de départ que si on est au sommet
      if (container.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (refreshing) return

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current
      
      // Uniquement si on tire vers le bas ET qu'on est au sommet
      if (container.scrollTop <= 0 && distance > 0) {
        // On ne bloque le scroll natif QUE si on dépasse un petit seuil pour éviter les micro-blocages
        if (distance > 10) {
          if (e.cancelable) e.preventDefault()
          setPullDistance(Math.min(distance * 0.4, 80))
        }
      } else {
        if (pullDistance !== 0) setPullDistance(0)
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true)
        setPullDistance(60)
        
        await new Promise(resolve => setTimeout(resolve, 800))
        router.refresh()
        
        setRefreshing(false)
      }
      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

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
      style={{ 
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      {/* Indicateur de pull */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ 
          height: pullDistance,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div className={`w-8 h-8 border-2 border-gray-300 border-t-black rounded-full ${refreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${pullDistance * 2}deg)`,
          }}
        />
      </div>

      {/* Contenu */}
      <div
        className="will-change-transform"
        style={{
          transform: `translateY(${pullDistance * 0.5}px)`,
          transition: pullDistance > 0 ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
