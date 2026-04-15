'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const STATUSES = ['trialing', 'active', 'canceled', 'past_due']

export default function UserStatusControl({ userId, currentStatus }: { userId: string; currentStatus: string | null }) {
  const [status, setStatus] = useState(currentStatus ?? 'none')
  const [saving, setSaving] = useState(false)

  async function update(newStatus: string) {
    setSaving(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: newStatus }),
    })
    setStatus(newStatus)
    setSaving(false)
    toast.success('Status updated')
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      disabled={saving}
      className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 cursor-pointer hover:border-slate-500"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
