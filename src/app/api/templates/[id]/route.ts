import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, customTemplates, templateRooms, templateItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// PUT /api/templates/[id] — replace a template's rooms + items entirely
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, description, rooms } = await request.json()

  const [existing] = await db
    .select()
    .from(customTemplates)
    .where(and(eq(customTemplates.id, id), eq(customTemplates.userId, userId)))

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update template metadata
  await db
    .update(customTemplates)
    .set({ name: name.trim(), description: description?.trim() || null, updatedAt: new Date() })
    .where(eq(customTemplates.id, id))

  // Delete old rooms (cascades to items), then re-insert new ones
  try {
    const existingRooms = await db
      .select()
      .from(templateRooms)
      .where(eq(templateRooms.templateId, id))

    for (const r of existingRooms) {
      await db.delete(templateItems).where(eq(templateItems.roomId, r.id))
    }
    await db.delete(templateRooms).where(eq(templateRooms.templateId, id))

    // Re-insert rooms + items
    if (rooms?.length) {
      const roomRows = await db
        .insert(templateRooms)
        .values(rooms.map((r: { name: string }, idx: number) => ({
          templateId: id,
          name: r.name,
          orderIndex: idx,
        })))
        .returning()

      const allItems = roomRows.flatMap((roomRow, roomIdx) => {
        const srcRoom = rooms[roomIdx] as { name: string; items: string[] }
        return (srcRoom.items ?? []).map((itemName: string, itemIdx: number) => ({
          roomId: roomRow.id,
          name: itemName,
          orderIndex: itemIdx,
        }))
      })

      if (allItems.length > 0) await db.insert(templateItems).values(allItems)
    }
  } catch (err) {
    console.error('[InspectIQ] Template update failed during room/item replacement:', err)
    return NextResponse.json({ error: 'Failed to update template rooms' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/templates/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [existing] = await db
    .select()
    .from(customTemplates)
    .where(and(eq(customTemplates.id, id), eq(customTemplates.userId, userId)))

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(customTemplates).where(eq(customTemplates.id, id))
  return NextResponse.json({ success: true })
}
