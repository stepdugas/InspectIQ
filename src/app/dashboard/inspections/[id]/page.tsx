'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronRight, CheckCircle2, FileText, AlertCircle, AlertTriangle, DollarSign, Copy, ExternalLink, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import PhotoUploader from '@/components/inspection/PhotoUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

type ConditionRating = 'good' | 'fair' | 'poor' | 'na'

interface Item {
  id: string
  name: string
  condition: string | null
  notes: string | null
  aiNarrative: string | null
  photos: string | null
  orderIndex: number
}

interface FullRoom {
  id: string
  name: string
  orderIndex: number
  items: Item[]
  expanded: boolean
  generating: boolean
  narrative: string
}

interface Inspection {
  id: string
  propertyAddress: string
  clientName: string
  inspectionDate: string
  status: string | null
  inspectionFee: number | null
  paymentStatus: string | null
  paymentSessionId: string | null
  paymentCheckoutUrl: string | null
}

const CONDITIONS: { value: ConditionRating; label: string; color: string }[] = [
  { value: 'good', label: 'Satisfactory', color: 'text-green-600' },
  { value: 'fair', label: 'Maintenance Needed', color: 'text-amber-600' },
  { value: 'poor', label: 'Critical', color: 'text-red-600' },
  { value: 'na', label: 'N/A', color: 'text-slate-400' },
]

