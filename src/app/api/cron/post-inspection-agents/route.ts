import { NextResponse } from 'next/server'
import { db, inspections, profiles, rooms, inspectionItems, reports } from '@/lib/db'
import { eq, and, lte, inArray, sql } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity, validateCronAuth } from '@/lib/agent-runner'
import { escapeHtml } from '@/lib/email'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const reviewResults = await runReviewAgent()
  const repairResults = await runRepairSummaryAgent()

  const allOk = (reviewResults.failed ?? 0) === 0 && (repairResults.failed ?? 0) === 0
  return NextResponse.json({ ok: allOk, review: reviewResults, repairSummary: repairResults })
}

// ── Review Agent ──
// Sends Google review request X days after follow-up was sent
async function runReviewAgent() {
  const now = new Date()
  let sent = 0
  let failed = 0

  // Find inspections where follow-up was sent (candidates for review request)
  // We use followUpSentAt + delay to determine when to send
  const candidates = await db.select().from(inspections).where(
    and(
      eq(inspections.followUpStatus, 'sent'),
      // Has a client email
      sql`${inspections.clientEmail} IS NOT NULL`,
      // followUpSentAt exists
      sql`${inspections.followUpSentAt} IS NOT NULL`,
    )
  )

  for (const inspection of candidates) {
    const config = await getAgentConfig(inspection.userId, 'review')
    if (!config) continue

    const delayDays = (config.delayDays as number) ?? 3
    const followUpSentAt = new Date(inspection.followUpSentAt!)
    const reviewDueAt = new Date(followUpSentAt.getTime() + delayDays * 24 * 60 * 60 * 1000)

    if (now < reviewDueAt) continue

    // Check if we already sent a review request for this inspection
    const { agentActivityLog } = await import('@/lib/db')
    const [alreadySent] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog)
      .where(and(
        eq(agentActivityLog.inspectionId, inspection.id),
        eq(agentActivityLog.agentType, 'review'),
        eq(agentActivityLog.action, 'review_requested'),
      )).limit(1)

    if (alreadySent) continue

    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.id, inspection.userId)).limit(1)

    if (!profile) continue

    const inspectorName = profile.fullName ?? 'Your Inspector'
    const companyName = profile.companyName ?? inspectorName
    const customMessage = (config.customMessage as string) ?? ''

    try {
      const { Resend } = await import('resend')
      const { getInspectorFrom } = await import('@/lib/email')
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) { console.error('[InspectIQ] RESEND_API_KEY not set'); continue }
      const resend = new Resend(apiKey)

      const reviewBody = customMessage
        ? escapeHtml(customMessage)
        : `If you had a good experience, I'd really appreciate a quick Google review. It helps other homebuyers find a trusted inspector in the area, and it only takes a minute.`

      // Google review link — uses search URL which works without a Place ID
      const reviewSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' home inspector reviews')}`

      await resend.emails.send({
        from: getInspectorFrom(inspectorName, companyName),
        to: inspection.clientEmail!,
        subject: `Would you recommend ${escapeHtml(companyName)}?`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">${escapeHtml(companyName)}</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:20px;margin:0 0 16px">Hi ${escapeHtml(inspection.clientName)},</h2>
              <p style="color:#475569;line-height:1.6">Thanks again for choosing us for your inspection at <strong>${escapeHtml(inspection.propertyAddress)}</strong>.</p>
              <p style="color:#475569;line-height:1.6">${reviewBody}</p>
              <a href="${reviewSearchUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;font-size:16px">
                Leave a Review →
              </a>
              <p style="color:#475569;line-height:1.6;margin-top:24px">Thank you,<br/><strong>${escapeHtml(inspectorName)}</strong></p>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                Sent via InspectIQ · useinspectiq.com
              </p>
            </div>
          </div>
        `,
      })

      await logAgentActivity(inspection.userId, 'review', 'review_requested', {
        recipient: inspection.clientEmail,
        propertyAddress: inspection.propertyAddress,
      }, inspection.id)

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Review request failed for inspection ${inspection.id}:`, err)
      failed++
    }
  }

  console.log(`[InspectIQ] Review agent: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}

// ── Repair Summary Agent ──
// Auto-generates a condensed repair list when a report is completed
async function runRepairSummaryAgent() {
  let generated = 0
  let failed = 0

  // Find completed inspections that don't have a repair summary yet
  const completed = await db.select().from(inspections).where(
    and(
      eq(inspections.status, 'completed'),
      sql`${inspections.completedAt} IS NOT NULL`,
    )
  )

  for (const inspection of completed) {
    const config = await getAgentConfig(inspection.userId, 'repair_summary')
    if (!config || !(config.autoGenerate as boolean)) continue

    // Check if we already generated a summary for this inspection
    const { agentActivityLog } = await import('@/lib/db')
    const [alreadyDone] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog)
      .where(and(
        eq(agentActivityLog.inspectionId, inspection.id),
        eq(agentActivityLog.agentType, 'repair_summary'),
        eq(agentActivityLog.action, 'summary_generated'),
      )).limit(1)

    if (alreadyDone) continue

    // Pull all items
    const allRooms = await db.select().from(rooms).where(eq(rooms.inspectionId, inspection.id))
    const roomIds = allRooms.map(r => r.id)
    if (roomIds.length === 0) continue

    const allItems = await db.select().from(inspectionItems).where(inArray(inspectionItems.roomId, roomIds))

    const criticalItems = allItems.filter(i => i.condition === 'poor')
    const maintenanceItems = allItems.filter(i => i.condition === 'fair')

    if (criticalItems.length === 0 && maintenanceItems.length === 0) continue

    // Build the summary using Claude
    const format = (config.format as string) ?? 'bullet_list'
    const itemsText = [...criticalItems, ...maintenanceItems].map(item => {
      const room = allRooms.find(r => r.id === item.roomId)
      return `- [${item.condition === 'poor' ? 'CRITICAL' : 'MAINTENANCE'}] ${item.name} (${room?.name ?? 'Unknown'}): ${item.notes ?? 'No notes'}`
    }).join('\n')

    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Generate a ${format === 'realtor_addendum' ? 'formal repair addendum' : format === 'detailed' ? 'detailed repair summary with estimated costs' : 'concise bullet-point repair list'} for a home inspection at ${inspection.propertyAddress}. This will be shared with the buyer's real estate agent.\n\nItems:\n${itemsText}\n\nKeep it professional and actionable. ${format === 'realtor_addendum' ? 'Format it as a formal repair request addendum.' : ''}`,
        }],
      })

      const summaryText = message.content[0].type === 'text' ? message.content[0].text : ''

      // Store the summary in the inspection record
      await db.update(inspections).set({
        summary: (inspection.summary ? inspection.summary + '\n\n---\nREPAIR SUMMARY:\n' : 'REPAIR SUMMARY:\n') + summaryText,
      }).where(eq(inspections.id, inspection.id))

      await logAgentActivity(inspection.userId, 'repair_summary', 'summary_generated', {
        propertyAddress: inspection.propertyAddress,
        criticalCount: criticalItems.length,
        maintenanceCount: maintenanceItems.length,
        format,
      }, inspection.id)

      generated++
    } catch (err) {
      console.error(`[InspectIQ] Repair summary generation failed for inspection ${inspection.id}:`, err)
      failed++
    }
  }

  console.log(`[InspectIQ] Repair summary agent: ${generated} generated, ${failed} failed`)
  return { generated, failed }
}
