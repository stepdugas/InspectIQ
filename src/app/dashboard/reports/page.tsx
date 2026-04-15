'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import lazyLoad from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import PDFReport from '@/components/report/PDFReport'

const PDFViewer = lazyLoad(() => import('@react-pdf/renderer').then((m) => m.PDFViewer), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300 h-8 w-8" /></div>,
})

interface Inspection {
  id: string
  propertyAddress: string
  clientName: string
  inspectionDate: string
}

interface Room {
  id: string
  name: string
  orderIndex: number
  items: { id: string; name: string; condition: string | null; notes: string | null; aiNarrative: string | null; orderIndex: number }[]
}

interface Profile {
  id: string
  email: string
  fullName: string | null
  companyName: string | null
  licenseNumber: string | null
  phone: string | null
  logoUrl: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  trialEndsAt: Date | null
  createdAt: Date | null
}

export default function ReportsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    async function load() {
      const [inspRes, profileRes] = await Promise.all([
        fetch('/api/inspections?status=completed'),
        fetch('/api/profile'),
      ])
      const [inspData, profileData] = await Promise.all([inspRes.json(), profileRes.json()])
      setInspections(inspData.inspections ?? [])
      setProfile(profileData.profile)
      setLoading(false)
    }
    load()
  }, [])

  async function loadReport(inspection: Inspection) {
    setSelectedId(inspection.id)
    setSelectedInspection(inspection)
    const res = await fetch(`/api/inspections/${inspection.id}`)
    const data = await res.json()
    setRooms(data.rooms ?? [])
  }

  async function downloadPDF() {
    if (!selectedInspection || !profile) return
    setGeneratingPDF(true)
    try {
      const blob = await pdf(
        <PDFReport inspection={selectedInspection as never} rooms={rooms as never} profile={profile as never} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `InspectIQ_${selectedInspection.propertyAddress.replace(/[^a-z0-9]/gi, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch { toast.error('Failed to generate PDF') }
    finally { setGeneratingPDF(false) }
  }

  async function copyShareLink() {
    if (!selectedId) return
    const res = await fetch(`/api/reports/${selectedId}/share`, { method: 'POST' })
    const { shareUrl } = await res.json()
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied!')
    } catch {
      // Fallback for non-HTTPS contexts (e.g. localhost)
      const el = document.createElement('textarea')
      el.value = shareUrl
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      toast.success('Share link copied!')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Download or share completed inspection reports</p>
      </div>

      <div className="flex gap-6">
        <div className="w-72 shrink-0 space-y-2">
          {inspections.length === 0 ? (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="py-8 text-center">
                <FileText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No completed inspections yet</p>
              </CardContent>
            </Card>
          ) : inspections.map((inspection) => (
            <button
              key={inspection.id}
              onClick={() => loadReport(inspection)}
              className={`w-full text-left p-4 rounded-xl border shadow-sm transition-colors ${selectedId === inspection.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <p className="font-medium text-slate-900 text-sm leading-tight">{inspection.propertyAddress}</p>
              <p className="text-xs text-slate-400 mt-1">{inspection.clientName} · {inspection.inspectionDate}</p>
            </button>
          ))}
        </div>

        <div className="flex-1">
          {!selectedInspection ? (
            <Card className="border-slate-100 shadow-sm h-64 flex items-center justify-center">
              <CardContent className="text-center">
                <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select an inspection to preview the report</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedInspection.propertyAddress}</h2>
                  <p className="text-sm text-slate-400">{selectedInspection.clientName}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyShareLink}>
                    <Share2 className="h-4 w-4 mr-2" />Share Link
                  </Button>
                  <Button size="sm" onClick={downloadPDF} disabled={generatingPDF} className="bg-blue-600 hover:bg-blue-700">
                    {generatingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Download PDF
                  </Button>
                </div>
              </div>
              {profile && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-[700px]">
                  <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <PDFReport inspection={selectedInspection as never} rooms={rooms as never} profile={profile as never} />
                  </PDFViewer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
