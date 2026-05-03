import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, rooms, inspections } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, orderIndex } = await request.json()

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
  }

  // Verify the inspection belongs to this user
  const [inspection] = await db
    .select()
    .from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))
    .limit(1)

  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [room] = await db
    .insert(rooms)
    .values({
      inspectionId: id,
      name: name.trim(),
      orderIndex: orderIndex ?? 0,
    })
    .returning()

  console.log(`[InspectIQ] Room "${name}" created for inspection ${id}`)
  return NextResponse.json({ room })
}
