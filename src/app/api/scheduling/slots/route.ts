import { NextResponse } from 'next/server'
import { db, bookingLinks, availabilityRules, inspections, profiles } from '@/lib/db'
import { eq, and, gte, lte } from 'drizzle-orm'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// GET /api/scheduling/slots?token=xxx&date=2026-05-20
// Public endpoint — returns available time slots for a booking link on a given date
export async function GET(request: Request) {
  // Rate limit: 30 slot lookups per IP per minute
  const ip = getClientIp(request)
  const limit = rateLimit(`slots:${ip}`, 30, 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const dateStr = searchParams.get('date') // YYYY-MM-DD

  if (!token || !dateStr) {
    return NextResponse.json({ error: 'token and date are required' }, { status: 400 })
  }

  // Validate date format
  const date = new Date(dateStr + 'T00:00:00')
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  // Don't allow booking in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) {
    return NextResponse.json({ slots: [] })
  }

  // Look up the booking link
  const [link] = await db.select().from(bookingLinks)
    .where(and(eq(bookingLinks.token, token), eq(bookingLinks.active, true)))
    .limit(1)

  if (!link) {
    return NextResponse.json({ error: 'Invalid or inactive booking link' }, { status: 404 })
  }

  const dayOfWeek = date.getDay() // 0=Sun

  // Get availability for this day
  const [rule] = await db.select().from(availabilityRules)
    .where(and(
      eq(availabilityRules.userId, link.userId),
      eq(availabilityRules.dayOfWeek, dayOfWeek),
    ))
    .limit(1)

  if (!rule || !rule.enabled) {
    return NextResponse.json({ slots: [], message: 'Not available on this day' })
  }

  // Get existing inspections on this date to find conflicts
  const existingInspections = await db.select({
    scheduledTime: inspections.scheduledTime,
    inspectionDate: inspections.inspectionDate,
  }).from(inspections).where(
    and(
      eq(inspections.userId, link.userId),
      eq(inspections.inspectionDate, dateStr),
    )
  )

  const duration = link.inspectionDurationMinutes ?? 180
  const buffer = link.bufferMinutes ?? 30
  const maxPerDay = link.maxPerDay ?? 3

  // Check if already at max for the day
  if (existingInspections.length >= maxPerDay) {
    return NextResponse.json({ slots: [], message: 'Fully booked on this day' })
  }

  // Parse busy times from existing inspections
  const busySlots = existingInspections
    .filter(i => i.scheduledTime)
    .map(i => {
      const [hours, minutes] = (i.scheduledTime as string).split(':').map(Number)
      const startMin = hours * 60 + minutes
      return { start: startMin, end: startMin + duration + buffer }
    })
    .sort((a, b) => a.start - b.start)

  // Generate available slots in 30-minute increments
  const [startH, startM] = rule.startTime.split(':').map(Number)
  const [endH, endM] = rule.endTime.split(':').map(Number)
  const dayStart = startH * 60 + startM
  const dayEnd = endH * 60 + endM

  const slots: { time: string; available: boolean }[] = []

  for (let t = dayStart; t + duration <= dayEnd; t += 30) {
    const slotEnd = t + duration

    // Check if this slot conflicts with any existing inspection
    const conflict = busySlots.some(busy =>
      (t < busy.end && slotEnd > busy.start) // overlap check
    )

    if (!conflict) {
      const hours = Math.floor(t / 60)
      const mins = t % 60
      slots.push({
        time: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
        available: true,
      })
    }
  }

  // Fetch inspector profile for white-labeling
  const [profile] = await db.select({
    fullName: profiles.fullName,
    companyName: profiles.companyName,
    licenseNumber: profiles.licenseNumber,
    phone: profiles.phone,
    logoUrl: profiles.logoUrl,
  }).from(profiles).where(eq(profiles.id, link.userId)).limit(1)

  return NextResponse.json({
    slots,
    date: dateStr,
    duration,
    remaining: maxPerDay - existingInspections.length,
    inspector: profile ? {
      name: profile.fullName,
      company: profile.companyName,
      license: profile.licenseNumber,
      phone: profile.phone,
      logo: profile.logoUrl,
    } : null,
  })
}
