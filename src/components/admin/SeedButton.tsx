'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SeedButton() {
  const [loading, setLoading] = useState(false)

  async function handleSeed() {
    setLoading(true)
    const res = await fetch('/api/admin/seed-demo', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      toast.success(data.message ?? 'Demo data seeded!')
    } else {
      toast.error(data.error ?? 'Failed to seed demo data')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors bg-transparent disabled:opacity-50"
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Seed Demo Data
    </button>
  )
}
