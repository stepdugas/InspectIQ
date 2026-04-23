import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections, rooms, inspectionItems, customTemplates, templateRooms, templateItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { DEFAULT_ROOMS } from '@/lib/inspection-templates'
import { getProfile, hasActiveAccess } from '@/lib/auth'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const query = db.select().from(inspections).where(
    status
      ? and(eq(inspections.userId, userId), eq(inspections.status, status))
      : eq(inspections.userId, userId)
  ).orderBy(inspections.createdAt)

  const result = await query
  return NextResponse.json({ inspections: result })
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await getProfile()

  // Block expired trial / inactive subscription
  const canAccess = await hasActiveAccess()
  if (!canAccess) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { address, clientName, clientEmail, date, selectedRooms, isnOrderId, customTemplateId } = await request.json()

  const [inspection] = await db.insert(inspections).values({
    userId,
    propertyAddress: address,
    clientName,
    clientEmail: clientEmail || null,
    inspectionDate: date,
    status: 'in_progress',
    isnOrderId: isnOrderId || null,
  }).returning()

  if (customTemplateId) {
    // Use a custom template — pull rooms + items from the template tables
    const [template] = await db
      .select()
      .from(customTemplates)
      .where(and(eq(customTemplates.id, customTemplateId), eq(customTemplates.userId, userId)))

    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    const tRooms = await db
      .select()
      .from(templateRooms)
      .where(eq(templateRooms.templateId, customTemplateId))
      .orderBy(templateRooms.orderIndex)

    const roomRows = await db.insert(rooms).values(
      tRooms.map((r, idx) => ({ inspectionId: inspection.id, name: r.name, orderIndex: idx }))
    ).returning()

    const allItems = await Promise.all(
      roomRows.map(async (roomRow, idx) => {
        const items = await db
          .select()
          .from(templateItems)
          .where(eq(templateItems.roomId, tRooms[idx].id))
          .orderBy(templateItems.orderIndex)
        return items.map((item, iIdx) => ({
          roomId: roomRow.id, name: item.name, condition: 'good', orderIndex: iIdx,
        }))
      })
    )

    const flat = allItems.flat()
    if (flat.length > 0) await db.insert(inspectionItems).values(flat)
  } else {
    // Use InterNACHI default rooms
    const templates = DEFAULT_ROOMS.filter((r) => selectedRooms.includes(r.name))
    const roomRows = await db.insert(rooms).values(
      templates.map((r, idx) => ({ inspectionId: inspection.id, name: r.name, orderIndex: idx }))
    ).returning()

    const allItems = roomRows.flatMap((roomRow) => {
      const template = DEFAULT_ROOMS.find((r) => r.name === roomRow.name)
      return (template?.items ?? []).map((itemName, idx) => ({
        roomId: roomRow.id, name: itemName, condition: 'good', orderIndex: idx,
      }))
    })

    if (allItems.length > 0) await db.insert(inspectionItems).values(allItems)
  }

  return NextResponse.json({ id: inspection.id })
}
