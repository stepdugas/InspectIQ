import { NextResponse } from 'next/server'
import { db, profiles, inspections, agentConfigs } from '@/lib/db'
import { eq, and, sql, desc } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity, hasConnector, validateCronAuth } from '@/lib/agent-runner'
import { escapeHtml } from '@/lib/email'
import { Resend } from 'resend'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const marketingResults = await runMarketingAgent()

  return NextResponse.json({ ok: true, marketing: marketingResults })
}

// ── Marketing Agent ──
// Generates a GBP post suggestion from recent completed inspections
// and emails it to the inspector for approval (until GBP API is connected)
async function runMarketingAgent() {
  let sent = 0

  // Find users with the marketing agent enabled
  const configs = await db.select().from(agentConfigs).where(
    and(eq(agentConfigs.agentType, 'marketing'), eq(agentConfigs.enabled, true))
  )

  for (const agentConfig of configs) {
    const config = agentConfig.config as Record<string, unknown>
    if (!(config.autoPost as boolean)) continue

    const frequencyDays = (config.frequencyDays as number) ?? 7

    // Check if we sent a marketing post recently
    const { agentActivityLog } = await import('@/lib/db')
    const [recentPost] = await db.select().from(agentActivityLog)
      .where(and(
        eq(agentActivityLog.userId, agentConfig.userId),
        eq(agentActivityLog.agentType, 'marketing'),
        eq(agentActivityLog.action, 'post_suggested'),
      ))
      .orderBy(desc(agentActivityLog.createdAt))
      .limit(1)

    if (recentPost) {
      const daysSinceLast = (Date.now() - new Date(recentPost.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLast < frequencyDays) continue
    }

    // Get a recent completed inspection to base the post on
    const [recentInspection] = await db.select().from(inspections)
      .where(and(
        eq(inspections.userId, agentConfig.userId),
        eq(inspections.status, 'completed'),
      ))
      .orderBy(desc(inspections.completedAt))
      .limit(1)

    if (!recentInspection) continue

    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.id, agentConfig.userId)).limit(1)
    if (!profile?.email) continue

    const anonymize = (config.anonymizeAddresses as boolean) ?? true
    const address = anonymize
      ? recentInspection.propertyAddress.replace(/^\d+\s+/, '').split(',')[0] + ' area'
      : recentInspection.propertyAddress

    // Generate a simple GBP post suggestion
    const postText = `Just completed another thorough home inspection in the ${escapeHtml(address)}. Every system checked — roof, HVAC, plumbing, electrical, foundation, and more. Helping buyers make confident decisions is what we do. 🏠\n\nNeed an inspection? Book online or call today.\n\n#HomeInspection #${escapeHtml(profile.inspectionState ?? 'TX')}RealEstate #HomeBuyers`

    try {
      const apiKey = process.env.RESEND_API_KEY; if (!apiKey) { console.error('[InspectIQ] RESEND_API_KEY not set'); continue }; const resend = new Resend(apiKey)
      await resend.emails.send({
        from: 'InspectIQ <stephanie@useinspectiq.com>',
        to: profile.email,
        subject: 'Your Marketing Agent drafted a Google Business Profile post',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">Marketing Agent</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:18px;margin:0 0 16px">Post ready for your Google Business Profile</h2>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px">
                <p style="color:#475569;line-height:1.6;margin:0;white-space:pre-line">${postText}</p>
              </div>
              <p style="color:#475569;line-height:1.6">Copy this into your Google Business Profile to boost your local SEO. Once you connect Google to InspectIQ, posts will go live automatically.</p>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
                Sent by your Marketing Agent · InspectIQ
              </p>
            </div>
          </div>
        `,
      })

      await logAgentActivity(agentConfig.userId, 'marketing', 'post_suggested', {
        postText,
        inspectionId: recentInspection.id,
      }, recentInspection.id)

      sent++
    } catch (err) {
      console.error(`[InspectIQ] Marketing agent failed for user ${agentConfig.userId}:`, err)
    }
  }

  console.log(`[InspectIQ] Marketing agent: ${sent} posts suggested`)
  return { sent }
}
