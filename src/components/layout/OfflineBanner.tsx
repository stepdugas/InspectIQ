'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    function handleOffline() {
      setIsOnline(false)
      setShowReconnected(false)
    }

    function handleOnline() {
      setIsOnline(true)
      setShowReconnected(true)
      // Hide "reconnected" banner after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
      isOnline ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Back online — syncing your data…
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          You&apos;re offline — viewing cached inspection data
        </>
      )}
    </div>
  )
}
