import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { db, inspections, profiles } from '@/lib/db'
import { eq, and, lte } from 'drizzle-orm'
import { sendFollowUpEmail } from '@/lib/email'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Called daily by Vercel Cron — sends follow-up emails 48 hours after report delivery
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find inspections where follow-up is scheduled and the time has passed
  const due = await db.select().from(inspections).where(
    and(
      eq(inspections.followUpStatus, 'scheduled'),
      lte(inspections.followUpScheduledFor, now)
    )
  )

  let sent = 0

  for (const inspection of due) {
    if (!inspection.clientEmail) {
      // No client email — mark as sent so we don't retry
      await db.update(inspections).set({ followUpStatus: 'sent', followUpSentAt: now })
        .where(eq(inspections.id, inspection.id))
      continue
    }

    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.id, inspection.userId)).limit(1)

    const inspectorName = profile?.fullName ?? 'Your Inspector'
    const companyName = profile?.companyName ?? inspectorName

    try {
      await sendFollowUpEmail(
        inspection.clientEmail,
        inspection.clientName,
        inspectorName,
        companyName,
        inspection.propertyAddress,
        profile?.phone ?? null,
        profile?.email ?? null
      )

      await db.update(inspections).set({ followUpStatus: 'sent', followUpSentAt: now })
        .where(eq(inspections.id, inspection.id))

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Follow-up email failed for inspection ${inspection.id}:`, err)
    }
  }

  console.log(`[InspectIQ] Follow-up cron: ${due.length} due, ${sent} sent`)
  return NextResponse.json({ ok: true, due: due.length, sent })
}