export default function InspectionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [roomList, setRoomList] = useState<FullRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  // Client payment state
  const [feeInput, setFeeInput] = useState('')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [generatingPayment, setGeneratingPayment] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null)

  const loadInspection = useCallback(async () => {
    const res = await fetch(`/api/inspections/${id}`)
    if (!res.ok) { router.push('/dashboard/inspections'); return }
    const data = await res.json()
    setInspection(data.inspection)
    setRoomList(data.rooms.map((r: FullRoom) => ({ ...r, expanded: true, generating: false, narrative: r.items.find((i) => i.aiNarrative)?.aiNarrative ?? '' })))
    // Pre-fill fee input and payment URL if already set
    if (data.inspection.inspectionFee) setFeeInput(String(data.inspection.inspectionFee / 100))
    if (data.inspection.paymentCheckoutUrl) setPaymentUrl(data.inspection.paymentCheckoutUrl)
    setLoading(false)
  }, [id, router])

  useEffect(() => { loadInspection() }, [loadInspection])

  // Check Stripe Connect status on mount
  useEffect(() => {
    fetch('/api/stripe/connect').then(r => r.json()).then(data => {
      setStripeConnected(data.onboarded === true)
    }).catch(() => setStripeConnected(false))
  }, [])

  async function updateItem(itemId: string, field: 'condition' | 'notes' | 'photos', value: string | null) {
    setRoomList((prev) => prev.map((r) => ({
      ...r,
      items: r.items.map((item) => item.id === itemId ? { ...item, [field]: value } : item),
    })))
    setAutoSaving(true)
    await fetch(`/api/inspections/${id}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setAutoSaving(false)
    setLastSaved(new Date())
  }

  function handlePhotosChange(itemId: string, urls: string[]) {
    updateItem(itemId, 'photos', JSON.stringify(urls))
  }

  async function generateRoomNarrative(roomId: string) {
    const room = roomList.find((r) => r.id === roomId)
    if (!room) return
    setRoomList((prev) => prev.map((r) => r.id === roomId ? { ...r, generating: true } : r))

    const res = await fetch('/api/ai/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: room.name, items: room.items }),
    })
    const { narrative, error } = await res.json()
    if (error) { toast.error('Failed to generate narrative'); setRoomList((prev) => prev.map((r) => r.id === roomId ? { ...r, generating: false } : r)); return }

    await fetch(`/api/inspections/${id}/rooms/${roomId}/narrative`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ narrative }),
    })

    setRoomList((prev) => prev.map((r) => r.id === roomId ? { ...r, narrative, generating: false } : r))
    toast.success(`${room.name} narrative generated`)
  }

  async function generateAllNarratives() {
    setGeneratingAll(true)
    for (const room of roomList) await generateRoomNarrative(room.id)
    setGeneratingAll(false)
    toast.success('All narratives generated!')
  }

  async function completeInspection() {
    setSaving(true)
    await fetch(`/api/inspections/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) })
    setSaving(false)
    toast.success('Inspection complete!')
    router.push(`/dashboard/reports`)
  }

  async function generatePaymentLink() {
    const fee = parseFloat(feeInput)
    if (isNaN(fee) || fee < 1) { toast.error('Enter a valid fee (minimum $1)'); return }
    setGeneratingPayment(true)
    try {
      const res = await fetch(`/api/inspections/${id}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeInCents: Math.round(fee * 100) }),
      })
      const data = await res.json()
      if (!res.ok) {
        // If Stripe Connect not set up, show the instructional dialog
        if (data.error === 'stripe_connect_required') {
          setShowConnectDialog(true)
          return
        }
        toast.error(data.error ?? 'Failed to create payment link')
        return
      }
      setPaymentUrl(data.paymentUrl)
      setStripeConnected(true)
      setInspection((prev) => prev ? { ...prev, paymentStatus: 'pending', inspectionFee: Math.round(fee * 100) } : prev)
      toast.success('Payment link created!')
      console.log('[InspectIQ] Payment link created successfully')
    } catch (err) {
      console.error('[InspectIQ] Payment link error:', err)
      toast.error('Failed to create payment link. Please try again.')
    } finally {
      setGeneratingPayment(false)
    }
  }

  async function startStripeConnect() {
    setConnectLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to start Stripe setup')
      }
    } catch {
      toast.error('Failed to start Stripe setup')
    } finally {
      setConnectLoading(false)
    }
  }

  const allItems = roomList.flatMap((r) => r.items)
  const criticalCount = allItems.filter((i) => i.condition === 'poor').length
  const maintenanceCount = allItems.filter((i) => i.condition === 'fair').length
  const satisfactoryCount = allItems.filter((i) => i.condition === 'good' || i.condition === null).length

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  return (
    <div className="max-w-3xl">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/inspections">
            <Button variant="ghost" size="sm" className="text-slate-500 mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{inspection?.propertyAddress}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{inspection?.clientName} · {inspection?.inspectionDate}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 pl-10 sm:pl-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generateAllNarratives} disabled={generatingAll} className="text-xs">
              {generatingAll ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
              Generate All AI
            </Button>
            <Button size="sm" onClick={completeInspection} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />Complete & Export
            </Button>
          </div>
          {/* Auto-save indicator */}
          <div className="h-4 flex items-center">
            {autoSaving ? (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-[10px] text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" />Saved
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-slate-400 text-xs uppercase tracking-wide font-medium w-full sm:w-auto">Findings</span>
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="font-semibold">{criticalCount}</span>
            <span className="text-xs text-slate-400">critical</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="font-semibold">{maintenanceCount}</span>
            <span className="text-xs text-slate-400">maintenance</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-semibold">{satisfactoryCount}</span>
            <span className="text-xs text-slate-400">satisfactory</span>
          </div>
        </div>
      </div>

      {/* Client Payment Card */}
      <div className="mb-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-800">Client Payment</span>
          {inspection?.paymentStatus === 'paid' && (
            <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">PAID</span>
          )}
          {inspection?.paymentStatus === 'pending' && (
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">AWAITING PAYMENT</span>
          )}
        </div>

        {inspection?.paymentStatus === 'paid' ? (
          <p className="text-sm text-green-600">
            Client paid <span className="font-semibold">${((inspection.inspectionFee ?? 0) / 100).toFixed(2)}</span> — payment confirmed.
          </p>
        ) : paymentUrl || inspection?.paymentSessionId ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Share this link with your client to collect payment:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={paymentUrl ?? `Stripe session: ${inspection?.paymentSessionId}`}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 truncate"
              />
              <button
                onClick={() => { navigator.clipboard.writeText(paymentUrl ?? ''); toast.success('Copied!') }}
                className="p-2 text-slate-400 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Copy className="h-4 w-4" />
              </button>
              {paymentUrl && (
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-400">Fee: <span className="font-medium text-slate-600">${((inspection?.inspectionFee ?? 0) / 100).toFixed(2)}</span></p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                placeholder="350.00"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                className="pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button size="sm" onClick={generatePaymentLink} disabled={generatingPayment} className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
              {generatingPayment ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5 mr-1.5" />}
              Generate Payment Link
            </Button>
          </div>
        )}
      </div>

      {/* Sticky room nav */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-3 pt-1 bg-slate-50">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {roomList.map((room) => {
            const poor = room.items.filter((i) => i.condition === 'poor').length
            const fair = room.items.filter((i) => i.condition === 'fair').length
            return (
              <button
                key={room.id}
                onClick={() => {
                  setRoomList((prev) => prev.map((r) => r.id === room.id ? { ...r, expanded: true } : r))
                  setTimeout(() => document.getElementById(`room-${room.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                }}
                className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm shrink-0"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: poor > 0 ? '#dc2626' : fair > 0 ? '#d97706' : '#16a34a' }}
                />
                {room.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        {roomList.map((room) => {
          const poorCount = room.items.filter((i) => i.condition === 'poor').length
          const fairCount = room.items.filter((i) => i.condition === 'fair').length
          return (
            <div key={room.id} id={`room-${room.id}`} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-16">
              <button
                onClick={() => setRoomList((prev) => prev.map((r) => r.id === room.id ? { ...r, expanded: !r.expanded } : r))}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {room.expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <span className="font-semibold text-slate-900">{room.name}</span>
                  <span className="text-xs text-slate-400">{room.items.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  {poorCount > 0 && <Badge className="bg-red-50 text-red-600 border-red-100 text-xs">{poorCount} critical</Badge>}
                  {fairCount > 0 && <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-xs">{fairCount} maintenance</Badge>}
                  {poorCount === 0 && fairCount === 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              </button>

              {room.expanded && (
                <div className="border-t border-slate-100">
                  <div className="divide-y divide-slate-50">
                    {room.items.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4">
                        {/* Item name + condition — stacks on mobile */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                          <span className="flex-1 text-sm text-slate-700 font-medium">{item.name}</span>
                          <Select value={item.condition ?? 'good'} onValueChange={(val) => updateItem(item.id, 'condition', val)}>
                            <SelectTrigger className="w-full sm:w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CONDITIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  <span className={cn('font-medium', c.color)}>{c.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Notes always visible */}
                        <Textarea
                          className="mt-2 text-xs resize-none h-14"
                          placeholder={`Notes for ${item.name}...`}
                          value={item.notes ?? ''}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        />
                        <PhotoUploader
                          inspectionId={id}
                          itemId={item.id}
                          existingPhotos={JSON.parse(item.photos ?? '[]')}
                          onPhotosChange={(urls) => handlePhotosChange(item.id, urls)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">AI Narrative</span>
                      <Button variant="ghost" size="sm" onClick={() => generateRoomNarrative(room.id)} disabled={room.generating} className="h-7 text-xs text-blue-600 hover:text-blue-700">
                        {room.generating ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generating...</> : <><Sparkles className="h-3 w-3 mr-1" />Generate</>}
                      </Button>
                    </div>
                    {room.narrative
                      ? <p className="text-xs text-slate-600 leading-relaxed">{room.narrative}</p>
                      : <p className="text-xs text-slate-400 italic">Click Generate to create an AI-written narrative for this room.</p>
                    }
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stripe Connect Setup Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Connect Your Stripe Account
            </DialogTitle>
            <DialogDescription>
              To collect payments from clients, you need to connect your Stripe account. This is a one-time setup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                <p>Click the button below to open Stripe&apos;s secure setup page.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                <p>Enter your business details and bank account info. Stripe handles everything securely — InspectIQ never sees your banking info.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                <p>Once connected, you can generate payment links and clients pay you directly. Funds deposit to your bank in 2 business days.</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500">
                InspectIQ takes a small 3% platform fee on each client payment. Stripe&apos;s standard processing fee (2.9% + 30¢) also applies. You keep the rest.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={startStripeConnect}
                disabled={connectLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {connectLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                Set Up Stripe
              </Button>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
