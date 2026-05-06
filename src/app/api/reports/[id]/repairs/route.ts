import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, reports, repairRequests, repairRequestItems, inspectionItems, rooms } from '@/lib/db'
import { eq, and, inArray } from 'drizzle-orm'

// GET /api/reports/[id]/repairs — returns all repair requests for a report (auth required)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify the report belongs to this user
  const [report] = await db.select().from(reports)
    .where(and(eq(reports.id, id), eq(reports.userId, userId))).limit(1)

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch all repair requests for this report
  const allRequests = await db.select().from(repairRequests)
    .where(eq(repairRequests.reportId, id))

  if (allRequests.length === 0) {
    return NextResponse.json({ repairRequests: [] })
  }

  // Fetch items for all requests in one query
  const requestIds = allRequests.map((r) => r.id)
  const allItems = await db.select().from(repairRequestItems)
    .where(inArray(repairRequestItems.repairRequestId, requestIds))

  const itemsByRequestId = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const list = itemsByRequestId.get(item.repairRequestId) ?? []
    list.push(item)
    itemsByRequestId.set(item.repairRequestId, list)
  }

  const requestsWithItems = allRequests.map((req) => ({
    ...req,
    items: itemsByRequestId.get(req.id) ?? [],
  }))

  return NextResponse.json({ repairRequests: requestsWithItems })
}
