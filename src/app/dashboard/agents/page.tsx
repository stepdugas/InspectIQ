'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Bot, ChevronDown, ChevronRight, Plug, Unplug, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AgentConfigPanel from '@/components/agents/AgentConfigPanel'

const PRESETS: { key: string; label: string; description: string; icon: string; agents: string[] }[] = [
  {
    key: 'reports_only',
    label: 'Just Reports',
    description: 'AI writes your narratives and delivers the finished report. Nothing else.',
    icon: '📝',
    agents: ['report_writer', 'delivery'],
  },
  {
    key: 'full_autopilot',
    label: 'Full Autopilot',
    description: 'Every agent turned on with smart defaults. You inspect, they handle everything else.',
    icon: '🚀',
    agents: ['report_writer', 'delivery', 'follow_up', 'property_research', 'review', 'realtor_nurture', 'repair_summary', 'scheduling', 'compliance', 'business_intel', 'marketing'],
  },
  {
    key: 'custom',
    label: 'Custom',
    description: 'Choose exactly which agents to enable and configure each one.',
    icon: '⚙️',
    agents: [],
  },
]

interface AgentData {
  type: string
  name: string
  description: string
  category: string
  requiresConnector: string[]
  defaultEnabled: boolean
  defaultConfig: Record<string, unknown>
  id?: string
  enabled: boolean
  config: Record<string, unknown>
}

