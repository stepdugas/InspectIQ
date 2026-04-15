import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections, rooms, inspectionItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId))).limit(1)

  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allRooms = await db.select().from(rooms).where(eq(rooms.inspectionId, id)).orderBy(rooms.orderIndex)

  const roomsWithItems = await Promise.all(
    allRooms.map(async (room) => {
      const items = await db.select().from(inspectionItems)
        .where(eq(inspectionItems.roomId, room.id))
        .orderBy(inspectionItems.orderIndex)
      return { ...room, items }
    })
  )

  return NextResponse.json({ inspection, rooms: roomsWithItems })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  await db.update(inspections)
    .set({ status: body.status, updatedAt: new Date() })
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))

  return NextResponse.json({ ok: true })
}
