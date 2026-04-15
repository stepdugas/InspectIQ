import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspectionItems } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { roomId } = await params
  const { narrative } = await request.json()

  // Store narrative on the first item of the room (used for PDF/share page)
  const items = await db.select().from(inspectionItems).where(eq(inspectionItems.roomId, roomId)).limit(1)
  if (items[0]) {
    await db.update(inspectionItems).set({ aiNarrative: narrative }).where(eq(inspectionItems.roomId, roomId))
  }

  return NextResponse.json({ ok: true })
}
