'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Placed in the dashboard — if ?checkout=1 is present, auto-trigger Stripe checkout
export default function CheckoutRedirect() {
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('checkout') === '1') {
      fetch('/api/stripe/create-checkout', { method: 'POST' })
        .then((r) => r.json())
        .then(({ url }) => { if (url) window.location.href = url })
        .catch(() => {})
    }
  }, [params])

  return null
}
