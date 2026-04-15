'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Users, TrendingUp, FileText, DollarSign, ChevronRight, KeyRound, Loader2, Settings, LayoutDashboard, PlayCircle, Copy, ExternalLink, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Profile {
  id: string
  fullName: string | null
  email: string
  companyName: string | null
  subscriptionStatus: string | null
  createdAt: Date | string | null
}

interface DemoInspection {
  id: string
  propertyAddress: string | null
  clientName: string | null
  inspectionDate: string | null
  status: string | null
  shareToken: string | null
}

interface Props {
  profiles: Profile[]
  inspectionCount: number
  reportCount: number
  demoInspections: DemoInspection[]
}

const STATUS_OPTIONS = ['trialing', 'active', 'canceled', 'past_due']

function statusBadgeClass(status: string | null) {
  if (status === 'active') return 'bg-green-900/50 text-green-400 border-green-800'
  if (status === 'trialing') return 'bg-blue-900/50 text-blue-400 border-blue-800'
  return 'bg-slate-800 text-slate-400 border-slate-700'
}

export default function AdminDashboard({ profiles, inspectionCount, demoInspections }: Props) {
  const [tab, setTab] = useState<'overview' | 'users' | 'demo' | 'settings'>('overview')
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>(
    Object.fromEntries(profiles.map((p) => [p.id, p.subscriptionStatus ?? 'none']))
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const [clearingDemo, setClearingDemo] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeCount = profiles.filter((p) => p.subscriptionStatus === 'active' || p.subscriptionStatus === 'trialing').length
  const paidCount = profiles.filter((p) => p.subscriptionStatus === 'active').length
  const trialCount = profiles.filter((p) => p.subscriptionStatus === 'trialing').length
  const mrr = paidCount * 99

  const filteredProfiles = userFilter
    ? profiles.filter((p) => p.subscriptionStatus === userFilter)
    : profiles

  function openUsersTab(filter: string | null = null) {
    setUserFilter(filter)
    setTab('users')
  }

  async function updateStatus(userId: string, newStatus: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: newStatus }),
    })
    setUserStatuses((prev) => ({ ...prev, [userId]: newStatus }))
    toast.success('Status updated')
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Must be at least 8 characters'); return }
    setSavingPassword(true)
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })
    if (res.ok) {
      toast.success('Password updated')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error('Failed to update password')
    }
    setSavingPassword(false)
  }

  async function deleteInspection(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/admin/inspections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Inspection deleted')
      window.location.href = '/admin?tab=demo'
    } else {
      toast.error('Failed to delete inspection')
    }
    setDeletingId(null)
  }

  async function clearDemo() {
    if (!confirm('Delete all demo inspections? This cannot be undone.')) return
    setClearingDemo(true)
    const res = await fetch('/api/admin/clear-demo', { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      toast.success(data.message ?? 'Demo data cleared')
      window.location.href = '/admin?tab=demo'
    } else {
      toast.error(data.error ?? 'Failed to clear demo data')
    }
    setClearingDemo(false)
  }

  async function loadDemo() {
    setSeedingDemo(true)
    const res = await fetch('/api/admin/seed-demo', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      toast.success(data.message ?? 'Demo loaded!')
      setTab('demo')
      // Refresh to show new demo inspections
      window.location.href = '/admin?tab=demo'
    } else {
      toast.error(data.error ?? 'Failed to load demo')
    }
    setSeedingDemo(false)
  }

  async function copyShareLink(token: string, id: string) {
    const url = `${window.location.origin}/report/${token}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiedId(id)
    toast.success('Share link copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', filter: null, clickable: true },
    { label: 'Active & Trial', value: activeCount, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', filter: 'trialing', clickable: true },
    { label: 'Paid Subscribers', value: paidCount, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', filter: 'active', clickable: true },
    { label: 'Inspections', value: inspectionCount, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', filter: null, clickable: false },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-slate-900 rounded-xl p-1 w-fit border border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'demo', label: 'Demo', icon: PlayCircle },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className="mb-2">
            <h2 className="text-xl font-bold text-white">Overview</h2>
            <p className="text-slate-400 text-sm mt-0.5">Click any card to see details</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/20 rounded-2xl p-6 mb-6 mt-4">
            <p className="text-slate-400 text-sm mb-1">Monthly Recurring Revenue</p>
            <p className="text-5xl font-bold text-white">${mrr.toLocaleString()}</p>
            <p className="text-slate-500 text-sm mt-2">{paidCount} active subscriber{paidCount !== 1 ? 's' : ''} × $99/month</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <button
                key={s.label}
                onClick={() => s.clickable && openUsersTab(s.filter)}
                className={`text-left p-5 rounded-xl border ${s.bg} transition-all duration-200 ${
                  s.clickable ? 'hover:scale-[1.02] hover:brightness-110 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  {s.clickable && <ChevronRight className="h-4 w-4 text-slate-600" />}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{trialCount}</p>
              <p className="text-xs text-slate-400 mt-1">On Trial</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{paidCount}</p>
              <p className="text-xs text-slate-400 mt-1">Paying</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-300">{profiles.length - activeCount}</p>
              <p className="text-xs text-slate-400 mt-1">Churned</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {userFilter ? `${userFilter.charAt(0).toUpperCase() + userFilter.slice(1)} Users` : 'All Users'}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{filteredProfiles.length} user{filteredProfiles.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {['all', 'active', 'trialing', 'canceled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f === 'all' ? null : f)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    (f === 'all' && !userFilter) || userFilter === f
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  {['Name', 'Email', 'Company', 'Status', 'Change Status', 'Joined'].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{p.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{p.email}</td>
                    <td className="px-4 py-3 text-slate-400">{p.companyName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadgeClass(userStatuses[p.id] ?? null)}>
                        {userStatuses[p.id] ?? 'none'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={userStatuses[p.id] ?? 'none'}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                        className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 cursor-pointer hover:border-slate-500 focus:outline-none focus:border-blue-500"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo Tab */}
      {tab === 'demo' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Demo Mode</h2>
              <p className="text-slate-400 text-sm mt-0.5">Share these links with prospects to show the product in action — no login required.</p>
            </div>
            <div className="flex items-center gap-2">
              {demoInspections.length > 0 && (
                <button
                  onClick={clearDemo}
                  disabled={clearingDemo}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-800 hover:border-red-600 text-red-400 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {clearingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Clear All
                </button>
              )}
              <button
                onClick={loadDemo}
                disabled={seedingDemo}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {seedingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Load Demo Data
              </button>
            </div>
          </div>

          {demoInspections.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-16 text-center">
              <PlayCircle className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-medium mb-2">No demo data yet</p>
              <p className="text-slate-500 text-sm mb-6">Click "Load Demo Data" to generate 5 realistic sample inspections with share links.</p>
              <button
                onClick={loadDemo}
                disabled={seedingDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {seedingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Load Demo Data
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {demoInspections.map((insp) => (
                <div key={insp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{insp.propertyAddress}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{insp.clientName} · {insp.inspectionDate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {insp.shareToken ? (
                      <>
                        <button
                          onClick={() => copyShareLink(insp.shareToken!, insp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          {copiedId === insp.id
                            ? <><CheckCircle2 className="h-3 w-3 text-green-400" />Copied!</>
                            : <><Copy className="h-3 w-3" />Copy Link</>
                          }
                        </button>
                        <a
                          href={`/report/${insp.shareToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Preview
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">No share link</span>
                    )}
                    {confirmDeleteId === insp.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-400">Sure?</span>
                        <button
                          onClick={() => { setConfirmDeleteId(null); deleteInspection(insp.id) }}
                          disabled={deletingId === insp.id}
                          className="px-2.5 py-1 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === insp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 text-xs font-medium border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(insp.id)}
                        className="flex items-center justify-center w-8 h-8 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete inspection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500 pt-2 text-center">These are public links — anyone with the URL can view the report without logging in.</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="max-w-lg">
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-purple-400" />
              Change Admin Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">New password takes effect immediately. You'll stay logged in.</p>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">New password</label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Confirm password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword}
                className="w-full bg-purple-600 hover:bg-purple-500 h-10"
              >
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Access Info</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Admin URL: <span className="text-slate-200">useinspectiq.com/admin/login</span></p>
              <p>Admin email: set via <span className="text-slate-200">ADMIN_EMAIL</span> in Vercel env vars</p>
              <p>Default password: set via <span className="text-slate-200">ADMIN_PASSWORD</span> in Vercel env vars</p>
              <p className="text-slate-500 pt-2">Once changed above, the DB password overrides the env var.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
