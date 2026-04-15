'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, Loader2 } from 'lucide-react'

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })
    if (res.ok) {
      toast.success('Password updated — use it next time you log in')
      setNewPassword('')
      setConfirm('')
    } else {
      toast.error('Failed to update password')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-xs text-slate-400 mb-1 block">New password</label>
        <Input
          type="password"
          placeholder="Min 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-slate-400 mb-1 block">Confirm password</label>
        <Input
          type="password"
          placeholder="Confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !newPassword || !confirm}
        size="sm"
        className="bg-purple-600 hover:bg-purple-500 h-9"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><KeyRound className="h-3 w-3 mr-1" />Update</>}
      </Button>
    </form>
  )
}
