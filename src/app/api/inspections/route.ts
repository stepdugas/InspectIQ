import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections, rooms, inspectionItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { DEFAULT_ROOMS } from '@/lib/inspection-templates'
import { getProfile, hasActiveAccess } from '@/lib/auth'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const query = db.select().from(inspections).where(
    status
      ? and(eq(inspections.userId, userId), eq(inspections.status, status))
      : eq(inspections.userId, userId)
  ).orderBy(inspections.createdAt)

  const result = await query
  return NextResponse.json({ inspections: result })
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await getProfile()

  // Block expired trial / inactive subscription
  const canAccess = await hasActiveAccess()
  if (!canAccess) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { address, clientName, clientEmail, date, selectedRooms, isnOrderId } = await request.json()

  const [inspection] = await db.insert(inspections).values({
    userId,
    propertyAddress: address,
    clientName,
    clientEmail: clientEmail || null,
    inspectionDate: date,
    status: 'in_progress',
    isnOrderId: isnOrderId || null,
  }).returning()

  const templates = DEFAULT_ROOMS.filter((r) => selectedRooms.includes(r.name))
  const roomRows = await db.insert(rooms).values(
    templates.map((r, idx) => ({ inspectionId: inspection.id, name: r.name, orderIndex: idx }))
  ).returning()

  const allItems = roomRows.flatMap((roomRow) => {
    const template = DEFAULT_ROOMS.find((r) => r.name === roomRow.name)
    return (template?.items ?? []).map((itemName, idx) => ({
      roomId: roomRow.id, name: itemName, condition: 'good', orderIndex: idx,
    }))
  })

  if (allItems.length > 0) await db.insert(inspectionItems).values(allItems)

  return NextResponse.json({ id: inspection.id })
}
