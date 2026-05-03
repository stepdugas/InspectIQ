import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspectionItems, rooms, inspections } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(request: Request, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { roomId } = await params
  const { name, orderIndex } = await request.json()

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
  }

  // Verify the room belongs to an inspection owned by this user
  const [result] = await db
    .select({ ownerId: inspections.userId })
    .from(rooms)
    .innerJoin(inspections, eq(inspections.id, rooms.inspectionId))
    .where(eq(rooms.id, roomId))
    .limit(1)

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [item] = await db
    .insert(inspectionItems)
    .values({
      roomId,
      name: name.trim(),
      orderIndex: orderIndex ?? 0,
      condition: 'good',
      notes: null,
      photos: '[]',
    })
    .returning()

  console.log(`[InspectIQ] Item "${name}" created in room ${roomId}`)
  return NextResponse.json({ item })
}
