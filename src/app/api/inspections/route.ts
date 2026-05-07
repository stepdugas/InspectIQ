import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections, rooms, inspectionItems, customTemplates, templateRooms, templateItems } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { DEFAULT_ROOMS, SYSTEM_TEMPLATES } from '@/lib/inspection-templates'
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

  const { address, clientName, clientEmail, date, selectedRooms, isnOrderId, customTemplateId, systemTemplateId, buyerAgentName, buyerAgentEmail, buyerAgentPhone, listingAgentName, listingAgentEmail, listingAgentPhone, inspectorName } = await request.json()

  // Validate required fields
  if (!address || typeof address !== 'string' || !address.trim()) {
    return NextResponse.json({ error: 'address is required and must be a non-empty string' }, { status: 400 })
  }
  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    return NextResponse.json({ error: 'clientName is required and must be a non-empty string' }, { status: 400 })
  }
  if (!date || typeof date !== 'string' || !date.trim()) {
    return NextResponse.json({ error: 'date is required and must be a non-empty string' }, { status: 400 })
  }
  // Validate email format if provided
  if (clientEmail && typeof clientEmail === 'string' && clientEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json({ error: 'clientEmail must be a valid email address' }, { status: 400 })
    }
  }

  const [inspection] = await db.insert(inspections).values({
    userId,
    propertyAddress: address,
    clientName,
    clientEmail: clientEmail || null,
    inspectionDate: date,
    status: 'in_progress',
    isnOrderId: isnOrderId || null,
    buyerAgentName: buyerAgentName || null,
    buyerAgentEmail: buyerAgentEmail || null,
    buyerAgentPhone: buyerAgentPhone || null,
    listingAgentName: listingAgentName || null,
    listingAgentEmail: listingAgentEmail || null,
    listingAgentPhone: listingAgentPhone || null,
    inspectorName: inspectorName || null,
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
  } else if (systemTemplateId && systemTemplateId !== 'internachi') {
    // Use a built-in system template (TREC 7-6, etc.)
    const systemTemplate = SYSTEM_TEMPLATES.find((st) => st.id === systemTemplateId)
    if (!systemTemplate) return NextResponse.json({ error: 'System template not found' }, { status: 404 })

    const roomRows = await db.insert(rooms).values(
      systemTemplate.rooms.map((r, idx) => ({ inspectionId: inspection.id, name: r.name, orderIndex: idx }))
    ).returning()

    const allItems = roomRows.flatMap((roomRow, idx) => {
      const templateRoom = systemTemplate.rooms[idx]
      return templateRoom.items.map((itemName, iIdx) => ({
        roomId: roomRow.id, name: itemName, condition: 'good', orderIndex: iIdx,
      }))
    })

    if (allItems.length > 0) await db.insert(inspectionItems).values(allItems)
  } else {
    // Use InterNACHI default rooms (systemTemplateId === 'internachi' or no template specified)
    const roomFilter = Array.isArray(selectedRooms) ? selectedRooms : DEFAULT_ROOMS.map((r) => r.name)
    const templates = DEFAULT_ROOMS.filter((r) => roomFilter.includes(r.name))
    if (templates.length === 0) return NextResponse.json({ error: 'At least one room is required' }, { status: 400 })
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
