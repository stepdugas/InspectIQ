'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Mail, Star, FileText, Calendar, Shield, TrendingUp, Megaphone, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  agentType: string
  action: string
  details: Record<string, unknown>
  inspectionId: string | null
  createdAt: string
}

// Consolidated to 4 colors by category: blue (core), purple (communication), amber (growth), slate (ops)
const AGENT_META: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  delivery: { icon: Mail, color: 'text-blue-600', label: 'Delivery Agent' },
  follow_up: { icon: Mail, color: 'text-blue-600', label: 'Follow-Up Agent' },
  report_writer: { icon: FileText, color: 'text-blue-600', label: 'Report Writer' },
  property_research: { icon: Search, color: 'text-blue-600', label: 'Property Research Agent' },
  review: { icon: Star, color: 'text-amber-600', label: 'Review Agent' },
  realtor_nurture: { icon: Mail, color: 'text-amber-600', label: 'Realtor Nurture Agent' },
  marketing: { icon: Megaphone, color: 'text-amber-600', label: 'Marketing Agent' },
  repair_summary: { icon: FileText, color: 'text-purple-600', label: 'Repair Summary Agent' },
  scheduling: { icon: Calendar, color: 'text-purple-600', label: 'Scheduling Agent' },
  lead_qualifier: { icon: Bot, color: 'text-purple-600', label: 'Lead Qualifier' },
  compliance: { icon: Shield, color: 'text-slate-500', label: 'Compliance Agent' },
  business_intel: { icon: TrendingUp, color: 'text-slate-500', label: 'Business Intel Agent' },
  after_hours: { icon: Bot, color: 'text-slate-500', label: 'After-Hours Agent' },
}

function describeAction(item: ActivityItem): string {
  const details = item.details ?? {}
  switch (item.action) {
    case 'email_sent':
      return `Sent follow-up to ${details.recipient ?? 'client'}`
    case 'review_requested':
      return `Requested review from ${details.recipient ?? 'client'}`
    case 'summary_generated':
      return `Generated repair summary (${details.criticalCount ?? 0} critical, ${details.maintenanceCount ?? 0} maintenance)`
    case 'referral_tracked':
      return `Tracked referral from ${details.realtorName ?? 'realtor'} (${details.totalReferrals ?? 1} total)`
    case 'thank_you_sent':
      return `Sent thank-you to ${details.realtorName ?? 'realtor'}`
    case 'booking_created':
      return `New booking: ${details.clientName ?? 'Client'} at ${details.propertyAddress ?? 'property'}`
    case 'reminder_sent':
      return `Sent reminder: ${details.description ?? 'deadline'} (${details.daysUntilExpiry ?? '?'} days left)`
    case 'report_sent':
      return `Sent ${details.frequency ?? 'periodic'} business report`
    case 'post_suggested':
      return 'Drafted a Google Business Profile post for your review'
    case 'permit_fetched':
      return `Pulled permit history for ${details.address ?? 'property'}`
    default:
      return item.action.replace(/_/g, ' ')
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function AgentActivityFeed({ limit = 10 }: { limit?: number }) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/activity?limit=${limit}`)
      .then(r => r.json())
      .then(data => {
        setActivity(data.activity ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [limit])

  if (loading) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (activity.length === 0) {
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="py-8 text-center">
          <Bot className="h-8 w-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No agent activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Your AI agents will show their work here as they complete tasks.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="py-0 px-0">
        <div className="divide-y divide-slate-50">
          {activity.map(item => {
            const meta = AGENT_META[item.agentType] ?? { icon: Bot, color: 'text-slate-600', label: item.agentType }
            const Icon = meta.icon

            return (
              <div key={item.id} className="flex items-start gap-3 px-6 py-3">
                <div className={cn('mt-0.5', meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{describeAction(item)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">{meta.label}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
