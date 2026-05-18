import { db, realtorContacts, profiles } from '@/lib/db'
import { eq, and, gte, sql } from 'drizzle-orm'
import { getAgentConfig, logAgentActivity } from '@/lib/agent-runner'
import { escapeHtml, getInspectorFrom } from '@/lib/email'
import { Resend } from 'resend'

// Track a realtor referral and optionally send a thank-you email
export async function trackRealtorReferral(
  userId: string,
  realtorName: string | null,
  realtorEmail: string | null,
  realtorPhone: string | null,
  inspectionId: string,
  propertyAddress: string,
) {
  if (!realtorName && !realtorEmail) return

  const config = await getAgentConfig(userId, 'realtor_nurture')
  if (!config) return

  const name = realtorName ?? 'Unknown Agent'
  const now = new Date()

  // Find or create the realtor contact
  // Match by email first (unique identifier), fall back to name only if no email provided
  // and the existing record also has no email (prevents merging different realtors with same name)
  let [contact] = realtorEmail
    ? await db.select().from(realtorContacts)
        .where(and(eq(realtorContacts.userId, userId), eq(realtorContacts.email, realtorEmail)))
        .limit(1)
    : await db.select().from(realtorContacts)
        .where(and(
          eq(realtorContacts.userId, userId),
          eq(realtorContacts.name, name),
          sql`${realtorContacts.email} IS NULL`
        ))
        .limit(1)

  if (contact) {
    await db.update(realtorContacts).set({
      lastReferralAt: now,
      totalReferrals: (contact.totalReferrals ?? 0) + 1,
      phone: realtorPhone ?? contact.phone,
      name: realtorName ?? contact.name,
    }).where(eq(realtorContacts.id, contact.id))
  } else {
    const [created] = await db.insert(realtorContacts).values({
      userId,
      name,
      email: realtorEmail,
      phone: realtorPhone,
      firstReferralAt: now,
      lastReferralAt: now,
      totalReferrals: 1,
    }).returning()
    contact = created
  }

  await logAgentActivity(userId, 'realtor_nurture', 'referral_tracked', {
    realtorName: name,
    realtorEmail,
    propertyAddress,
    totalReferrals: (contact.totalReferrals ?? 0) + 1,
  }, inspectionId)

  // Send thank-you email if enabled
  // Rate-limit check uses the OLD lastReferralAt (before we updated it above)
  // so we know how long since the previous referral, not the current one
  const previousReferralAt = contact ? contact.lastReferralAt : null

  if ((config.autoThankYou as boolean) && realtorEmail) {
    if (previousReferralAt) {
      const daysSinceLast = (Date.now() - new Date(previousReferralAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLast < 7) return // Skip — already sent a thank-you recently
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
    if (!profile) return

    const inspectorName = profile.fullName ?? 'Your Inspector'
    const companyName = profile.companyName ?? inspectorName
    const totalReferrals = (contact.totalReferrals ?? 0) + 1
    const includeStats = (config.includeStats as boolean) ?? true

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: getInspectorFrom(inspectorName, companyName),
        to: realtorEmail,
        subject: `Thanks for the referral — ${escapeHtml(propertyAddress)}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
              <h1 style="color:#60a5fa;font-size:20px;margin:0">${escapeHtml(companyName)}</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
              <h2 style="font-size:20px;margin:0 0 16px">Hi ${escapeHtml(name.split(' ')[0])},</h2>
              <p style="color:#475569;line-height:1.6">Just wanted to say thanks for the referral at <strong>${escapeHtml(propertyAddress)}</strong>. The inspection went smoothly and the report is on its way to your client.</p>
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

      await logAgentActivity(userId, 'realtor_nurture', 'thank_you_sent', {
        realtorName: name,
        realtorEmail,
        propertyAddress,
      }, inspectionId)
    } catch (err) {
      console.error(`[InspectIQ] Realtor thank-you email failed:`, err)
    }
  }
}
