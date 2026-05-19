import { NextResponse } from 'next/server'
import { db, profiles, inspections, agentConfigs, agentActivityLog, bookingLinks } from '@/lib/db'
import { eq, and, sql, desc } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity, hasConnector, validateCronAuth } from '@/lib/agent-runner'
import { escapeHtml } from '@/lib/email'
import { APP_URL } from '@/lib/config'
import { getRecentEmails, sendGmailReply } from '@/lib/gmail'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(request: Request) {
  const authError = validateCronAuth(request)
  if (authError) return authError

  const [marketingResults, afterHoursResults, leadQualifierResults] = await Promise.all([
    runMarketingAgent(),
    runAfterHoursAgent(),
    runLeadQualifierAgent(),
  ])

  return NextResponse.json({
    ok: true,
    marketing: marketingResults,
    afterHours: afterHoursResults,
    leadQualifier: leadQualifierResults,
  })
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

// ── After-Hours Agent ──
// Auto-replies to unread emails when the inspector is outside business hours
async function runAfterHoursAgent() {
  let replied = 0

  const configs = await db.select().from(agentConfigs).where(
    and(eq(agentConfigs.agentType, 'after_hours'), eq(agentConfigs.enabled, true))
  )

  for (const agentConfig of configs) {
    const config = agentConfig.config as Record<string, unknown>
    const userId = agentConfig.userId

    // Check if current time is outside business hours
    const now = new Date()
    const businessHoursStart = (config.businessHoursStart as string) ?? '08:00'
    const businessHoursEnd = (config.businessHoursEnd as string) ?? '18:00'
    const businessDays = (config.businessDays as number[]) ?? [1, 2, 3, 4, 5]

    const currentDay = now.getUTCDay() // 0=Sun, 1=Mon, ...
    const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`

    const isDuringBusinessHours = businessDays.includes(currentDay)
      && currentTime >= businessHoursStart
      && currentTime < businessHoursEnd

    // Only run outside business hours
    if (isDuringBusinessHours) continue

    // Verify Google is connected
    if (!(await hasConnector(userId, 'google'))) continue

    // Get profile info for the reply
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    if (!profile) continue

    const companyName = profile.companyName ?? profile.fullName ?? 'our office'
    const phone = profile.phone

    // Fetch recent unread emails (last 2 hours to avoid replying to old mail)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const emails = await getRecentEmails(userId, 20, twoHoursAgo)

    for (const email of emails) {
      // Skip emails from ourselves (avoid loops)
      if (email.from.includes(profile.email)) continue

      // Check if we already auto-replied to this thread
      const [existing] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog)
        .where(and(
          eq(agentActivityLog.userId, userId),
          eq(agentActivityLog.agentType, 'after_hours'),
          eq(agentActivityLog.action, 'auto_reply'),
          sql`${agentActivityLog.details}->>'threadId' = ${email.threadId}`,
        ))
        .limit(1)

      if (existing) continue

      // Build the auto-reply body
      let replyHtml = `<div style="font-family:sans-serif;color:#1e293b;max-width:560px">
        <p>Thanks for reaching out to <strong>${escapeHtml(companyName)}</strong>.</p>
        <p>I'm currently out of the office and will respond during business hours (${escapeHtml(businessHoursStart)} - ${escapeHtml(businessHoursEnd)}).</p>`

      if (phone) {
        replyHtml += `<p>If this is urgent, you can reach me at <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>.</p>`
      }

      // Include booking link if enabled
      if (config.canBookAppointments) {
        const [bookingLink] = await db.select().from(bookingLinks)
          .where(and(eq(bookingLinks.userId, userId), eq(bookingLinks.active, true)))
          .limit(1)

        if (bookingLink) {
          const bookUrl = `${APP_URL}/book/${bookingLink.token}`
          replyHtml += `<p>You can also <a href="${escapeHtml(bookUrl)}">book an appointment online</a> anytime.</p>`
        }
      }

      replyHtml += `<p style="color:#94a3b8;font-size:12px;margin-top:16px">This is an automated reply from ${escapeHtml(companyName)}.</p></div>`

      // Extract sender email from the "From" header (handles "Name <email>" format)
      const senderEmail = extractEmail(email.from)
      if (!senderEmail) continue

      const sent = await sendGmailReply(userId, senderEmail, email.subject, replyHtml, email.threadId)
      if (sent) {
        await logAgentActivity(userId, 'after_hours', 'auto_reply', {
          threadId: email.threadId,
          messageId: email.id,
          to: senderEmail,
          subject: email.subject,
        })
        replied++
      }
    }
  }

  console.log(`[InspectIQ] After-hours agent: ${replied} auto-replies sent`)
  return { replied }
}

