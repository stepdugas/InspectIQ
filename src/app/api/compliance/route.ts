import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, complianceItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// GET /api/compliance — list all compliance items
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.select().from(complianceItems)
    .where(eq(complianceItems.userId, userId))
    .orderBy(complianceItems.expiresAt)

  return NextResponse.json({ items })
}

// POST /api/compliance — add a new compliance item
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.type || !body.description) {
    return NextResponse.json({ error: 'type and description are required' }, { status: 400 })
  }

  const [item] = await db.insert(complianceItems).values({
    userId,
    type: body.type,
    description: body.description,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    hoursRequired: body.hoursRequired ?? null,
    hoursCompleted: body.hoursCompleted ?? 0,
  }).returning()

  return NextResponse.json({ item })
}

// PATCH /api/compliance — update a compliance item
export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (body.description !== undefined) updateData.description = body.description
  if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
  if (body.hoursRequired !== undefined) updateData.hoursRequired = body.hoursRequired
  if (body.hoursCompleted !== undefined) updateData.hoursCompleted = body.hoursCompleted

  await db.update(complianceItems).set(updateData)
    .where(and(eq(complianceItems.id, body.id), eq(complianceItems.userId, userId)))

  return NextResponse.json({ ok: true })
}

// DELETE /api/compliance — remove a compliance item
export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  await db.delete(complianceItems)
    .where(and(eq(complianceItems.id, id), eq(complianceItems.userId, userId)))

  return NextResponse.json({ ok: true })
}
