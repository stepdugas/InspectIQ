'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSetup, setIsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        setIsSetup(data.needsSetup === true)
        setCheckingSetup(false)
      })
      .catch(() => setCheckingSetup(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Invalid email or password')
    }
    setLoading(false)
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Setup failed')
    }
    setLoading(false)
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4">
            <ShieldCheck className="h-7 w-7 text-purple-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="text-white font-bold">InspectIQ</span>
          </div>
          <p className="text-slate-400 text-sm">
            {isSetup ? 'Create your admin account' : 'Admin access only'}
          </p>
        </div>

        <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 h-11"
            autoFocus
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 h-11"
          />
          {isSetup && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 h-11"
            />
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !email || !password || (isSetup && !confirmPassword)}
            className="w-full bg-purple-600 hover:bg-purple-500 h-11 transition-all duration-200 hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSetup ? 'Create Admin Account' : 'Log In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
