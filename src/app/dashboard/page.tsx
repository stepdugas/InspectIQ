export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getUserId } from '@/lib/auth'
import { db, inspections, reports, profiles, connectedAccounts } from '@/lib/db'
import { eq, desc, gte, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, FileText, Plus, TrendingUp, DollarSign, CalendarDays, ArrowUpRight, ArrowDownRight, CheckCircle2, Circle, UserCog, Link2, Sparkles, Bot } from 'lucide-react'
import { Suspense } from 'react'
import CheckoutRedirect from '@/components/CheckoutRedirect'
import AgentActivityFeed from '@/components/agents/AgentActivityFeed'

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

export default async function DashboardPage() {
  const userId = await getUserId()
  if (!userId) return null

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [allInspections, allReports, [profile], googleConnections] = await Promise.all([
    db.select().from(inspections).where(eq(inspections.userId, userId)).orderBy(desc(inspections.createdAt)),
    db.select().from(reports).where(eq(reports.userId, userId)),
    db.select().from(profiles).where(eq(profiles.id, userId)).limit(1),
    db.select({ id: connectedAccounts.id }).from(connectedAccounts).where(and(eq(connectedAccounts.userId, userId), eq(connectedAccounts.provider, 'google'))).limit(1),
  ])

  const hasProfile = !!(profile?.fullName && profile?.companyName)
  const hasGoogle = googleConnections.length > 0
  const hasInspection = allInspections.length > 0
  const hasCompletedInspection = allInspections.some(i => i.status === 'completed')
  const setupSteps = [
    { done: hasProfile, label: 'Set up your profile', href: '/dashboard/settings', icon: UserCog },
    { done: hasGoogle, label: 'Connect Google', href: '/dashboard/agents', icon: Link2 },
    { done: hasInspection, label: 'Create your first inspection', href: '/dashboard/inspections/new', icon: ClipboardList },
    { done: hasCompletedInspection, label: 'Generate an AI report', href: hasInspection ? `/dashboard/inspections/${allInspections[0]?.id}` : '/dashboard/inspections/new', icon: Sparkles },
  ]
  const stepsComplete = setupSteps.filter(s => s.done).length
  const allSetupDone = stepsComplete === setupSteps.length

  // Stats
  const completedAll = allInspections.filter(i => i.status === 'completed').length
  const thisMonth = allInspections.filter(i => i.createdAt && new Date(i.createdAt) >= startOfThisMonth)
  const lastMonth = allInspections.filter(i => {
    const d = i.createdAt ? new Date(i.createdAt) : null
    return d && d >= startOfLastMonth && d < startOfThisMonth
  })
  const upcoming = allInspections.filter(i => {
    if (!i.inspectionDate || i.status === 'completed') return false
    return new Date(i.inspectionDate) >= now
  }).length

  const revenueCollected = allInspections
    .filter(i => i.paymentStatus === 'paid' && i.inspectionFee)
    .reduce((sum, i) => sum + (i.inspectionFee ?? 0), 0)

  const revenuePending = allInspections
    .filter(i => i.paymentStatus === 'pending' && i.inspectionFee)
    .reduce((sum, i) => sum + (i.inspectionFee ?? 0), 0)

  // Monthly breakdown — last 6 months
  const monthlyData: { label: string; count: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 1)
    const count = allInspections.filter(i => {
      const d = i.createdAt ? new Date(i.createdAt) : null
      return d && d >= start && d < end
    }).length
    monthlyData.push({
      label: start.toLocaleString('default', { month: 'short' }),
      count,
    })
  }
  const maxMonthlyCount = Math.max(...monthlyData.map(m => m.count), 1)

  const countChange = thisMonth.length - lastMonth.length
  const recent = allInspections.slice(0, 5)

  return (
    <div>
      <Suspense><CheckoutRedirect /></Suspense>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your inspection business at a glance</p>
        </div>
        <Link href="/dashboard/inspections/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />New Inspection
          </Button>
        </Link>
      </div>

      {/* ── Setup checklist — shown until all steps complete ── */}
      {!allSetupDone && (
        <Card className="border-blue-200 shadow-sm mb-6 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="py-5 px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Get your AI team running</h3>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {stepsComplete} of {setupSteps.length}
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-1.5 mb-4">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${(stepsComplete / setupSteps.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {setupSteps.map((step) => (
                <Link key={step.label} href={step.href}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${step.done ? 'opacity-60' : 'hover:bg-blue-50'}`}>
                    {step.done
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                    }
                    <step.icon className={`h-4 w-4 ${step.done ? 'text-slate-400' : 'text-blue-600'} shrink-0`} />
                    <span className={`text-sm ${step.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {step.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Stat cards — only shown when there's data ── */}
      {allInspections.length > 0 && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* This month */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">This Month</p>
              <ClipboardList className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{thisMonth.length}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${countChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {countChange >= 0
                ? <ArrowUpRight className="h-3.5 w-3.5" />
                : <ArrowDownRight className="h-3.5 w-3.5" />
              }
              {Math.abs(countChange)} vs last month
            </div>
          </CardContent>
        </Card>

        {/* All-time completed */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedAll}</p>
            <p className="text-xs text-slate-400 mt-1">{allReports.length} reports generated</p>
          </CardContent>
        </Card>

        {/* Revenue collected */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">Revenue Collected</p>
              <DollarSign className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{revenueCollected > 0 ? formatMoney(revenueCollected) : '—'}</p>
            {revenuePending > 0 && (
              <p className="text-xs text-amber-600 mt-1">{formatMoney(revenuePending)} pending</p>
            )}
            {revenueCollected === 0 && revenuePending === 0 && (
              <p className="text-xs text-slate-400 mt-1">via in-app payment links</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">Upcoming</p>
              <CalendarDays className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{upcoming}</p>
            <Link href="/dashboard/schedule" className="text-xs text-blue-500 hover:underline mt-1 block">View schedule →</Link>
          </CardContent>
        </Card>
      </div>}

      {allInspections.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* ── Monthly trend ── */}
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Inspections — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-28">
                {monthlyData.map(m => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700">{m.count > 0 ? m.count : ''}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-sm transition-all"
                      style={{ height: `${Math.max((m.count / maxMonthlyCount) * 80, m.count > 0 ? 4 : 2)}px`, opacity: m.count === 0 ? 0.15 : 1 }}
                    />
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Completion breakdown ── */}
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {[
                { label: 'Draft', count: allInspections.filter(i => i.status === 'draft').length, color: 'bg-slate-200' },
                { label: 'In Progress', count: allInspections.filter(i => i.status === 'in_progress').length, color: 'bg-amber-400' },
                { label: 'Completed', count: allInspections.filter(i => i.status === 'completed').length, color: 'bg-green-500' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{row.label}</span>
                    <span className="text-slate-500">{row.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full transition-all`}
                      style={{ width: `${(row.count / allInspections.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400 pt-1">{allInspections.length} total inspections</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Recent Inspections ── */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">Recent Inspections</CardTitle>
          <Link href="/dashboard/inspections">
            <Button variant="ghost" size="sm" className="text-blue-600">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {allInspections.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No inspections yet — create one to see your AI team in action</p>
              <Link href="/dashboard/inspections/new">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />Start your first inspection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((inspection) => (
                <Link key={inspection.id} href={`/dashboard/inspections/${inspection.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{inspection.propertyAddress}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {inspection.clientName} · {inspection.inspectionDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inspection.paymentStatus === 'paid' && (
                        <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">Paid</Badge>
                      )}
                      {inspection.paymentStatus === 'pending' && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-xs">Payment pending</Badge>
                      )}
                      <Badge className={
                        inspection.status === 'completed' ? 'bg-green-100 text-green-700 border-green-100' :
                        inspection.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }>
                        {inspection.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Agent Activity ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Agent Activity</h2>
            <p className="text-xs text-slate-400">What your AI agents have been doing</p>
          </div>
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="sm" className="text-blue-600">Manage agents</Button>
          </Link>
        </div>
        <AgentActivityFeed limit={10} />
      </div>
    </div>
  )
}
