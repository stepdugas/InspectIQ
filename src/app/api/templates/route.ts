import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, customTemplates, templateRooms, templateItems } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'

// GET /api/templates — list all custom templates for the current user
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await db
    .select()
    .from(customTemplates)
    .where(eq(customTemplates.userId, userId))
    .orderBy(customTemplates.createdAt)

  if (templates.length === 0) return NextResponse.json({ templates: [] })

  // Batch-load all rooms for these templates (avoids N+1)
  const templateIds = templates.map((t) => t.id)
  const allRooms = await db
    .select()
    .from(templateRooms)
    .where(inArray(templateRooms.templateId, templateIds))
    .orderBy(templateRooms.orderIndex)

  // Batch-load all items for those rooms (avoids N+1)
  const roomIds = allRooms.map((r) => r.id)
  const allItems = roomIds.length > 0
    ? await db
        .select()
        .from(templateItems)
        .where(inArray(templateItems.roomId, roomIds))
        .orderBy(templateItems.orderIndex)
    : []

  // Group items by roomId
  const itemsByRoomId = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const list = itemsByRoomId.get(item.roomId) ?? []
    list.push(item)
    itemsByRoomId.set(item.roomId, list)
  }

  // Group rooms by templateId
  const roomsByTemplateId = new Map<string, (typeof allRooms[number] & { items: typeof allItems })[]>()
  for (const room of allRooms) {
    const list = roomsByTemplateId.get(room.templateId) ?? []
    list.push({ ...room, items: itemsByRoomId.get(room.id) ?? [] })
    roomsByTemplateId.set(room.templateId, list)
  }

  const full = templates.map((t) => ({
    ...t,
    rooms: roomsByTemplateId.get(t.id) ?? [],
  }))

  return NextResponse.json({ templates: full })
}

// POST /api/templates — create a new custom template
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, rooms } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Template name is required' }, { status: 400 })

  const [template] = await db
    .insert(customTemplates)
    .values({ userId, name: name.trim(), description: description?.trim() || null })
    .returning()

  if (rooms?.length) {
    const roomRows = await db
      .insert(templateRooms)
      .values(rooms.map((r: { name: string }, idx: number) => ({
        templateId: template.id,
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

  return NextResponse.json({ id: template.id })
}