interface ConnectorData {
  provider: string
  connected: boolean
  email: string | null
  scopes: string[]
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [connectors, setConnectors] = useState<ConnectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)
  const [applyingPreset, setApplyingPreset] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/connectors').then(r => r.json()),
    ]).then(([agentData, connectorData]) => {
      const agentList = agentData.agents ?? []
      setAgents(agentList)
      setConnectors(connectorData.connectors ?? [])
      // Show preset selector if no agents have been manually configured yet
      const hasAnyEnabled = agentList.some((a: AgentData) => a.enabled && !['report_writer', 'delivery'].includes(a.type))
      setShowPresets(!hasAnyEnabled)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load agent settings')
      setLoading(false)
    })
  }, [])

  async function applyPreset(presetKey: string) {
    if (presetKey === 'custom') {
      setShowPresets(false)
      return
    }
    const preset = PRESETS.find(p => p.key === presetKey)
    if (!preset) return

    setApplyingPreset(true)
    try {
      // Enable the preset's agents, disable the rest
      await Promise.all(agents.map(agent =>
        fetch('/api/agents', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentType: agent.type, enabled: preset.agents.includes(agent.type) }),
        })
      ))
      setAgents(prev => prev.map(a => ({ ...a, enabled: preset.agents.includes(a.type) })))
      toast.success(`${preset.label} mode activated`)
      setShowPresets(false)
    } catch {
      toast.error('Failed to apply preset')
    } finally {
      setApplyingPreset(false)
    }
  }

  async function toggleAgent(agentType: string, enabled: boolean) {
    setSaving(agentType)
    setAgents(prev => prev.map(a => a.type === agentType ? { ...a, enabled } : a))

    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, enabled }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${agents.find(a => a.type === agentType)?.name} ${enabled ? 'enabled' : 'disabled'}`)
    } catch {
      setAgents(prev => prev.map(a => a.type === agentType ? { ...a, enabled: !enabled } : a))
      toast.error('Failed to update agent')
    } finally {
      setSaving(null)
    }
  }

  async function updateAgentConfig(agentType: string, config: Record<string, unknown>) {
    setSaving(agentType)
    try {
      const res = await fetch('/api/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, config }),
      })
      if (!res.ok) throw new Error()
      setAgents(prev => prev.map(a => a.type === agentType ? { ...a, config } : a))
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(null)
    }
  }

  function isConnectorMet(agent: AgentData): boolean {
    if (agent.requiresConnector.length === 0) return true
    return agent.requiresConnector.some(req =>
      connectors.find(c => c.provider === req && c.connected)
    )
  }

  async function disconnectProvider(provider: string) {
    try {
      const res = await fetch('/api/connectors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      if (!res.ok) throw new Error()
      setConnectors(prev => prev.map(c => c.provider === provider ? { ...c, connected: false, email: null } : c))
      toast.success(`${provider} disconnected`)
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  const categories = [
    { key: 'core', label: 'Core Agents', description: 'Active on every inspection' },
    { key: 'post_inspection', label: 'Post-Inspection Agents', description: 'Work after you complete a report' },
    { key: 'business_ops', label: 'Business Operations', description: 'Run your business on autopilot' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Agents</h1>
        <p className="text-slate-500 text-sm mt-1">Your AI workforce. Toggle each agent on or off and configure how they work.</p>
      </div>

      {/* Quick Setup — shown when no agents are configured beyond defaults */}
      {showPresets && (
        <Card className="border-blue-100 shadow-sm mb-8 bg-blue-50">
          <CardContent className="py-6 px-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">How do you want your AI team to work?</h2>
            <p className="text-sm text-slate-500 mb-4">Pick a starting point. You can always customize later.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESETS.map(preset => (
                <button
                  key={preset.key}
                  onClick={() => applyPreset(preset.key)}
                  disabled={applyingPreset}
                  className="text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{preset.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      <Card className="border-slate-100 shadow-sm mb-8">
        <CardContent className="py-4 px-6">
          <div className="flex items-center gap-2 mb-4">
            <Plug className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">Connected Accounts</span>
            <span className="text-xs text-slate-400">Required by some agents</span>
          </div>
          {connectors.every(c => !c.connected) && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">Connect your Google account to unlock calendar sync, email sending from your address, and review requests.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connectors.map(c => (
              <div key={c.provider} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold',
                    c.provider === 'google' ? 'bg-red-500' : 'bg-blue-600'
                  )}>
                    {c.provider === 'google' ? 'G' : 'M'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{c.provider}</p>
                    {c.connected ? (
                      <p className="text-xs text-slate-400">{c.email}</p>
                    ) : (
                      <p className="text-xs text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>
                {c.connected ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-slate-500"
                    onClick={() => disconnectProvider(c.provider)}
                  >
                    <Unplug className="h-3 w-3 mr-1" />Disconnect
                  </Button>
                ) : (
                  <a href={`/api/auth/connect/${c.provider}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Plug className="h-3 w-3 mr-1" />Connect
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Categories */}
      {categories.map(cat => {
        const categoryAgents = agents.filter(a => a.category === cat.key)
        if (categoryAgents.length === 0) return null

        return (
          <div key={cat.key} className="mb-8">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-900">{cat.label}</h2>
              <p className="text-xs text-slate-400">{cat.description}</p>
            </div>
            <div className="space-y-3">
              {categoryAgents.map(agent => {
                const isExpanded = expandedAgent === agent.type
                const connectorMet = isConnectorMet(agent)
                const isSaving = saving === agent.type

                return (
                  <Card key={agent.type} className="border-slate-100 shadow-sm">
                    <CardContent className="py-0 px-0">
                      {/* Agent header */}
                      <div className="flex items-center justify-between px-6 py-4">
                        <button
                          onClick={() => setExpandedAgent(isExpanded ? null : agent.type)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <Bot className={cn('h-5 w-5', agent.enabled ? 'text-blue-600' : 'text-slate-300')} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{agent.name}</span>
                              {agent.enabled && <Badge className="bg-green-50 text-green-600 border-green-100 text-[10px]">Active</Badge>}
                              {!connectorMet && agent.requiresConnector.length > 0 && (
                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[10px]">
                                  <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                                  Needs {agent.requiresConnector.join(' or ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{agent.description}</p>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400 ml-auto shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 ml-auto shrink-0" />}
                        </button>

                        {/* Toggle */}
                        <button
                          role="switch"
                          aria-checked={agent.enabled}
                          aria-label={`${agent.enabled ? 'Disable' : 'Enable'} ${agent.name}`}
                          onClick={() => toggleAgent(agent.type, !agent.enabled)}
                          disabled={isSaving}
                          className={cn(
                            'relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                            agent.enabled ? 'bg-blue-600' : 'bg-slate-200'
                          )}
                        >
                          <span className={cn(
                            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                            agent.enabled ? 'translate-x-5' : 'translate-x-0'
                          )} />
                        </button>
                      </div>

                      {/* Expanded config panel */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                          <AgentConfigPanel
                            agentType={agent.type}
                            config={agent.config}
                            onSave={(config) => updateAgentConfig(agent.type, config)}
                            saving={isSaving}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
