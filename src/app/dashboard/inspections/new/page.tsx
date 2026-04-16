'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DEFAULT_ROOMS } from '@/lib/inspection-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Download, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

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
  const [address, setAddress] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRooms, setSelectedRooms] = useState<string[]>(DEFAULT_ROOMS.map((r) => r.name))
  const [loading, setLoading] = useState(false)
  // ISN import state
  const [isnConnected, setIsnConnected] = useState(false)
  const [isnOrders, setIsnOrders] = useState<IsnOrder[]>([])
  const [isnLoading, setIsnLoading] = useState(false)
  const [selectedIsnOrderId, setSelectedIsnOrderId] = useState<string | null>(null)
  const [showIsnImport, setShowIsnImport] = useState(false)

  // Check if ISN is connected on mount
  useEffect(() => {
    if (!ISN_ENABLED) return
    fetch('/api/profile').then(r => r.json()).then(data => {
      setIsnConnected(!!data.profile?.isnCompanyKey)
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

  async function handleCreate() {
    if (!address || !clientName || !date) { toast.error('Please fill in all required fields'); return }
    setLoading(true)

    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, clientName, clientEmail, date, selectedRooms, isnOrderId: selectedIsnOrderId }),
    })

    if (!res.ok) { toast.error('Failed to create inspection'); setLoading(false); return }
    const { id } = await res.json()
    toast.success('Inspection created!')
    router.push(`/dashboard/inspections/${id}`)
  }

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
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">Client Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input id="clientName" placeholder="John & Jane Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email (optional)</Label>
              <Input id="clientEmail" type="email" placeholder="clients@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>

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

        <Button onClick={handleCreate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
          {loading ? 'Creating...' : 'Create Inspection'}
        </Button>
      </div>
    </div>
  )
}
