import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, customTemplates, templateRooms, templateItems } from '@/lib/db'
import { eq } from 'drizzle-orm'

// GET /api/templates — list all custom templates for the current user
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await db
    .select()
    .from(customTemplates)
    .where(eq(customTemplates.userId, userId))
    .orderBy(customTemplates.createdAt)

  // Load rooms + items for each template
  const full = await Promise.all(
    templates.map(async (t) => {
      const tRooms = await db
        .select()
        .from(templateRooms)
        .where(eq(templateRooms.templateId, t.id))
        .orderBy(templateRooms.orderIndex)

      const roomsWithItems = await Promise.all(
        tRooms.map(async (r) => {
          const items = await db
            .select()
            .from(templateItems)
            .where(eq(templateItems.roomId, r.id))
            .orderBy(templateItems.orderIndex)
          return { ...r, items }
        })
      )

      return { ...t, rooms: roomsWithItems }
    })
  )

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
