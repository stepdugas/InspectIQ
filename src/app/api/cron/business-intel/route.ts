import { NextResponse } from 'next/server'
import { db, profiles, inspections, realtorContacts } from '@/lib/db'
import { eq, and, gte, count, sql, desc } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity, validateCronAuth } from '@/lib/agent-runner'
import { escapeHtml } from '@/lib/email'
import { Resend } from 'resend'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon
  const dayOfMonth = now.getDate()
  let sent = 0

  // Get all users with active subscriptions or trials
  const activeUsers = await db.select().from(profiles).where(
    sql`${profiles.subscriptionStatus} IN ('active', 'trialing')`
  )

  for (const profile of activeUsers) {
    const config = await getAgentConfig(profile.id, 'business_intel')
    if (!config) continue

    const frequency = (config.frequency as string) ?? 'monthly'

    // Weekly = send on Mondays, Monthly = send on 1st of month
    if (frequency === 'weekly' && dayOfWeek !== 1) continue
    if (frequency === 'monthly' && dayOfMonth !== 1) continue

    const periodDays = frequency === 'weekly' ? 7 : 30
    const periodLabel = frequency === 'weekly' ? 'This Week' : 'This Month'
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    try {
      // Inspection stats
      const allInspections = await db.select().from(inspections)
        .where(and(eq(inspections.userId, profile.id), gte(inspections.createdAt, periodStart)))

      const completedCount = allInspections.filter(i => i.status === 'completed').length
      const totalCount = allInspections.length

      // Revenue
      const includeRevenue = (config.includeRevenue as boolean) ?? true
      let revenueHtml = ''
      if (includeRevenue) {
        const totalRevenue = allInspections.reduce((sum, i) => sum + (i.inspectionFee ?? 0), 0)
        const avgFee = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0
        revenueHtml = `
          <tr><td style="padding:8px 0;color:#475569">Revenue</td><td style="padding:8px 0;font-weight:600;text-align:right">$${(totalRevenue / 100).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#475569">Avg Fee</td><td style="padding:8px 0;font-weight:600;text-align:right">$${(avgFee / 100).toFixed(0)}</td></tr>
        `
      }

      // Top realtors
      const includeRealtors = (config.includeRealtorPipeline as boolean) ?? true
      let realtorHtml = ''
      if (includeRealtors) {
        const topRealtors = await db.select().from(realtorContacts)
          .where(eq(realtorContacts.userId, profile.id))
          .orderBy(desc(realtorContacts.totalReferrals))
          .limit(5)

        if (topRealtors.length > 0) {
          const realtorRows = topRealtors.map(r =>
            `<li style="color:#475569">${escapeHtml(r.name)} — ${r.totalReferrals} referral${(r.totalReferrals ?? 0) !== 1 ? 's' : ''}</li>`
          ).join('')
          realtorHtml = `
            <h3 style="font-size:16px;margin:24px 0 8px;color:#1e293b">Top Referring Realtors</h3>
            <ul style="margin:0;padding-left:20px;line-height:2">${realtorRows}</ul>
          `
        }
      }

      const apiKey = process.env.RESEND_API_KEY; if (!apiKey) { console.error('[InspectIQ] RESEND_API_KEY not set'); continue }; const resend = new Resend(apiKey)
      await resend.emails.send({
        from: 'InspectIQ <stephanie@useinspectiq.com>',
        to: profile.email,
        subject: `Your ${frequency} business report — InspectIQ`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">Business Intelligence Report</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:20px;margin:0 0 16px">${periodLabel}</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#475569">Inspections</td><td style="padding:8px 0;font-weight:600;text-align:right">${totalCount}</td></tr>
                <tr><td style="padding:8px 0;color:#475569">Completed</td><td style="padding:8px 0;font-weight:600;text-align:right">${completedCount}</td></tr>
                ${revenueHtml}
              </table>
              ${realtorHtml}
              ${totalCount === 0 ? '<p style="color:#94a3b8;margin-top:16px">No inspections this period. Time to reach out to some realtors?</p>' : ''}
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                Sent by your Business Intelligence Agent · InspectIQ
              </p>
            </div>
          </div>
        `,
      })

      await logAgentActivity(profile.id, 'business_intel', 'report_sent', {
        frequency,
        totalInspections: totalCount,
        completedInspections: completedCount,
      })

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Business intel report failed for user ${profile.id}:`, err)
    }
  }

  console.log(`[InspectIQ] Business intel agent: ${sent} reports sent`)
  return NextResponse.json({ ok: true, sent })
}
