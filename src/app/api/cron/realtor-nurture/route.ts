import { NextResponse } from 'next/server'
import { db, inspections, realtorContacts, agentActivityLog, profiles } from '@/lib/db'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { validateCronAuth, getAgentConfig, logAgentActivity } from '@/lib/agent-runner'
import { escapeHtml, getInspectorFrom } from '@/lib/email'
import { Resend } from 'resend'

export const maxDuration = 60

export async function GET(request: Request) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })
  const authError = validateCronAuth(request)
  if (authError) return authError

  const now = new Date()
  let thankYouSent = 0
  let thankYouSkipped = 0
  let alertsSent = 0
  let alertsSkipped = 0

  // ─── Part A: Catch-up Thank-You Emails ───────────────────────────
  // Find inspections completed in the last 24 hours that have a buyer agent email.
  // The inline trackRealtorReferral() handles most cases at completion time,
  // but this cron catches any that were missed (e.g., transient failures).
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const recentlyCompleted = await db.select().from(inspections).where(
    and(
      eq(inspections.status, 'completed'),
      gte(inspections.completedAt, twentyFourHoursAgo),
      sql`${inspections.buyerAgentEmail} IS NOT NULL`,
    )
  )

  for (const inspection of recentlyCompleted) {
    try {
      const config = await getAgentConfig(inspection.userId, 'realtor_nurture')
      if (!config || !(config.autoThankYou as boolean)) {
        thankYouSkipped++
        continue
      }

      if (!inspection.buyerAgentEmail) {
        thankYouSkipped++
        continue
      }

      // Check if we already sent a thank-you for this inspection (avoid duplicates)
      const [alreadySent] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog).where(
        and(
          eq(agentActivityLog.userId, inspection.userId),
          eq(agentActivityLog.agentType, 'realtor_nurture'),
          eq(agentActivityLog.action, 'thank_you_sent'),
          eq(agentActivityLog.inspectionId, inspection.id),
        )
      ).limit(1)

      if (alreadySent) {
        thankYouSkipped++
        continue
      }

      // Look up the realtor contact for stats
      const [contact] = await db.select().from(realtorContacts).where(
        and(
          eq(realtorContacts.userId, inspection.userId),
          eq(realtorContacts.email, inspection.buyerAgentEmail),
        )
      ).limit(1)

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, inspection.userId)).limit(1)
      if (!profile) {
        thankYouSkipped++
        continue
      }

      const inspectorName = profile.fullName ?? 'Your Inspector'
      const companyName = profile.companyName ?? inspectorName
      const realtorName = inspection.buyerAgentName ?? 'there'
      const firstName = realtorName.split(' ')[0]
      const totalReferrals = contact?.totalReferrals ?? 1
      const includeStats = (config.includeStats as boolean) ?? true

      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: getInspectorFrom(inspectorName, companyName),
        to: inspection.buyerAgentEmail,
        subject: `Thanks for the referral, ${escapeHtml(firstName)}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">${escapeHtml(companyName)}</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:20px;margin:0 0 16px">Hi ${escapeHtml(firstName)},</h2>
              <p style="color:#475569;line-height:1.6">Just wanted to say thanks for the referral at <strong>${escapeHtml(inspection.propertyAddress)}</strong>. The inspection went smoothly and the report is on its way to your client.</p>
              ${includeStats && totalReferrals > 1 ? `<p style="color:#475569;line-height:1.6">That's <strong>${totalReferrals} inspections</strong> we've done together now. I really appreciate your trust.</p>` : ''}
              <p style="color:#475569;line-height:1.6">As always, feel free to send your buyers my way anytime. I'll make sure they're taken care of.</p>
              <p style="color:#475569;line-height:1.6;margin-top:8px">Best,<br/><strong>${escapeHtml(inspectorName)}</strong></p>
              ${profile.phone ? `<p style="color:#94a3b8;font-size:12px">${escapeHtml(profile.phone)}</p>` : ''}
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                Powered by InspectIQ
              </p>
            </div>
          </div>
        `,
      })

      await logAgentActivity(inspection.userId, 'realtor_nurture', 'thank_you_sent', {
        realtorName,
        realtorEmail: inspection.buyerAgentEmail,
        propertyAddress: inspection.propertyAddress,
      }, inspection.id)

      thankYouSent++
    } catch (err) {
      console.error(`[InspectIQ] Realtor thank-you cron failed for inspection ${inspection.id}:`, err)
    }
  }

  // ─── Part B: Inactive Realtor Alerts ─────────────────────────────
  // Find realtor contacts whose lastReferralAt exceeds the configured inactiveAlertDays.
  // Send an alert TO THE INSPECTOR (not the realtor) suggesting they reach out.

  // Get all distinct user IDs that have realtor contacts
  const usersWithContacts = await db.selectDistinct({ userId: realtorContacts.userId }).from(realtorContacts)

  for (const { userId } of usersWithContacts) {
    try {
      const config = await getAgentConfig(userId, 'realtor_nurture')
      if (!config) continue

      const inactiveAlertDays = (config.inactiveAlertDays as number) ?? 60
      const cutoffDate = new Date(now.getTime() - inactiveAlertDays * 24 * 60 * 60 * 1000)

      // Find realtors who haven't referred in longer than the threshold
      const inactiveRealtors = await db.select().from(realtorContacts).where(
        and(
          eq(realtorContacts.userId, userId),
          lte(realtorContacts.lastReferralAt, cutoffDate),
        )
      )

      if (inactiveRealtors.length === 0) continue

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
      if (!profile || !profile.email) continue

      for (const realtor of inactiveRealtors) {
        if (!realtor.lastReferralAt) continue

        // Check if we already sent an inactive alert for this realtor (one alert per inactive period)
        const [alreadyAlerted] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog).where(
          and(
            eq(agentActivityLog.userId, userId),
            eq(agentActivityLog.agentType, 'realtor_nurture'),
            eq(agentActivityLog.action, 'inactive_alert_sent'),
            // Filter by this specific realtor to avoid cross-realtor dedup
            sql`${agentActivityLog.details}->>'realtorEmail' = ${realtor.email}`,
            // Only check for alerts sent after the last referral — if they referred again and went
            // inactive again, we should alert again
            gte(agentActivityLog.createdAt, realtor.lastReferralAt!),
          )
        ).limit(1)

        if (alreadyAlerted) {
          alertsSkipped++
          continue
        }

        const daysSinceLastReferral = Math.round(
          (now.getTime() - new Date(realtor.lastReferralAt!).getTime()) / (1000 * 60 * 60 * 24)
        )

        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: 'InspectIQ <stephanie@useinspectiq.com>',
          to: profile.email,
          subject: `${escapeHtml(realtor.name)} hasn't referred in ${daysSinceLastReferral} days`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
              <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
                <h1 style="color:#60a5fa;font-size:20px;margin:0">Realtor Nurture Agent</h1>
              </div>
              <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
                <h2 style="font-size:20px;margin:0 0 16px">Inactive Realtor Alert</h2>
                <p style="color:#475569;line-height:1.6"><strong>${escapeHtml(realtor.name)}</strong>${realtor.company ? ` at ${escapeHtml(realtor.company)}` : ''} hasn't referred an inspection in <strong>${daysSinceLastReferral} days</strong>.</p>
                <p style="color:#475569;line-height:1.6">They previously referred <strong>${realtor.totalReferrals ?? 0} inspection${(realtor.totalReferrals ?? 0) === 1 ? '' : 's'}</strong> to you. Consider reaching out to stay top of mind.</p>
                <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0">
                  <p style="color:#334155;margin:0;font-size:14px"><strong>Contact info:</strong></p>
                  ${realtor.email ? `<p style="color:#475569;margin:4px 0 0;font-size:14px">Email: <a href="mailto:${escapeHtml(realtor.email)}" style="color:#2563eb">${escapeHtml(realtor.email)}</a></p>` : ''}
                  ${realtor.phone ? `<p style="color:#475569;margin:4px 0 0;font-size:14px">Phone: <a href="tel:${escapeHtml(realtor.phone)}" style="color:#2563eb">${escapeHtml(realtor.phone)}</a></p>` : ''}
                </div>
                <p style="color:#475569;line-height:1.6;font-size:14px">A quick coffee, a handwritten note, or even a text can re-activate a referral relationship.</p>
                <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                  Powered by InspectIQ Realtor Nurture Agent
                </p>
              </div>
            </div>
          `,
        })

        await logAgentActivity(userId, 'realtor_nurture', 'inactive_alert_sent', {
          realtorName: realtor.name,
          realtorEmail: realtor.email,
          daysSinceLastReferral,
          totalReferrals: realtor.totalReferrals,
        })

        alertsSent++
      }
    } catch (err) {
      console.error(`[InspectIQ] Inactive realtor alert failed for user ${userId}:`, err)
    }
  }

  console.log(`[InspectIQ] Realtor nurture cron: thank-you ${thankYouSent} sent / ${thankYouSkipped} skipped, alerts ${alertsSent} sent / ${alertsSkipped} skipped`)
  return NextResponse.json({
    ok: true,
    thankYou: { sent: thankYouSent, skipped: thankYouSkipped },
    inactiveAlerts: { sent: alertsSent, skipped: alertsSkipped },
  })
}
