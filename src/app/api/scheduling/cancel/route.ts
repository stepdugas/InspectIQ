import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { logAgentActivity } from '@/lib/agent-runner'

// DELETE /api/scheduling/cancel — inspector cancels a booked inspection
export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inspectionId } = await request.json()
  if (!inspectionId) return NextResponse.json({ error: 'inspectionId is required' }, { status: 400 })

  // Only allow cancelling draft inspections (booked but not started)
  const [inspection] = await db.select().from(inspections)
    .where(and(
      eq(inspections.id, inspectionId),
      eq(inspections.userId, userId),
      eq(inspections.status, 'draft'),
    )).limit(1)

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found or cannot be cancelled' }, { status: 404 })
  }

  await db.delete(inspections).where(eq(inspections.id, inspectionId))

  await logAgentActivity(userId, 'scheduling', 'booking_cancelled', {
    clientName: inspection.clientName,
    propertyAddress: inspection.propertyAddress,
    date: inspection.inspectionDate,
    time: inspection.scheduledTime,
  }, inspectionId).catch(() => {})

  return NextResponse.json({ ok: true })
}
