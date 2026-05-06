'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  ClipboardList,
  ChevronLeft,
  X,
  DollarSign,
} from 'lucide-react'

interface InspectionItem {
  id: string
  name: string
  condition: string | null
  notes: string | null
  photos: string
  orderIndex: number
}

interface Room {
  id: string
  name: string
  orderIndex: number
  items: InspectionItem[]
}

interface InspectionData {
  inspection: {
    id: string
    propertyAddress: string
    clientName: string
    inspectionDate: string
  }
  inspector: {
    name: string
    company: string
    licenseNumber: string | null
    phone: string | null
    email: string | null
  }
  rooms: Room[]
  pdfUrl: string | null
}

interface SelectedItem {
  itemId: string
  itemName: string
  roomName: string
  condition: string
  inspectorNotes: string | null
  priority: string
  estimatedCost: string
  agentNotes: string
}

const conditionConfig = {
  poor: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: AlertCircle },
  fair: { label: 'Maintenance Needed', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: AlertTriangle },
}

export default function RepairListPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [data, setData] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selected items keyed by item ID
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({})

  // Submitter info
  const [submitterName, setSubmitterName] = useState('')
  const [submitterEmail, setSubmitterEmail] = useState('')
  const [submitterRole, setSubmitterRole] = useState("Buyer's Agent")
  const [overallNotes, setOverallNotes] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitSummary, setSubmitSummary] = useState<{ itemCount: number; propertyAddress: string } | null>(null)

  // Photo lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/report/${token}/repairs`)
        if (!res.ok) {
          setError('Report not found')
          setLoading(false)
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError('Failed to load report')
      }
      setLoading(false)
    }
    load()
  }, [token])

  // Assign defect numbers sequentially across all rooms
  const defectNumbers = useCallback((): Record<string, string> => {
    if (!data) return {}
    const map: Record<string, string> = {}
    let count = 1
    for (const room of data.rooms) {
      for (const item of room.items) {
        map[item.id] = `D${count}`
        count++
      }
    }
    return map
  }, [data])

  function toggleItem(item: InspectionItem, roomName: string) {
    setSelectedItems((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = {
          itemId: item.id,
          itemName: item.name,
          roomName,
          condition: item.condition ?? 'fair',
          inspectorNotes: item.notes,
          priority: item.condition === 'poor' ? 'High' : 'Medium',
          estimatedCost: '',
          agentNotes: '',
        }
      }
      return next
    })
  }

  function updateItem(itemId: string, field: keyof SelectedItem, value: string) {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }))
  }

  async function handleSubmit() {
    if (Object.keys(selectedItems).length === 0) return
    if (!submitterName.trim() || !submitterEmail.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(submitterEmail)) { toast.error('Please enter a valid email'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/report/${token}/repairs/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: Object.values(selectedItems).map((s) => ({
            ...s,
            estimatedCost: s.estimatedCost ? parseFloat(s.estimatedCost) : null,
          })),
          submitter: {
            name: submitterName,
            email: submitterEmail,
            role: submitterRole,
          },
          overallNotes,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setSubmitted(true)
        setSubmitSummary(result.summary)
      } else {
        setError(result.error ?? 'Failed to submit')
      }
    } catch {
      setError('Failed to submit repair list')
    }
    setSubmitting(false)
  }

  const dNums = defectNumbers()
  const selectedCount = Object.keys(selectedItems).length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.rooms.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header company={data?.inspector.company} licenseNumber={data?.inspector.licenseNumber} pdfUrl={data?.pdfUrl} token={token} />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No repair list has been created for this inspection yet.</p>
          <p className="text-xs text-slate-400 mt-2">This inspection has no items requiring repair.</p>
        </div>
      </div>
    )
  }

  // Success state after submission
  if (submitted && submitSummary) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header company={data.inspector.company} licenseNumber={data.inspector.licenseNumber} pdfUrl={data.pdfUrl} token={token} />
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Repair List Submitted</h2>
            <p className="text-slate-500 mb-6">
              Your repair list for <span className="font-medium text-slate-700">{submitSummary.propertyAddress}</span> has been sent to the inspector.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 inline-block">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-blue-600">{submitSummary.itemCount}</span> item{submitSummary.itemCount !== 1 ? 's' : ''} selected for repair
              </p>
            </div>
            <div className="mt-8">
              <a
                href={`/report/${token}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                &larr; Back to Report
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header company={data.inspector.company} licenseNumber={data.inspector.licenseNumber} pdfUrl={data.pdfUrl} token={token} />

      {/* Photo lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Inspection photo" className="max-w-full max-h-[90vh] rounded-lg object-contain" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back link */}
        <a href={`/report/${token}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Report
        </a>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create Repair List</h1>
              <p className="text-sm text-slate-500">{data.inspection.propertyAddress}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 mb-1">Inspection Date</p>
              <p className="text-sm font-medium text-slate-900">{data.inspection.inspectionDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Inspector</p>
              <p className="text-sm font-medium text-slate-900">{data.inspector.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Client</p>
              <p className="text-sm font-medium text-slate-900">{data.inspection.clientName}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              Select the items you&apos;d like to request repairs for. You can add notes and priority for each item.
            </p>
          </div>
        </div>

        {/* Selection counter */}
        {selectedCount > 0 && (
          <div className="bg-blue-600 text-white rounded-xl px-4 py-3 mb-6 flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium">{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for repair</span>
            <a href="#submit-section" className="text-sm underline hover:no-underline">Review &amp; Submit</a>
          </div>
        )}

        {/* Room sections */}
        <div className="space-y-4">
          {data.rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 px-6 py-3">
                <h2 className="font-semibold text-white text-sm">{room.name}</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {room.items.map((item) => {
                  const config = conditionConfig[(item.condition as 'poor' | 'fair') ?? 'fair']
                  const isSelected = !!selectedItems[item.id]
                  const defectNum = dNums[item.id]
                  let photos: string[] = []
                  try { photos = JSON.parse(item.photos ?? '[]') } catch { /* ignore */ }

                  return (
                    <div key={item.id} className={`px-6 py-4 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      {/* Main row — checkbox + item info */}
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItem(item, room.name)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{defectNum}</span>
                              <span className="text-sm font-medium text-slate-900">{item.name}</span>
                            </div>
                            <Badge className={`text-xs ${config.bg} ${config.color} shrink-0`}>{config.label}</Badge>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>
                          )}
                          {photos.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {photos.map((url) => (
                                <button key={url} onClick={() => setLightboxUrl(url)} className="rounded-lg overflow-hidden border border-slate-200 hover:border-blue-300 transition-colors">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="Inspection photo" className="h-16 w-16 object-cover" />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Expanded options when selected */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-blue-100 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-slate-500 mb-1">Priority</Label>
                                  <Select
                                    value={selectedItems[item.id].priority}
                                    onValueChange={(val) => updateItem(item.id, 'priority', val as string)}
                                  >
                                    <SelectTrigger className="w-full text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="High">High</SelectItem>
                                      <SelectItem value="Medium">Medium</SelectItem>
                                      <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500 mb-1">Estimated Cost</Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      className="pl-7 text-sm"
                                      value={selectedItems[item.id].estimatedCost}
                                      onChange={(e) => updateItem(item.id, 'estimatedCost', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-500 mb-1">Agent Notes</Label>
                                <Textarea
                                  placeholder="Add your notes about this repair..."
                                  className="text-sm min-h-[60px]"
                                  value={selectedItems[item.id].agentNotes}
                                  onChange={(e) => updateItem(item.id, 'agentNotes', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit section */}
        <div id="submit-section" className="mt-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1">Name *</Label>
                <Input
                  placeholder="Your full name"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1">Email *</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1">Role</Label>
                <Select value={submitterRole} onValueChange={(val) => setSubmitterRole(val as string)}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buyer's Agent">Buyer&apos;s Agent</SelectItem>
                    <SelectItem value="Buyer">Buyer</SelectItem>
                    <SelectItem value="Listing Agent">Listing Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-xs text-slate-500 mb-1">Overall Notes</Label>
              <Textarea
                placeholder="Any additional notes or requests regarding repairs..."
                className="text-sm"
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {selectedCount === 0
                  ? 'Select items above to create your repair list'
                  : `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedCount === 0 || !submitterName.trim() || !submitterEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Submit Repair List
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IQ</span>
            </div>
            <span>Powered by <a href="https://useinspectiq.com" className="font-medium hover:text-blue-600">InspectIQ</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Shared header component matching the report page pattern
function Header({ company, licenseNumber, pdfUrl, token }: { company?: string; licenseNumber?: string | null; pdfUrl?: string | null; token: string }) {
  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <div>
            <span className="font-bold text-white">{company ?? 'InspectIQ'}</span>
            {licenseNumber && <p className="text-xs text-slate-400">License #{licenseNumber}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF
            </a>
          )}
          <a
            href={`/report/${token}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Report
          </a>
        </div>
      </div>
    </div>
  )
}
