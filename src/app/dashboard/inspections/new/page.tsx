'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DEFAULT_ROOMS, SYSTEM_TEMPLATES, US_STATES } from '@/lib/inspection-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Download, Loader2, CheckCircle2, LayoutTemplate, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface CustomTemplate {
  id: string
  name: string
  description: string | null
  rooms: { id: string; name: string; items: { name: string }[] }[]
}

const ISN_ENABLED = process.env.NEXT_PUBLIC_ISN_ENABLED === 'true'

interface IsnOrder {
  id: string | number
  // ISN field names — mapped from whatever the API returns
  address?: string
  property_address?: string
  client_name?: string
  clientName?: string
  client_email?: string
  clientEmail?: string
  inspection_date?: string
  inspectionDate?: string
  scheduled_date?: string
}

export default function NewInspectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [address, setAddress] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [date, setDate] = useState(searchParams.get('date') ?? new Date().toISOString().split('T')[0])
  const [selectedRooms, setSelectedRooms] = useState<string[]>(DEFAULT_ROOMS.map((r) => r.name))
  const [loading, setLoading] = useState(false)
  // Template state — 'system' uses a built-in template, 'custom' uses a user-created one
  const [templateMode, setTemplateMode] = useState<'system' | 'custom'>('system')
  const [selectedSystemTemplate, setSelectedSystemTemplate] = useState('internachi')
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  // ISN import state
  const [isnConnected, setIsnConnected] = useState(false)
  const [isnOrders, setIsnOrders] = useState<IsnOrder[]>([])
  const [isnLoading, setIsnLoading] = useState(false)
  const [selectedIsnOrderId, setSelectedIsnOrderId] = useState<string | null>(null)
  const [showIsnImport, setShowIsnImport] = useState(false)
  // Agent information state
  const [showAgentInfo, setShowAgentInfo] = useState(false)
  const [buyerAgentName, setBuyerAgentName] = useState('')
  const [buyerAgentEmail, setBuyerAgentEmail] = useState('')
  const [buyerAgentPhone, setBuyerAgentPhone] = useState('')
  const [listingAgentName, setListingAgentName] = useState('')
  const [listingAgentEmail, setListingAgentEmail] = useState('')
  const [listingAgentPhone, setListingAgentPhone] = useState('')
  // Inspector name — pre-filled from profile, editable for multi-inspector companies
  const [inspectorName, setInspectorName] = useState('')

  // Load custom templates + ISN status + profile on mount
  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(data => {
      setCustomTemplates(data.templates ?? [])
    })
    // Fetch profile to pre-fill inspector name + auto-select template from state
    fetch('/api/profile').then(r => r.json()).then(data => {
      if (data.profile?.fullName) setInspectorName(data.profile.fullName)
      if (ISN_ENABLED) setIsnConnected(!!data.profile?.isnCompanyKey)
      // Auto-select template: explicit default > state recommendation > internachi
      if (data.profile?.defaultTemplateId) {
        const tmpl = SYSTEM_TEMPLATES.find((t) => t.id === data.profile.defaultTemplateId)
        if (tmpl) setSelectedSystemTemplate(tmpl.id)
      } else if (data.profile?.inspectionState) {
        const stateInfo = US_STATES.find((s) => s.code === data.profile.inspectionState)
        if (stateInfo?.recommendedTemplates[0]) {
          const recommended = stateInfo.recommendedTemplates[0]
          if (SYSTEM_TEMPLATES.find((t) => t.id === recommended)) {
            setSelectedSystemTemplate(recommended)
          }
        }
      }
    })
  }, [])

  async function loadIsnOrders() {
    setIsnLoading(true)
    try {
      const res = await fetch('/api/isn/orders')
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to load ISN orders'); return }
      setIsnOrders(data.orders ?? [])
      setShowIsnImport(true)
    } catch {
      toast.error('Failed to load ISN orders')
    } finally {
      setIsnLoading(false)
    }
  }

  function importIsnOrder(order: IsnOrder) {
    // ISN field names vary — handle common variations
    const addr = order.address ?? order.property_address ?? ''
    const client = order.client_name ?? order.clientName ?? ''
    const email = order.client_email ?? order.clientEmail ?? ''
    const rawDate = order.inspection_date ?? order.inspectionDate ?? order.scheduled_date ?? ''
    const formattedDate = rawDate ? rawDate.split('T')[0] : new Date().toISOString().split('T')[0]

    setAddress(addr)
    setClientName(client)
    setClientEmail(email)
    setDate(formattedDate)
    setSelectedIsnOrderId(String(order.id))
    setShowIsnImport(false)
    toast.success('Order imported from ISN!')
  }

  function toggleRoom(name: string) {
    setSelectedRooms((prev) => prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name])
  }

  const [showConfirm, setShowConfirm] = useState(false)

  function handleCreateClick() {
    if (!address || !clientName || !date) { toast.error('Please fill in all required fields'); return }
    setShowConfirm(true)
  }

  async function handleCreate() {
    setLoading(true)

    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, clientName, clientEmail, clientPhone, date, selectedRooms, isnOrderId: selectedIsnOrderId, customTemplateId: templateMode === 'custom' ? selectedTemplateId : null, systemTemplateId: templateMode === 'system' ? selectedSystemTemplate : null, buyerAgentName, buyerAgentEmail, buyerAgentPhone, listingAgentName, listingAgentEmail, listingAgentPhone, inspectorName }),
    })

    if (!res.ok) { toast.error('Failed to create inspection'); setLoading(false); return }
    const { id } = await res.json()
    toast.success('Inspection created!')
    router.push(`/dashboard/inspections/${id}`)
  }

  // Resolve template name for confirmation display
  const selectedTemplateName = templateMode === 'custom'
    ? customTemplates.find((t) => t.id === selectedTemplateId)?.name ?? 'Custom template'
    : SYSTEM_TEMPLATES.find((t) => t.id === selectedSystemTemplate)?.name ?? 'InterNACHI Standard'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/inspections">
          <Button variant="ghost" size="sm" className="text-slate-500"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Inspection</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the property details to get started</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ISN import — only shown when NEXT_PUBLIC_ISN_ENABLED=true and user has ISN connected */}
        {ISN_ENABLED && isnConnected && (
          <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
            <CardContent className="py-4">
              {selectedIsnOrderId ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Imported from ISN order #{selectedIsnOrderId}</span>
                  </div>
                  <button
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                    onClick={() => { setSelectedIsnOrderId(null); setShowIsnImport(false) }}
                  >
                    Clear
                  </button>
                </div>
              ) : showIsnImport ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Select an ISN order to import</p>
                  {isnOrders.length === 0 ? (
                    <p className="text-sm text-slate-400">No orders found in ISN</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {isnOrders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => importIsnOrder(order)}
                          className="w-full text-left p-3 rounded-lg bg-white border border-slate-100 hover:border-blue-300 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-800">
                            {order.address ?? order.property_address ?? `Order #${order.id}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.client_name ?? order.clientName ?? ''} · {order.inspection_date ?? order.inspectionDate ?? order.scheduled_date ?? ''}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="text-xs text-slate-400 hover:text-slate-600 underline" onClick={() => setShowIsnImport(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Have an ISN order? Import it to auto-fill this form.</p>
                  <Button variant="outline" size="sm" onClick={loadIsnOrders} disabled={isnLoading} className="border-blue-200 text-blue-700 hover:bg-blue-100">
                    {isnLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                    Import from ISN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Property Address *</Label>
              <Input id="address" placeholder="123 Main St, Austin, TX 78701" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Inspection Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspectorName">Inspector</Label>
              <Input id="inspectorName" placeholder="Inspector name" value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} />
              <p className="text-xs text-slate-400">Pre-filled from your profile. Change for a different inspector.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input id="clientName" placeholder="John & Jane Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email (optional)</Label>
                <Input id="clientEmail" type="email" placeholder="clients@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone (optional)</Label>
                <Input id="clientPhone" type="tel" placeholder="(555) 000-0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Information — collapsible optional section */}
        <Card className="border-slate-100 shadow-sm">
          <button
            type="button"
            onClick={() => setShowAgentInfo(!showAgentInfo)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div>
              <CardTitle className="text-base">Agent Information (optional)</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Buyer&apos;s agent and listing agent details</p>
            </div>
            {showAgentInfo ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </button>
          {showAgentInfo && (
            <CardContent className="space-y-5 pt-0">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Buyer&apos;s Agent</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="buyerAgentName">Name</Label>
                    <Input id="buyerAgentName" placeholder="Jane Smith" value={buyerAgentName} onChange={(e) => setBuyerAgentName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="buyerAgentEmail">Email</Label>
                      <Input id="buyerAgentEmail" type="email" placeholder="jane@realty.com" value={buyerAgentEmail} onChange={(e) => setBuyerAgentEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyerAgentPhone">Phone</Label>
                      <Input id="buyerAgentPhone" type="tel" placeholder="(555) 123-4567" value={buyerAgentPhone} onChange={(e) => setBuyerAgentPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Listing Agent</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="listingAgentName">Name</Label>
                    <Input id="listingAgentName" placeholder="Bob Johnson" value={listingAgentName} onChange={(e) => setListingAgentName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="listingAgentEmail">Email</Label>
                      <Input id="listingAgentEmail" type="email" placeholder="bob@realty.com" value={listingAgentEmail} onChange={(e) => setListingAgentEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listingAgentPhone">Phone</Label>
                      <Input id="listingAgentPhone" type="tel" placeholder="(555) 987-6543" value={listingAgentPhone} onChange={(e) => setListingAgentPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Inspection Template selector — always shown */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inspection Template</CardTitle>
            <CardDescription>Choose a standard, state-required, or custom template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* All system templates — clean flat list (only 4 total) */}
            {SYSTEM_TEMPLATES.map((st) => (
              <label key={st.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${templateMode === 'system' && selectedSystemTemplate === st.id ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <input type="radio" name="template" checked={templateMode === 'system' && selectedSystemTemplate === st.id} onChange={() => { setTemplateMode('system'); setSelectedSystemTemplate(st.id); setSelectedTemplateId(null) }} className="text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">{st.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${st.badgeColor === 'red' ? 'bg-red-100 text-red-700' : st.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{st.badge}</span>
                    {st.summaryPageRequired && <span className="text-[10px] text-amber-600 font-medium">+ Summary page</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
                </div>
              </label>
            ))}

            {/* Custom templates */}
            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium pt-1">Custom templates</p>
                {customTemplates.map((t) => (
                  <label key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${templateMode === 'custom' && selectedTemplateId === t.id ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <input type="radio" name="template" checked={templateMode === 'custom' && selectedTemplateId === t.id} onChange={() => { setTemplateMode('custom'); setSelectedTemplateId(t.id); }} className="text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-sm font-medium text-slate-700">{t.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{t.rooms.length} rooms · {t.rooms.reduce((a, r) => a + r.items.length, 0)} items</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <Link href="/dashboard/templates" className="text-xs text-blue-500 hover:text-blue-700 block mt-1">
              Browse all templates →
            </Link>
          </CardContent>
        </Card>

        {/* InterNACHI room picker — only shown when InterNACHI system template is selected */}
        {templateMode === 'system' && selectedSystemTemplate === 'internachi' && (
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Rooms to Inspect</CardTitle>
              <CardDescription>InterNACHI Standards of Practice — select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_ROOMS.map((room) => (
                  <label key={room.name} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <Checkbox checked={selectedRooms.includes(room.name)} onCheckedChange={() => toggleRoom(room.name)} />
                    <div>
                      <span className="text-sm text-slate-700">{room.name}</span>
                      <p className="text-xs text-slate-400">{room.standard}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview sections for non-InterNACHI system templates */}
        {templateMode === 'system' && selectedSystemTemplate !== 'internachi' && (() => {
          const st = SYSTEM_TEMPLATES.find((s) => s.id === selectedSystemTemplate)
          if (!st) return null
          return (
            <Card className="border-blue-100 bg-blue-50/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-blue-800">{st.name} — Sections</CardTitle>
                <CardDescription>All sections and items from this template will be included</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {st.rooms.map((r) => (
                    <div key={r.name} className="p-3 rounded-lg bg-white border border-blue-100">
                      <p className="text-sm font-medium text-slate-700">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.items.length} items</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* Preview of selected custom template rooms */}
        {templateMode === 'custom' && selectedTemplateId && (() => {
          const t = customTemplates.find((ct) => ct.id === selectedTemplateId)
          if (!t) return null
          return (
            <Card className="border-blue-100 bg-blue-50/30 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-blue-800">{t.name} — Rooms Preview</CardTitle>
                <CardDescription>All rooms and items from this template will be included</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {t.rooms.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-white border border-blue-100">
                      <p className="text-sm font-medium text-slate-700">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.items.length} items</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {!showConfirm ? (
          <Button onClick={handleCreateClick} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            Review & Create
          </Button>
        ) : (
          <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
            <CardContent className="py-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Confirm your inspection:</p>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="text-slate-400">Property:</span> {address}</p>
                <p><span className="text-slate-400">Client:</span> {clientName}</p>
                <p><span className="text-slate-400">Date:</span> {date}</p>
                <p><span className="text-slate-400">Template:</span> {selectedTemplateName}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Creating...' : 'Create Inspection'}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={loading} className="shrink-0">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
