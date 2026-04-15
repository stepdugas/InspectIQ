'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DEFAULT_ROOMS } from '@/lib/inspection-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewInspectionPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRooms, setSelectedRooms] = useState<string[]>(DEFAULT_ROOMS.map((r) => r.name))
  const [loading, setLoading] = useState(false)

  function toggleRoom(name: string) {
    setSelectedRooms((prev) => prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name])
  }

  async function handleCreate() {
    if (!address || !clientName || !date) { toast.error('Please fill in all required fields'); return }
    setLoading(true)

    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, clientName, clientEmail, date, selectedRooms }),
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
