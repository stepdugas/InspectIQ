import { NextResponse } from 'next/server'
import { db, bookingLinks, inspections, profiles, agentActivityLog } from '@/lib/db'
import { eq, and, sql } from 'drizzle-orm'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// POST /api/scheduling/book — public endpoint, creates an inspection from a booking
export async function POST(request: Request) {
  // Rate limit: 5 bookings per IP per 10 minutes
  const ip = getClientIp(request)
  const limit = rateLimit(`book:${ip}`, 5, 10 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts. Please try again later.' }, { status: 429 })
  }

  const body = await request.json()
  const { token, date, time, clientName, clientEmail, clientPhone, propertyAddress, notes } = body

  if (!token || !date || !time || !clientName || !propertyAddress) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Basic input validation
  if (typeof clientName !== 'string' || clientName.length > 200) {
    return NextResponse.json({ error: 'Invalid client name' }, { status: 400 })
  }
  if (typeof propertyAddress !== 'string' || propertyAddress.length > 500) {
    return NextResponse.json({ error: 'Invalid property address' }, { status: 400 })
  }
  if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Invalid time format' }, { status: 400 })
  }

  // Validate booking link
  const [link] = await db.select().from(bookingLinks)
    .where(and(eq(bookingLinks.token, token), eq(bookingLinks.active, true)))
    .limit(1)

  if (!link) {
    return NextResponse.json({ error: 'Invalid or inactive booking link' }, { status: 404 })
  }

  // Get inspector profile
  const [profile] = await db.select().from(profiles)
    .where(eq(profiles.id, link.userId)).limit(1)

  const maxPerDay = link.maxPerDay ?? 3

  try {
    // Pre-check availability BEFORE inserting to prevent race conditions
    const dayCount = await db.select({ id: inspections.id }).from(inspections)
      .where(and(eq(inspections.userId, link.userId), eq(inspections.inspectionDate, date)))

    if (dayCount.length >= maxPerDay) {
      return NextResponse.json({ error: 'This day is fully booked' }, { status: 409 })
    }

    const sameTimeCount = await db.select({ id: inspections.id }).from(inspections)
      .where(and(
        eq(inspections.userId, link.userId),
        eq(inspections.inspectionDate, date),
        eq(inspections.scheduledTime, time),
      ))

    if (sameTimeCount.length > 0) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }

    // Insert the inspection
    const [inspection] = await db.insert(inspections).values({
      userId: link.userId,
      propertyAddress,
      clientName,
      clientEmail: clientEmail ?? null,
      clientPhone: clientPhone ?? null,
      inspectionDate: date,
      scheduledTime: time,
      status: 'draft',
      summary: notes ?? null,
      inspectorName: profile?.fullName ?? null,
    }).returning()

    // Post-insert safety check — if a concurrent request snuck in, remove ours
    const postInsertSameTime = await db.select({ id: inspections.id }).from(inspections)
      .where(and(
        eq(inspections.userId, link.userId),
        eq(inspections.inspectionDate, date),
        eq(inspections.scheduledTime, time),
      ))

    if (postInsertSameTime.length > 1) {
      await db.delete(inspections).where(eq(inspections.id, inspection.id))
      return NextResponse.json({ error: 'This time slot was just booked. Please pick another.' }, { status: 409 })
    }

    // Log the booking in agent activity
    await db.insert(agentActivityLog).values({
      userId: link.userId,
      agentType: 'scheduling',
      action: 'booking_created',
      details: { clientName, propertyAddress, date, time, bookingLinkId: link.id },
      inspectionId: inspection.id,
    })

    console.log(`[InspectIQ] Booking created via link ${link.token}: ${clientName} at ${propertyAddress} on ${date} ${time}`)

    return NextResponse.json({
      ok: true,
      inspectionId: inspection.id,
      confirmed: link.autoConfirm,
      inspectorName: profile?.fullName ?? null,
      inspectorCompany: profile?.companyName ?? null,
    })
  } catch (err) {
    console.error('[InspectIQ] Booking creation failed:', err)
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 })
  }
}
