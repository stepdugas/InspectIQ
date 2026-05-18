import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'node:crypto'
import { db, bookingLinks } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// GET /api/scheduling/booking-links — list all booking links
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const links = await db.select().from(bookingLinks).where(eq(bookingLinks.userId, userId))

  const { APP_URL: appUrl } = await import('@/lib/config')
  const linksWithUrls = links.map(l => ({
    ...l,
    url: `${appUrl}/book/${l.token}`,
  }))

  return NextResponse.json({ links: linksWithUrls })
}

// POST /api/scheduling/booking-links — create a new booking link
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const token = randomBytes(16).toString('hex')

  const [link] = await db.insert(bookingLinks).values({
    userId,
    token,
    label: body.label ?? 'Default',
    bufferMinutes: body.bufferMinutes ?? 30,
    maxPerDay: body.maxPerDay ?? 3,
    serviceAreaMiles: body.serviceAreaMiles ?? 50,
    inspectionDurationMinutes: body.inspectionDurationMinutes ?? 180,
    autoConfirm: body.autoConfirm ?? false,
  }).returning()

  const { APP_URL: appUrl } = await import('@/lib/config')

  return NextResponse.json({
    link: { ...link, url: `${appUrl}/book/${link.token}` },
  })
}

// DELETE /api/scheduling/booking-links — delete a booking link
export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing link ID' }, { status: 400 })

  await db.delete(bookingLinks).where(
    and(eq(bookingLinks.id, id), eq(bookingLinks.userId, userId))
  )

  return NextResponse.json({ ok: true })
}
