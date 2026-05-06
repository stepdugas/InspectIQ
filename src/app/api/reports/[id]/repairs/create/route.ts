import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, reports, inspections, rooms, inspectionItems, repairRequests, repairRequestItems } from '@/lib/db'
import { eq, and, inArray } from 'drizzle-orm'

// POST /api/reports/[id]/repairs/create — inspector creates a blank CRL for a report
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify the report belongs to this user
  const [report] = await db.select().from(reports)
    .where(and(eq(reports.id, id), eq(reports.userId, userId))).limit(1)

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check if a repair request already exists for this report
  const [existing] = await db.select().from(repairRequests)
    .where(eq(repairRequests.reportId, id)).limit(1)

  if (existing) {
    const existingItems = await db.select().from(repairRequestItems)
      .where(eq(repairRequestItems.repairRequestId, existing.id))

    const shareUrl = report.shareToken
      ? `${process.env.NEXT_PUBLIC_APP_URL}/report/${report.shareToken}`
      : null

    return NextResponse.json({
      repairRequest: existing,
      itemCount: existingItems.length,
      shareUrl,
    })
  }

  // Get the inspection to find its rooms and items
  const [inspection] = await db.select().from(inspections)
    .where(eq(inspections.id, report.inspectionId)).limit(1)

  if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })

  // Fetch all rooms and items for this inspection
  const allRooms = await db.select().from(rooms)
    .where(eq(rooms.inspectionId, inspection.id))

  const roomIds = allRooms.map((r) => r.id)
  const allItems = roomIds.length > 0
    ? await db.select().from(inspectionItems)
        .where(inArray(inspectionItems.roomId, roomIds))
    : []

  // Filter to only poor/fair condition items
  const repairCandidates = allItems.filter(
    (item) => item.condition === 'poor' || item.condition === 'fair'
  )

  // Create the repair request
  const [repairRequest] = await db.insert(repairRequests).values({
    reportId: id,
  }).returning()

  // Create a repair_request_item for each poor/fair inspection item (all start unselected)
  if (repairCandidates.length > 0) {
    await db.insert(repairRequestItems).values(
      repairCandidates.map((item) => ({
        repairRequestId: repairRequest.id,
        inspectionItemId: item.id,
        selected: false,
        priority: item.condition === 'poor' ? 'high' : 'medium',
      }))
    )
  }

  // Build share URL — the agent accesses the CRL via the report's share token
  const shareUrl = report.shareToken
    ? `${process.env.NEXT_PUBLIC_APP_URL}/report/${report.shareToken}`
    : null

  console.log(`[InspectIQ] CRL created for report ${id} with ${repairCandidates.length} candidate items`)

  return NextResponse.json({
    repairRequest,
    itemCount: repairCandidates.length,
    shareUrl,
  })
}
