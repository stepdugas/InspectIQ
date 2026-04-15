import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, reports, inspections, profiles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { sendReportToClient } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Get or create share token
  let [report] = await db.select().from(reports).where(
    and(eq(reports.inspectionId, id), eq(reports.userId, userId))
  ).limit(1)

  if (!report) {
    const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const [created] = await db.insert(reports).values({ inspectionId: id, userId, shareToken }).returning()
    report = created
  }

  const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1)
  if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  if (!inspection.clientEmail) return NextResponse.json({ error: 'No client email on file' }, { status: 400 })

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://useinspectiq.com'
  const shareUrl = `${appUrl}/report/${report.shareToken}`

  await sendReportToClient(
    inspection.clientEmail,
    inspection.clientName,
    profile?.fullName ?? 'Your Inspector',
    inspection.propertyAddress,
    shareUrl
  )

  return NextResponse.json({ ok: true })
}
