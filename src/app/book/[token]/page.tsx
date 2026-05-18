'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Loader2, CheckCircle2, User, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slot {
  time: string
  available: boolean
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  return days
}

export default function BookingPage() {
  const { token } = useParams<{ token: string }>()
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirmed'>('date')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{ inspectorName: string; inspectorCompany: string } | null>(null)
  const [inspector, setInspector] = useState<{ name: string | null; company: string | null; license: string | null; phone: string | null; logo: string | null } | null>(null)

  // Form fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [notes, setNotes] = useState('')

  // Calendar state
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  const calendarDays = getCalendarDays(calYear, calMonth)

  function isDateSelectable(date: Date): boolean {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return date >= now
  }

  async function selectDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setSelectedTime(null)
    setLoadingSlots(true)
    setError(null)

    try {
      const res = await fetch(`/api/scheduling/slots?token=${token}&date=${dateStr}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to load time slots')
        setSlots([])
      } else {
        setSlots(data.slots ?? [])
        if (data.inspector) setInspector(data.inspector)
        if (data.slots?.length > 0) setStep('time')
        else setError(data.message ?? 'No available slots on this day')
      }
    } catch {
      setError('Failed to load time slots')
    } finally {
      setLoadingSlots(false)
    }
  }

  function selectTime(time: string) {
    setSelectedTime(time)
    setStep('details')
  }

  async function submitBooking() {
    if (!clientName || !propertyAddress) {
      setError('Please fill in your name and property address')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/scheduling/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, date: selectedDate, time: selectedTime,
          clientName, clientEmail, clientPhone, propertyAddress, notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Booking failed')
      } else {
        setConfirmation({ inspectorName: data.inspectorName, inspectorCompany: data.inspectorCompany })
        setStep('confirmed')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — white-labeled with inspector branding */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center gap-3">
          {inspector?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={inspector.logo} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{inspector?.company?.[0] ?? 'H'}{inspector?.company?.[1] ?? 'I'}</span>
            </div>
          )}
          <div>
            <span className="font-bold text-white">{inspector?.company ?? inspector?.name ?? 'Schedule an Inspection'}</span>
            {inspector?.license && <p className="text-xs text-slate-400">License #{inspector.license}</p>}
            {!inspector?.license && <p className="text-xs text-slate-400">Home Inspection Services</p>}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {['Date', 'Time', 'Details'].map((label, i) => {
            const stepIndex = { date: 0, time: 1, details: 2, confirmed: 3 }[step]
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium',
                  i <= stepIndex ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                )}>{i + 1}</div>
                <span className={cn('text-xs', i <= stepIndex ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
                {i < 2 && <div className="w-8 h-px bg-slate-200" />}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* Step 1: Date picker */}
        {step === 'date' && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <button aria-label="Previous month" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}>
                  <ChevronLeft className="h-5 w-5 text-slate-400 hover:text-slate-900" />
                </button>
                <span className="text-sm font-semibold text-slate-900">{MONTH_NAMES[calMonth]} {calYear}</span>
                <button aria-label="Next month" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}>
                  <ChevronRight className="h-5 w-5 text-slate-400 hover:text-slate-900" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs text-slate-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />
                  const selectable = isDateSelectable(date)
                  const dateStr = date.toISOString().split('T')[0]
                  const isSelected = selectedDate === dateStr
                  const isToday = dateStr === today.toISOString().split('T')[0]

                  return (
                    <button
                      key={dateStr}
                      onClick={() => selectable && selectDate(date)}
                      disabled={!selectable}
                      className={cn(
                        'h-9 md:h-10 rounded-lg text-sm transition-colors',
                        selectable ? 'hover:bg-blue-50 active:bg-blue-100 cursor-pointer' : 'text-slate-200 cursor-not-allowed',
                        isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : '',
                        isToday && !isSelected ? 'ring-1 ring-blue-300' : '',
                        selectable && !isSelected ? 'text-slate-900' : '',
                      )}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {loadingSlots && (
                <div className="mt-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto" />
                  <p className="text-xs text-slate-400 mt-1">Loading available times...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Time picker */}
        {step === 'time' && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <button onClick={() => setStep('date')} className="flex items-center gap-1 text-xs text-blue-600 mb-4 hover:underline">
                <ChevronLeft className="h-3 w-3" />Change date
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-900">{selectedDate}</span>
              </div>

              {slots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No available time slots on this day.</p>
                  <button onClick={() => setStep('date')} className="text-sm text-blue-600 hover:underline mt-2">Pick a different date</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => selectTime(slot.time)}
                      className={cn(
                        'py-3 px-2 rounded-lg text-sm font-medium border transition-colors',
                        selectedTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Details form */}
        {step === 'details' && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <button onClick={() => setStep('time')} className="flex items-center gap-1 text-xs text-blue-600 mb-4 hover:underline">
                <ChevronLeft className="h-3 w-3" />Change time
              </button>

              <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{selectedDate}</span>
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{selectedTime && formatTime(selectedTime)}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Your name *</Label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="John Smith" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="john@example.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(555) 123-4567" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Property address *</Label>
                  <Input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="123 Main St, Austin, TX 78701" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Notes (optional)</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything the inspector should know?" className="mt-1" />
                </div>

                <Button
                  onClick={submitBooking}
                  disabled={submitting || !clientName || !propertyAddress}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                  Confirm Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmed' && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Inspection Booked</h2>
              <p className="text-slate-500 mb-6">Your inspection has been scheduled.</p>

              <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedDate} at {selectedTime && formatTime(selectedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{propertyAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{clientName}</span>
                </div>
                {confirmation?.inspectorName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Inspector: {confirmation.inspectorName}{confirmation.inspectorCompany ? ` — ${confirmation.inspectorCompany}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 text-left bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">What happens next?</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>You'll receive a confirmation email with details</li>
                  <li>The inspector will reach out if they have any questions</li>
                  <li>A reminder will be sent 24 hours before the inspection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