// ── Lead Qualifier Agent ──
// Auto-responds to inquiry emails with pricing and requests property details
async function runLeadQualifierAgent() {
  let qualified = 0

  const configs = await db.select().from(agentConfigs).where(
    and(eq(agentConfigs.agentType, 'lead_qualifier'), eq(agentConfigs.enabled, true))
  )

  // Keywords that indicate a home inspection inquiry
  const inquiryKeywords = ['inspection', 'home inspection', 'quote', 'available', 'schedule']

  for (const agentConfig of configs) {
    const config = agentConfig.config as Record<string, unknown>
    const userId = agentConfig.userId

    if (!(config.autoRespond as boolean)) continue
    if (!(await hasConnector(userId, 'google'))) continue

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    if (!profile) continue

    // Fetch recent unread emails (last 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
    const emails = await getRecentEmails(userId, 20, fourHoursAgo)

    for (const email of emails) {
      // Skip emails from ourselves
      if (email.from.includes(profile.email)) continue

      // Check if this looks like an inspection inquiry (case-insensitive)
      const textToCheck = `${email.subject} ${email.snippet} ${email.body}`.toLowerCase()
      const isInquiry = inquiryKeywords.some(kw => textToCheck.includes(kw))
      if (!isInquiry) continue

      // Check if we already responded to this thread
      const [existing] = await db.select({ id: agentActivityLog.id }).from(agentActivityLog)
        .where(and(
          eq(agentActivityLog.userId, userId),
          eq(agentActivityLog.agentType, 'lead_qualifier'),
          eq(agentActivityLog.action, 'inquiry_reply'),
          sql`${agentActivityLog.details}->>'threadId' = ${email.threadId}`,
        ))
        .limit(1)

      if (existing) continue

      // Build pricing info for the AI prompt
      const pricingModel = (config.pricingModel as string) ?? 'flat'
      const flatRate = (config.flatRate as number) ?? 400
      const perSqftRate = (config.perSqftRate as number) ?? 0.15
      const companyName = profile.companyName ?? profile.fullName ?? 'our company'
      const phone = profile.phone ?? ''

      let pricingText = ''
      if (pricingModel === 'flat') {
        pricingText = `Our standard home inspection rate is $${flatRate}.`
      } else if (pricingModel === 'per_sqft') {
        pricingText = `Our rate is $${perSqftRate} per square foot (e.g., a 2,000 sq ft home would be $${(perSqftRate * 2000).toFixed(0)}).`
      }

      // Get booking link if available
      let bookingUrl = ''
      const [bookingLink] = await db.select().from(bookingLinks)
        .where(and(eq(bookingLinks.userId, userId), eq(bookingLinks.active, true)))
        .limit(1)
      if (bookingLink) {
        bookingUrl = `${APP_URL}/book/${bookingLink.token}`
      }

      // Use Claude to draft a professional response
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        console.error('[InspectIQ] ANTHROPIC_API_KEY not set for lead qualifier')
        continue
      }

      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey })
        const aiResponse = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `You are a professional home inspector replying to a potential client's inquiry email. Write a short, friendly, professional HTML email reply (use <p> tags, no <html> or <body> wrapper).

Company: ${companyName}
Phone: ${phone}
Pricing: ${pricingText}
${bookingUrl ? `Booking link: ${bookingUrl}` : ''}

The client's email subject: "${email.subject}"
The client's email snippet: "${email.snippet}"

Your reply should:
1. Thank them for reaching out
2. Mention the pricing
3. Ask for the property address, approximate square footage, and preferred date/time
4. ${bookingUrl ? 'Include the booking link' : 'Offer to set up a time'}
5. Sign off with the company name

Keep it under 150 words. Do NOT include a subject line — just the HTML body.`,
          }],
        })

        const replyHtml = (aiResponse.content[0] as { type: string; text: string }).text

        const senderEmail = extractEmail(email.from)
        if (!senderEmail) continue

        const sent = await sendGmailReply(userId, senderEmail, email.subject, replyHtml, email.threadId)
        if (sent) {
          await logAgentActivity(userId, 'lead_qualifier', 'inquiry_reply', {
            threadId: email.threadId,
            messageId: email.id,
            to: senderEmail,
            subject: email.subject,
            pricingModel,
          })
          qualified++
        }
      } catch (err) {
        console.error(`[InspectIQ] Lead qualifier AI failed for user ${userId}:`, err)
      }
    }
  }

  console.log(`[InspectIQ] Lead qualifier agent: ${qualified} inquiry replies sent`)
  return { qualified }
}

// Extract email address from a "Name <email>" or bare email string
function extractEmail(from: string): string | null {
  const match = from.match(/<([^>]+)>/)
  if (match) return match[1]
  // If no angle brackets, check if the whole thing looks like an email
  if (from.includes('@') && !from.includes(' ')) return from
  return null
}
