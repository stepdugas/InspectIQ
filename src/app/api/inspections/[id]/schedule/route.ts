import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// PATCH /api/inspections/[id]/schedule — update time + phone for calendar
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { scheduledTime, clientPhone, inspectionDate } = await request.json()

  await db
    .update(inspections)
    .set({
      ...(scheduledTime !== undefined && { scheduledTime }),
      ...(clientPhone !== undefined && { clientPhone }),
      ...(inspectionDate !== undefined && { inspectionDate }),
      updatedAt: new Date(),
    })
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))

  return NextResponse.json({ ok: true })
}
