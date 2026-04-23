import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspectionItems, rooms, inspections } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { roomId } = await params
  const { narrative } = await request.json()

  // Single JOIN query: verify room belongs to an inspection owned by this user
  const [result] = await db
    .select({ ownerId: inspections.userId })
    .from(rooms)
    .innerJoin(inspections, eq(inspections.id, rooms.inspectionId))
    .where(eq(rooms.id, roomId))
    .limit(1)

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Update narrative on all items in the room (used for PDF/share page)
  await db.update(inspectionItems).set({ aiNarrative: narrative }).where(eq(inspectionItems.roomId, roomId))

  return NextResponse.json({ ok: true })
}
