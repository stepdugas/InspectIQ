import { NextResponse } from 'next/server'
import { db, inspections, profiles } from '@/lib/db'
import { eq, and, lte } from 'drizzle-orm'
import { sendFollowUpEmail, sendTopFindingsFollowUp } from '@/lib/email'
import { getAgentConfig, logAgentActivity, validateCronAuth } from '@/lib/agent-runner'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const now = new Date()

  const due = await db.select().from(inspections).where(
    and(
      eq(inspections.followUpStatus, 'scheduled'),
      lte(inspections.followUpScheduledFor, now)
    )
  )

  let sent = 0
  let skipped = 0

  for (const inspection of due) {
    // Check if the follow-up agent is enabled for this inspector
    const config = await getAgentConfig(inspection.userId, 'follow_up')
    if (!config) {
      // Agent disabled — mark as sent so we don't retry (atomic check)
      await db.update(inspections).set({ followUpStatus: 'sent', followUpSentAt: now })
        .where(and(eq(inspections.id, inspection.id), eq(inspections.followUpStatus, 'scheduled')))
      skipped++
      continue
    }

    if (!inspection.clientEmail) {
      await db.update(inspections).set({ followUpStatus: 'sent', followUpSentAt: now })
        .where(and(eq(inspections.id, inspection.id), eq(inspections.followUpStatus, 'scheduled')))
      skipped++
      continue
    }

    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.id, inspection.userId)).limit(1)

    const inspectorName = profile?.fullName ?? 'Your Inspector'
    const companyName = profile?.companyName ?? inspectorName
    const contentType = (config.content as string) ?? 'any_questions'

    try {
      if (contentType === 'top_findings') {
        await sendTopFindingsFollowUp(
          inspection.clientEmail,
          inspection.clientName,
          inspectorName,
          companyName,
          inspection.propertyAddress,
          inspection.id,
          profile?.phone ?? null,
          profile?.email ?? null,
        )
      } else if (contentType === 'custom' && config.customMessage) {
        await sendFollowUpEmail(
          inspection.clientEmail,
          inspection.clientName,
          inspectorName,
          companyName,
          inspection.propertyAddress,
          profile?.phone ?? null,
          profile?.email ?? null,
          config.customMessage as string,
        )
      } else {
        // Default: 'any_questions'
        await sendFollowUpEmail(
          inspection.clientEmail,
          inspection.clientName,
          inspectorName,
          companyName,
          inspection.propertyAddress,
          profile?.phone ?? null,
          profile?.email ?? null,
        )
      }

      // Atomic: only update if still 'scheduled' (prevents double-send on crash/retry)
      const [updated] = await db.update(inspections).set({ followUpStatus: 'sent', followUpSentAt: now })
        .where(and(eq(inspections.id, inspection.id), eq(inspections.followUpStatus, 'scheduled')))
        .returning()

      if (!updated) continue // Already sent by another run

      await logAgentActivity(inspection.userId, 'follow_up', 'email_sent', {
        recipient: inspection.clientEmail,
        contentType,
        propertyAddress: inspection.propertyAddress,
      }, inspection.id)

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Follow-up email failed for inspection ${inspection.id}:`, err)
    }
  }

  console.log(`[InspectIQ] Follow-up cron: ${due.length} due, ${sent} sent, ${skipped} skipped`)
  return NextResponse.json({ ok: true, due: due.length, sent, skipped })
}
