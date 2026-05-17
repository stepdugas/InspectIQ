export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db, reports, inspections, rooms, inspectionItems, profiles } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'
import { Building2, Calendar, User, CheckCircle2, AlertTriangle, AlertCircle, Download, Phone, Mail, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.shareToken, token))
    .limit(1)
  if (!report) return { title: 'Report Not Found' }

  const [inspection] = await db
    .select()
    .from(inspections)
    .where(eq(inspections.id, report.inspectionId))
    .limit(1)

  const address = inspection?.propertyAddress ?? 'Property'

  return {
    title: `Home Inspection Report — ${address}`,
    robots: { index: false },
  }
}

const conditionConfig = {
  good: { label: 'Satisfactory', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  fair: { label: 'Maintenance Needed', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  poor: { label: 'Critical', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  na: { label: 'N/A', icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-100' },
  not_inspected: { label: 'Not Inspected', icon: AlertTriangle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
}

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [report] = await db.select().from(reports).where(eq(reports.shareToken, token)).limit(1)
  if (!report) notFound()

  const [inspection] = await db.select().from(inspections).where(eq(inspections.id, report.inspectionId)).limit(1)
  if (!inspection) notFound()

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, inspection.userId)).limit(1)

  const allRooms = await db.select().from(rooms).where(eq(rooms.inspectionId, inspection.id)).orderBy(rooms.orderIndex)

  // Batch-load all items in one query instead of one per room
  const roomIds = allRooms.map((r) => r.id)
  const allItems = roomIds.length > 0
    ? await db.select().from(inspectionItems).where(inArray(inspectionItems.roomId, roomIds)).orderBy(inspectionItems.orderIndex)
    : []

  const itemsByRoomId = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const list = itemsByRoomId.get(item.roomId) ?? []
    list.push(item)
    itemsByRoomId.set(item.roomId, list)
  }

  const roomsWithItems = allRooms.map((room) => ({
    ...room,
    items: itemsByRoomId.get(room.id) ?? [],
  }))

  const totalItems = roomsWithItems.reduce((acc, r) => acc + r.items.length, 0)
  const poorCount = roomsWithItems.reduce((acc, r) => acc + r.items.filter((i) => i.condition === 'poor').length, 0)
  const fairCount = roomsWithItems.reduce((acc, r) => acc + r.items.filter((i) => i.condition === 'fair').length, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Branded header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <div>
              <span className="font-bold text-white">{profile?.companyName ?? 'InspectIQ'}</span>
              {profile?.licenseNumber && <p className="text-xs text-slate-400">License #{profile.licenseNumber}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(poorCount > 0 || fairCount > 0) && (
              <a
                href={`/report/${token}/repairs`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                Create Repair List
              </a>
            )}
            {report.pdfUrl && (
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Report header card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Home Inspection Report</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">{inspection.propertyAddress}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Prepared For</p>
              <p className="text-sm font-medium text-slate-900 flex items-center gap-1"><User className="h-3 w-3" />{inspection.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Inspection Date</p>
              <p className="text-sm font-medium text-slate-900 flex items-center gap-1"><Calendar className="h-3 w-3" />{inspection.inspectionDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Inspector</p>
              <p className="text-sm font-medium text-slate-900">{profile?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Contact</p>
              <div className="space-y-0.5">
                {profile?.phone && (
                  <p className="text-sm text-slate-700 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <a href={`tel:${profile.phone}`} className="hover:text-blue-600">{profile.phone}</a>
                  </p>
                )}
                {profile?.email && (
                  <p className="text-sm text-slate-700 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <a href={`mailto:${profile.email}`} className="hover:text-blue-600">{profile.email}</a>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">{totalItems} items inspected</span>
            {poorCount > 0 && <Badge className="bg-red-50 text-red-600 border-red-100 text-xs">{poorCount} critical</Badge>}
            {fairCount > 0 && <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-xs">{fairCount} maintenance needed</Badge>}
            {poorCount === 0 && fairCount === 0 && <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">All items satisfactory</Badge>}
          </div>
        </div>

        {/* Summary of Findings */}
        {(poorCount > 0 || fairCount > 0) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Summary of Findings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Items requiring attention, sorted by priority</p>
            </div>
            {poorCount > 0 && (
              <div className="px-6 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Critical — Immediate Action Required</span>
                </div>
                <div className="space-y-2">
                  {roomsWithItems.flatMap((room) =>
                    room.items.filter((i) => i.condition === 'poor').map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-red-50 last:border-0">
                        <div>
                          <span className="text-sm text-slate-800 font-medium">{item.name}</span>
                          <span className="text-xs text-slate-400 ml-2">· {room.name}</span>
                          {item.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{item.notes}</p>}
                        </div>
                        <Badge className="bg-red-50 text-red-600 border-red-100 text-xs shrink-0">Critical</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {fairCount > 0 && (
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Maintenance Needed — Monitor &amp; Schedule</span>
                </div>
                <div className="space-y-2">
                  {roomsWithItems.flatMap((room) =>
                    room.items.filter((i) => i.condition === 'fair').map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 py-2 border-b border-amber-50 last:border-0">
                        <div>
                          <span className="text-sm text-slate-800 font-medium">{item.name}</span>
                          <span className="text-xs text-slate-400 ml-2">· {room.name}</span>
                          {item.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{item.notes}</p>}
                        </div>
                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-xs shrink-0">Maintenance</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {roomsWithItems.map((room) => {
            const narrative = room.items.find((i) => i.aiNarrative)?.aiNarrative
            return (
              <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-3">
                  <h2 className="font-semibold text-white text-sm">{room.name}</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {room.items.filter((i) => i.condition !== 'na').map((item) => {
                    const config = conditionConfig[item.condition as keyof typeof conditionConfig] ?? conditionConfig.good
                    let photos: string[] = []
                    try { photos = JSON.parse(item.photos ?? '[]') } catch { /* malformed data */ }
                    return (
                      <div key={item.id} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">{item.name}</span>
                          <Badge className={`text-xs ${config.bg} ${config.color}`}>{config.label}</Badge>
                        </div>
                        {item.notes && <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>}
                        {photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {photos.map((url) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={url} src={url} alt="Inspection photo" className="rounded-lg object-cover w-full max-h-72" />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {narrative && (
                  <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Inspector Summary</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{narrative}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer with inspector info and branding */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-800">{profile?.companyName ?? profile?.fullName ?? 'Inspector'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />{profile.phone}
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />{profile.email}
                  </a>
                )}
                {profile?.licenseNumber && (
                  <span className="text-xs text-slate-400">License #{profile.licenseNumber}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">IQ</span>
              </div>
              <span>Powered by <a href="https://useinspectiq.com" className="font-medium hover:text-blue-600">InspectIQ</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
