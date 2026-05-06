import { NextResponse } from 'next/server'
import { db, reports, repairRequests, repairRequestItems, inspectionItems, rooms, inspections } from '@/lib/db'
import { eq, and, inArray } from 'drizzle-orm'

// GET /api/report/[token]/repairs — public, returns repair request + items + inspection details
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [report] = await db.select().from(reports)
    .where(eq(reports.shareToken, token)).limit(1)

  if (!report) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  // Get the repair request for this report
  const [repairRequest] = await db.select().from(repairRequests)
    .where(eq(repairRequests.reportId, report.id)).limit(1)

  if (!repairRequest) {
    return NextResponse.json({ exists: false })
  }

  // Fetch repair request items
  const items = await db.select().from(repairRequestItems)
    .where(eq(repairRequestItems.repairRequestId, repairRequest.id))

  // Fetch the corresponding inspection items with room info
  const inspectionItemIds = items.map((i) => i.inspectionItemId)
  const inspItems = inspectionItemIds.length > 0
    ? await db.select().from(inspectionItems)
        .where(inArray(inspectionItems.id, inspectionItemIds))
    : []

  // Fetch rooms for context (room names)
  const roomIds = [...new Set(inspItems.map((i) => i.roomId))]
  const allRooms = roomIds.length > 0
    ? await db.select().from(rooms)
        .where(inArray(rooms.id, roomIds))
    : []

  const roomMap = new Map(allRooms.map((r) => [r.id, r]))
  const inspItemMap = new Map(inspItems.map((i) => [i.id, i]))

  // Combine repair items with their inspection item details and room name
  const enrichedItems = items.map((item) => {
    const inspItem = inspItemMap.get(item.inspectionItemId)
    const room = inspItem ? roomMap.get(inspItem.roomId) : null
    return {
      ...item,
      inspectionItem: inspItem ? {
        id: inspItem.id,
        name: inspItem.name,
        condition: inspItem.condition,
        notes: inspItem.notes,
        photos: inspItem.photos,
        roomName: room?.name ?? 'Unknown',
      } : null,
    }
  })

  // Get inspection info for the property address
  const [inspection] = await db.select().from(inspections)
    .where(eq(inspections.id, report.inspectionId)).limit(1)

  return NextResponse.json({
    exists: true,
    repairRequest,
    items: enrichedItems,
    propertyAddress: inspection?.propertyAddress ?? null,
  })
}

// PATCH /api/report/[token]/repairs — public, agent updates the repair request
export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [report] = await db.select().from(reports)
    .where(eq(reports.shareToken, token)).limit(1)

  if (!report) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  const [repairRequest] = await db.select().from(repairRequests)
    .where(eq(repairRequests.reportId, report.id)).limit(1)

  if (!repairRequest) return NextResponse.json({ error: 'No repair request found' }, { status: 404 })

  if (repairRequest.status === 'submitted') {
    return NextResponse.json({ error: 'Repair list has already been submitted and cannot be modified.' }, { status: 400 })
  }

  const body = await request.json()

  // Update the repair request metadata
  const updateData: Record<string, unknown> = {}
  if (body.createdBy !== undefined) updateData.createdBy = body.createdBy
  if (body.createdByEmail !== undefined) updateData.createdByEmail = body.createdByEmail
  if (body.createdByRole !== undefined) updateData.createdByRole = body.createdByRole
  if (body.notes !== undefined) updateData.notes = body.notes

  if (Object.keys(updateData).length > 0) {
    await db.update(repairRequests).set(updateData)
      .where(eq(repairRequests.id, repairRequest.id))
  }

  // Update individual items if provided
  if (Array.isArray(body.items)) {
    for (const itemUpdate of body.items) {
      if (!itemUpdate.inspectionItemId) continue

      const itemData: Record<string, unknown> = {}
      if (itemUpdate.selected !== undefined) itemData.selected = itemUpdate.selected
      if (itemUpdate.priority !== undefined) itemData.priority = itemUpdate.priority
      if (itemUpdate.estimatedCost !== undefined) itemData.estimatedCost = itemUpdate.estimatedCost
      if (itemUpdate.agentNotes !== undefined) itemData.agentNotes = itemUpdate.agentNotes

      if (Object.keys(itemData).length > 0) {
        await db.update(repairRequestItems).set(itemData)
          .where(
            and(
              eq(repairRequestItems.repairRequestId, repairRequest.id),
              eq(repairRequestItems.inspectionItemId, itemUpdate.inspectionItemId)
            )
          )
      }
    }
  }

  // Return updated repair request
  const [updated] = await db.select().from(repairRequests)
    .where(eq(repairRequests.id, repairRequest.id)).limit(1)

  const updatedItems = await db.select().from(repairRequestItems)
    .where(eq(repairRequestItems.repairRequestId, repairRequest.id))

  return NextResponse.json({ repairRequest: updated, items: updatedItems })
}
