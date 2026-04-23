import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspectionItems, rooms, inspections } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await params
  const body = await request.json()

  // Single JOIN query: verify item belongs to an inspection owned by this user
  const [result] = await db
    .select({ ownerId: inspections.userId })
    .from(inspectionItems)
    .innerJoin(rooms, eq(rooms.id, inspectionItems.roomId))
    .innerJoin(inspections, eq(inspections.id, rooms.inspectionId))
    .where(eq(inspectionItems.id, itemId))
    .limit(1)

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.update(inspectionItems).set(body).where(eq(inspectionItems.id, itemId))
  return NextResponse.json({ ok: true })
}
