import { NextResponse } from 'next/server'
import { db, complianceItems, profiles } from '@/lib/db'
import { eq, and, lte, sql, inArray } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity, validateCronAuth } from '@/lib/agent-runner'
import { escapeHtml } from '@/lib/email'
import { Resend } from 'resend'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const now = new Date()
  let sent = 0

  // Find all compliance items with expiration dates
  const items = await db.select().from(complianceItems).where(
    sql`${complianceItems.expiresAt} IS NOT NULL`
  )

  if (items.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Batch-fetch all profiles to avoid N+1
  const userIds = [...new Set(items.map(i => i.userId))]
  const allProfiles = await db.select().from(profiles).where(inArray(profiles.id, userIds))
  const profilesById = new Map(allProfiles.map(p => [p.id, p]))

  for (const item of items) {
    const config = await getAgentConfig(item.userId, 'compliance')
    if (!config) continue

    const expiresAt = new Date(item.expiresAt!)
    const daysUntilExpiry = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const reminderDays = (config.reminderDays as number[]) ?? [30, 14, 7, 1]
    if (!reminderDays.includes(daysUntilExpiry)) continue

    const remindersSent = item.remindersSent ?? 0
    const expectedReminders = reminderDays.filter(d => d >= daysUntilExpiry).length
    if (remindersSent >= expectedReminders) continue

    const profile = profilesById.get(item.userId)
    if (!profile?.email) continue

    try {
      const apiKey = process.env.RESEND_API_KEY; if (!apiKey) { console.error('[InspectIQ] RESEND_API_KEY not set'); continue }; const resend = new Resend(apiKey)
      const urgency = daysUntilExpiry <= 1 ? 'URGENT: ' : daysUntilExpiry <= 7 ? 'Reminder: ' : ''

      await resend.emails.send({
        from: 'InspectIQ <stephanie@useinspectiq.com>',
        to: profile.email,
        subject: `${urgency}${item.description} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">Compliance Reminder</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:20px;margin:0 0 16px">${daysUntilExpiry <= 1 ? 'Action Required' : 'Upcoming Deadline'}</h2>
              <p style="color:#475569;line-height:1.6"><strong>${escapeHtml(item.description)}</strong> expires in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</strong> (${expiresAt.toLocaleDateString()}).</p>
              ${item.type === 'ce_credits' && item.hoursRequired ? `<p style="color:#475569;line-height:1.6">CE Progress: <strong>${item.hoursCompleted ?? 0}/${item.hoursRequired} hours</strong> completed.</p>` : ''}
              <p style="color:#475569;line-height:1.6">Take care of this soon to keep your credentials current.</p>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                Sent by your Compliance Agent · InspectIQ
              </p>
            </div>
          </div>
        `,
      })

      await db.update(complianceItems).set({
        remindersSent: remindersSent + 1,
        lastReminderAt: now,
      }).where(eq(complianceItems.id, item.id))

      await logAgentActivity(item.userId, 'compliance', 'reminder_sent', {
        description: item.description,
        daysUntilExpiry,
        type: item.type,
      })

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Compliance reminder failed for item ${item.id}:`, err)
    }
  }

  console.log(`[InspectIQ] Compliance agent: ${sent} reminders sent`)
  return NextResponse.json({ ok: true, sent })
}
