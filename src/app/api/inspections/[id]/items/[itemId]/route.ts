import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspectionItems } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await params
  const body = await request.json()

  await db.update(inspectionItems).set(body).where(eq(inspectionItems.id, itemId))
  return NextResponse.json({ ok: true })
}
