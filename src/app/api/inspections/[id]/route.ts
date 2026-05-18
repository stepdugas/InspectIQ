import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, inspections, rooms, inspectionItems, reports, profiles } from '@/lib/db'
import { eq, and, inArray } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { sendReportToClient } from '@/lib/email'
import { trackRealtorReferral } from '@/lib/realtor-nurture'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId))).limit(1)

  if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allRooms = await db.select().from(rooms).where(eq(rooms.inspectionId, id)).orderBy(rooms.orderIndex)

  // Fetch all items in one query instead of one per room (N+1 fix)
  const roomIds = allRooms.map((r) => r.id)
  const allItems = roomIds.length > 0
    ? await db.select().from(inspectionItems)
        .where(inArray(inspectionItems.roomId, roomIds))
        .orderBy(inspectionItems.orderIndex)
    : []

  const itemsByRoomId = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const list = itemsByRoomId.get(item.roomId) ?? []
    list.push(item)
    itemsByRoomId.set(item.roomId, list)
  }

  const roomsWithItems = allRooms.map((room) => ({
    ...room,
    items: itemsByRoomId.get(room.id) ?? [],
  }))

  return NextResponse.json({ inspection, rooms: roomsWithItems })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Fetch current inspection to validate status transitions
  const [currentInspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId))).limit(1)
  if (!currentInspection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build update payload — only include fields that were sent
  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) {
    // Prevent re-triggering agents by blocking completed → non-completed transitions
    const allowedFromCompleted = ['completed']
    if (currentInspection.status === 'completed' && !allowedFromCompleted.includes(body.status)) {
      return NextResponse.json({ error: 'Cannot change status of a completed inspection' }, { status: 400 })
    }
    updateData.status = body.status
  }
  if (body.summary !== undefined) updateData.summary = body.summary
  if (body.buyerAgentName !== undefined) updateData.buyerAgentName = body.buyerAgentName
  if (body.buyerAgentEmail !== undefined) updateData.buyerAgentEmail = body.buyerAgentEmail
  if (body.buyerAgentPhone !== undefined) updateData.buyerAgentPhone = body.buyerAgentPhone
  if (body.listingAgentName !== undefined) updateData.listingAgentName = body.listingAgentName
  if (body.listingAgentEmail !== undefined) updateData.listingAgentEmail = body.listingAgentEmail
  if (body.listingAgentPhone !== undefined) updateData.listingAgentPhone = body.listingAgentPhone
  // Duration tracking fields
  if (body.startedAt !== undefined) updateData.startedAt = body.startedAt ? new Date(body.startedAt) : null
  if (body.completedAt !== undefined) updateData.completedAt = body.completedAt ? new Date(body.completedAt) : null

  await db.update(inspections)
    .set(updateData)
    .where(and(eq(inspections.id, id), eq(inspections.userId, userId)))

  // Auto-send report email when inspection is marked completed (non-blocking)
  if (body.status === 'completed') {
    const sendEmails = async () => {
      const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1)
      if (!inspection || (!inspection.clientEmail && !inspection.buyerAgentEmail)) return

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
      const inspectorName = profile?.fullName ?? 'Your Inspector'
      const { APP_URL: appUrl } = await import('@/lib/config')

      let [report] = await db.select().from(reports).where(
        and(eq(reports.inspectionId, id), eq(reports.userId, userId))
      ).limit(1)
      if (!report) {
        const shareToken = randomBytes(16).toString('hex')
        const [created] = await db.insert(reports).values({ inspectionId: id, userId, shareToken }).returning()
        report = created
      }
      const shareUrl = `${appUrl}/report/${report.shareToken}`

      const sends = []
      if (inspection.clientEmail) {
        sends.push(sendReportToClient(inspection.clientEmail, inspection.clientName, inspectorName, inspection.propertyAddress, shareUrl))
      }
      if (inspection.buyerAgentEmail) {
        sends.push(sendReportToClient(inspection.buyerAgentEmail, inspection.buyerAgentName ?? 'Agent', inspectorName, inspection.propertyAddress, shareUrl))
      }
      await Promise.all(sends)

      // Record delivery timestamp and schedule follow-up for 48 hours later
      const now = new Date()
      const followUpTime = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      await db.update(inspections).set({
        reportDeliveredAt: now,
        followUpStatus: 'scheduled',
        followUpScheduledFor: followUpTime,
      }).where(eq(inspections.id, id))

      console.log('[InspectIQ] Auto-sent report to client and agent, follow-up scheduled for', followUpTime.toISOString())

      // Track realtor referrals (Realtor Nurture Agent)
      if (inspection.buyerAgentName || inspection.buyerAgentEmail) {
        trackRealtorReferral(userId, inspection.buyerAgentName, inspection.buyerAgentEmail, inspection.buyerAgentPhone, id, inspection.propertyAddress)
          .catch(err => console.error('[InspectIQ] Realtor tracking failed:', err))
      }
      if (inspection.listingAgentName || inspection.listingAgentEmail) {
        trackRealtorReferral(userId, inspection.listingAgentName, inspection.listingAgentEmail, inspection.listingAgentPhone, id, inspection.propertyAddress)
          .catch(err => console.error('[InspectIQ] Realtor tracking failed:', err))
      }
    }
    // Fire and forget — don't block the response
    sendEmails().catch((err) => console.error('[InspectIQ] Auto-send report email failed:', err))
  }

  return NextResponse.json({ ok: true })
}
