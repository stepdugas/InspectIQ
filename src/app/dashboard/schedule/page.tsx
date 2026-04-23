'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import Link from 'next/link'
import { Loader2, X, Phone, Clock, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface InspectionEvent {
  id: string
  propertyAddress: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  inspectionDate: string
  scheduledTime: string | null
  status: string | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
}

export default function SchedulePage() {
  const [inspections, setInspections] = useState<InspectionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<InspectionEvent | null>(null)
  const [editTime, setEditTime] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    fetch('/api/inspections')
      .then((r) => r.json())
      .then((data) => {
        setInspections(data.inspections ?? [])
        setLoading(false)
      })
  }, [])

  const events: EventInput[] = inspections.map((insp) => {
    // Build ISO datetime for FullCalendar — date + optional time
    const dateStr = insp.inspectionDate // YYYY-MM-DD
    const start = insp.scheduledTime ? `${dateStr}T${insp.scheduledTime}` : dateStr

    return {
      id: insp.id,
      title: `${insp.clientName} — ${insp.propertyAddress}`,
      start,
      // If no time, mark as all-day
      allDay: !insp.scheduledTime,
      backgroundColor: STATUS_COLORS[insp.status ?? 'draft'] ?? '#94a3b8',
      borderColor: 'transparent',
      textColor: '#ffffff',
      extendedProps: insp,
    }
  })

  function handleEventClick(info: EventClickArg) {
    const insp = info.event.extendedProps as InspectionEvent
    setSelected(insp)
    setEditTime(insp.scheduledTime ?? '')
    setEditPhone(insp.clientPhone ?? '')
  }

  function handleDateClick(info: DateClickArg) {
    // Clicking a day navigates to new inspection with date pre-filled
    const date = info.dateStr
    window.location.href = `/dashboard/inspections/new?date=${date}`
  }

  async function saveSchedule() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/inspections/${selected.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledTime: editTime || null, clientPhone: editPhone || null }),
      })
      if (!res.ok) { toast.error('Failed to save'); return }
      // Update local state
      setInspections((prev) =>
        prev.map((i) => i.id === selected.id ? { ...i, scheduledTime: editTime || null, clientPhone: editPhone || null } : i)
      )
      toast.success('Schedule updated!')
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="text-slate-500 text-sm mt-0.5">View your inspections by date. Click any inspection to set time and client phone. Click a day to schedule a new inspection.</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
        <span className="text-slate-400 ml-2">Click a day to add a new inspection</span>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 fc-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          nowIndicator
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
        />
      </div>

      {/* Inspection detail sidebar/modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-900">{selected.clientName}</p>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selected.propertyAddress}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />Inspection Time</Label>
                <Input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  placeholder="09:00"
                />
                <p className="text-xs text-slate-400">Leave blank to show as all-day event</p>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />Client Phone</Label>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={saveSchedule} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
              <Link href={`/dashboard/inspections/${selected.id}`}>
                <Button variant="outline" className="flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4" />Open
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FullCalendar style overrides */}
      <style>{`
        .fc-wrapper .fc-button { background: white; border-color: #e2e8f0; color: #475569; font-size: 0.8rem; font-weight: 500; padding: 0.3rem 0.75rem; }
        .fc-wrapper .fc-button:hover { background: #f8fafc; border-color: #cbd5e1; }
        .fc-wrapper .fc-button-active, .fc-wrapper .fc-button-primary:not(:disabled).fc-button-active { background: #3b82f6; border-color: #3b82f6; color: white; }
        .fc-wrapper .fc-today-button { background: #3b82f6; border-color: #3b82f6; color: white; }
        .fc-wrapper .fc-event { border-radius: 4px; padding: 1px 4px; font-size: 0.75rem; cursor: pointer; }
        .fc-wrapper .fc-daygrid-day-number { color: #64748b; font-size: 0.8rem; }
        .fc-wrapper .fc-col-header-cell-cushion { color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .fc-wrapper .fc-daygrid-day.fc-day-today { background: #eff6ff; }
      `}</style>
    </div>
  )
}
