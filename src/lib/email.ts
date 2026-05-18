import { Resend } from 'resend'

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('[InspectIQ] RESEND_API_KEY not configured — email sending disabled')
  }
  return new Resend(apiKey)
}

// Default fallback — used for system emails (trial, welcome, etc.)
// Client-facing emails should use getInspectorFrom() instead
const SYSTEM_FROM = 'InspectIQ <stephanie@useinspectiq.com>'
// APP_URL is imported where needed from @/lib/config
import { APP_URL } from '@/lib/config'

// Build a FROM address using the inspector's name — no InspectIQ branding
export function getInspectorFrom(inspectorName?: string | null, companyName?: string | null): string {
  const name = inspectorName ?? companyName ?? 'Your Inspector'
  // Resend requires a verified domain — send from our domain but display inspector's name
  return `${name} <stephanie@useinspectiq.com>`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    // Personal, lowercase subject — feels like a real email not an automated one
    subject: `your InspectIQ trial is live${firstName ? ', ' + escapeHtml(firstName) : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} 👋</h2>
          <p style="color:#475569;line-height:1.6">Your 14-day trial is active. I built InspectIQ because I got tired of watching inspectors spend 2+ hours writing reports that should take 20 minutes.</p>
          <p style="color:#475569;line-height:1.6">The fastest way to see what it does: create an inspection, add notes on one room, then hit <strong>Generate AI</strong>. That's the moment everything clicks.</p>
          <a href="${APP_URL}/dashboard/inspections/new" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Create Your First Inspection →
          </a>
          <p style="color:#475569;line-height:1.6;margin-top:24px">While you're in there — you can also:</p>
          <ul style="color:#475569;line-height:2;margin:0;padding-left:20px">
            <li>Annotate photos with arrows, boxes & text</li>
            <li>Set your inspection fee and generate a client payment link</li>
            <li>Schedule jobs on the built-in calendar</li>
          </ul>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">Hit reply if anything doesn't work or you have questions — I read every email.<br/>— Stephanie</p>
        </div>
      </div>
    `,
  })
}

// Day 2 — sent if user hasn't completed their first inspection yet.
// Goal: get them to actually try Generate AI before they forget about the trial.
export async function sendActivationEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: `did you try Generate AI yet${firstName ? ', ' + escapeHtml(firstName) : ''}?`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">One thing worth trying today</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} — just checking in. If you haven't had a chance to try InspectIQ yet, here's the one thing I'd want you to see:</p>
          <ol style="color:#475569;line-height:2;margin:0;padding-left:20px">
            <li>Create any inspection (fake address is fine)</li>
            <li>Open a room — type a quick note like "missing shingles SE corner"</li>
            <li>Hit <strong>Generate AI</strong></li>
          </ol>
          <p style="color:#475569;line-height:1.6;margin-top:16px">That's it. The AI turns your note into a full professional narrative in about 5 seconds. Most inspectors say that's the moment they knew it was worth it.</p>
          <a href="${APP_URL}/dashboard/inspections/new" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Try It Now →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie</p>
        </div>
      </div>
    `,
  })
}

export async function sendTrialMidpointEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    // Feels like a personal check-in, not a countdown clock
    subject: `quick check-in on your InspectIQ trial`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} — 7 days left</h2>
          <p style="color:#475569;line-height:1.6">Just wanted to check in. Have you had a chance to run a real inspection through it yet?</p>
          <p style="color:#475569;line-height:1.6">If you have — awesome. If not, the AI narrative generator is the part most inspectors say saves them the most time. Even just trying it on a single room is enough to see what it does.</p>
          <p style="color:#475569;line-height:1.6">After your trial it's <strong>$99/month</strong> — most inspectors make that back on their very first report. And right now the first 50 signups lock in that price forever, even when I raise it.</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Open InspectIQ →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">Reply with any questions — I'm easy to reach.<br/>— Stephanie</p>
        </div>
      </div>
    `,
  })
}

export async function sendTrialExpiringEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: `your InspectIQ trial ends tomorrow`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Trial ends tomorrow ⏰</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} — your trial expires tomorrow. Everything you've created is saved and won't go anywhere.</p>
          <p style="color:#475569;line-height:1.6">If you're on the fence: at $99/month, you make it back on one inspection. And right now you can lock in that price as a founding member — it stays at $99 forever even after I raise it for new signups.</p>
          <p style="color:#475569;line-height:1.6">Only 50 founding member spots available — once they're gone, new signups pay a higher rate.</p>
          <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Subscribe &amp; Lock In $99/mo →
          </a>
          <p style="color:#475569;line-height:1.6;margin-top:16px;font-size:13px">Annual plan also available at $79/mo ($948/year).</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px">Cancel anytime. Questions? Just reply.<br/>— Stephanie</p>
        </div>
      </div>
    `,
  })
}

// Day 5 — share your referral link, get a free month
export async function sendReferralNudgeEmail(to: string, firstName: string, referralCode: string) {
  const referralUrl = `${APP_URL}/auth/signup?ref=${referralCode}`
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: `free month of InspectIQ — just share a link`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Know another inspector?</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} — quick one: if you know another inspector who could use InspectIQ, send them your personal link below.</p>
          <p style="color:#475569;line-height:1.6">When they sign up, <strong>you get a free month ($99 credit)</strong> and they get an extended 30-day trial instead of 14.</p>
          <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;text-align:center">
            <p style="font-size:12px;color:#64748b;margin:0 0 8px">Your referral link</p>
            <a href="${referralUrl}" style="color:#2563eb;font-weight:600;word-break:break-all">${referralUrl}</a>
          </div>
          <p style="color:#475569;line-height:1.6;font-size:13px">Just forward this email or text them the link. No limit on referrals.</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px">— Stephanie</p>
        </div>
      </div>
    `,
  })
}

// Day 10 — personal check-in, offer a call
export async function sendListeningCallEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: `quick question about your experience`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">How's it going so far?</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + escapeHtml(firstName) : ''} — you're about halfway through your trial and I wanted to check in personally.</p>
          <p style="color:#475569;line-height:1.6">I'd love to hear what's working for you and what isn't. No pitch, no demo — just 15 minutes so I can make InspectIQ better for inspectors like you.</p>
          <p style="color:#475569;line-height:1.6"><strong>Hit reply and let me know:</strong></p>
          <ul style="color:#475569;line-height:1.8;padding-left:20px">
            <li>What's been easier than expected?</li>
            <li>What's been harder or confusing?</li>
            <li>Anything you wish it did that it doesn't?</li>
          </ul>
          <p style="color:#475569;line-height:1.6">Or if you'd rather hop on a quick call, just reply with a time that works and I'll send a calendar link.</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px">— Stephanie<br/>Founder, InspectIQ</p>
        </div>
      </div>
    `,
  })
}

export async function sendReportToClient(to: string, clientName: string, inspectorName: string, propertyAddress: string, shareUrl: string) {
  await getResend().emails.send({
    from: getInspectorFrom(inspectorName),
    to,
    subject: `Your home inspection report — ${escapeHtml(propertyAddress)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">Home Inspection Report</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;margin:0 0 8px">Hi ${escapeHtml(clientName)},</h2>
          <p style="color:#475569;line-height:1.6">Your home inspection report for <strong>${escapeHtml(propertyAddress)}</strong> is ready.</p>
          <p style="color:#475569;line-height:1.6">Click the button below to view your full report online. You can also download it as a PDF from the report page.</p>
          <a href="${escapeHtml(shareUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;font-size:16px">
            View Your Report →
          </a>
          <p style="color:#475569;line-height:1.6;margin-top:24px">Prepared by <strong>${escapeHtml(inspectorName)}</strong>.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
            Report delivered via InspectIQ · useinspectiq.com
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendAgreementEmail(to: string, clientName: string, inspectorCompany: string, propertyAddress: string, agreementUrl: string) {
  await getResend().emails.send({
    from: getInspectorFrom(inspectorCompany),
    to,
    subject: `Pre-Inspection Agreement — ${escapeHtml(propertyAddress)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;margin:0 0 8px">Hi ${escapeHtml(clientName)},</h2>
          <p style="color:#475569;line-height:1.6"><strong>${escapeHtml(inspectorCompany)}</strong> has sent you a pre-inspection agreement for the property at <strong>${escapeHtml(propertyAddress)}</strong>.</p>
          <p style="color:#475569;line-height:1.6">Please review and sign the agreement before the inspection begins.</p>
          <a href="${escapeHtml(agreementUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;font-size:16px">
            Review &amp; Sign Agreement →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
            Powered by InspectIQ
          </p>
        </div>
      </div>
    `,
  })
}

// 48-hour follow-up after report delivery — asks if the client has questions
export async function sendFollowUpEmail(
  to: string,
  clientName: string,
  inspectorName: string,
  companyName: string,
  propertyAddress: string,
  inspectorPhone: string | null,
  inspectorEmail: string | null,
  customMessage?: string,
) {
  const contactLines = [
    inspectorPhone ? `Phone: <a href="tel:${escapeHtml(inspectorPhone)}" style="color:#2563eb">${escapeHtml(inspectorPhone)}</a>` : '',
    inspectorEmail ? `Email: <a href="mailto:${escapeHtml(inspectorEmail)}" style="color:#2563eb">${escapeHtml(inspectorEmail)}</a>` : '',
  ].filter(Boolean).join('<br/>')

  const bodyText = customMessage
    ? escapeHtml(customMessage)
    : `I sent over your inspection report for <strong>${escapeHtml(propertyAddress)}</strong> a couple of days ago and just wanted to check in.</p>
          <p style="color:#475569;line-height:1.6">Do you have any questions about the findings? I'm happy to walk through anything in the report or clarify any items your agent flagged.`

  await getResend().emails.send({
    from: getInspectorFrom(inspectorName, companyName),
    to,
    subject: `Quick follow-up on your inspection — ${escapeHtml(propertyAddress)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">${escapeHtml(companyName)}</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;margin:0 0 16px">Hi ${escapeHtml(clientName)},</h2>
          <p style="color:#475569;line-height:1.6">${bodyText}</p>
          ${contactLines ? `<p style="color:#475569;line-height:1.6">${contactLines}</p>` : ''}
          <p style="color:#475569;line-height:1.6;margin-top:8px">Best,<br/><strong>${escapeHtml(inspectorName)}</strong></p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
            Powered by InspectIQ
          </p>
        </div>
      </div>
    `,
  })
}

// Follow-up with AI-generated top findings summary
export async function sendTopFindingsFollowUp(
  to: string,
  clientName: string,
  inspectorName: string,
  companyName: string,
  propertyAddress: string,
  inspectionId: string,
  inspectorPhone: string | null,
  inspectorEmail: string | null,
) {
  // Pull top findings from the inspection
  const { db: database, rooms, inspectionItems } = await import('@/lib/db')
  const { eq, inArray } = await import('drizzle-orm')

  const allRooms = await database.select().from(rooms).where(eq(rooms.inspectionId, inspectionId))
  const roomIds = allRooms.map(r => r.id)
  const allItems = roomIds.length > 0
    ? await database.select().from(inspectionItems).where(inArray(inspectionItems.roomId, roomIds))
    : []

  const criticalItems = allItems.filter(i => i.condition === 'poor')
  const maintenanceItems = allItems.filter(i => i.condition === 'fair')

  // Build a plain-English summary
  const findings: string[] = []
  for (const item of criticalItems.slice(0, 3)) {
    const room = allRooms.find(r => r.id === item.roomId)
    findings.push(`<strong>${escapeHtml(item.name)}</strong> (${escapeHtml(room?.name ?? 'Unknown')}) — needs immediate attention${item.notes ? ': ' + escapeHtml(item.notes) : ''}`)
  }
  for (const item of maintenanceItems.slice(0, 2)) {
    const room = allRooms.find(r => r.id === item.roomId)
    findings.push(`<strong>${escapeHtml(item.name)}</strong> (${escapeHtml(room?.name ?? 'Unknown')}) — maintenance recommended${item.notes ? ': ' + escapeHtml(item.notes) : ''}`)
  }

  const contactLines = [
    inspectorPhone ? `Phone: <a href="tel:${escapeHtml(inspectorPhone)}" style="color:#2563eb">${escapeHtml(inspectorPhone)}</a>` : '',
    inspectorEmail ? `Email: <a href="mailto:${escapeHtml(inspectorEmail)}" style="color:#2563eb">${escapeHtml(inspectorEmail)}</a>` : '',
  ].filter(Boolean).join('<br/>')

  const findingsHtml = findings.length > 0
    ? `<p style="color:#475569;line-height:1.6">Here's a quick recap of the top items from your report:</p>
       <ul style="color:#475569;line-height:2;margin:0;padding-left:20px">${findings.map(f => `<li>${f}</li>`).join('')}</ul>
       <p style="color:#475569;line-height:1.6;margin-top:16px">I'm happy to walk through any of these over the phone or answer questions your agent might have.</p>`
    : `<p style="color:#475569;line-height:1.6">Everything looked good overall. If any questions come up as you review the full report, don't hesitate to reach out.</p>`

  await getResend().emails.send({
    from: getInspectorFrom(inspectorName, companyName),
    to,
    subject: `Top findings from your inspection — ${escapeHtml(propertyAddress)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">${escapeHtml(companyName)}</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;margin:0 0 16px">Hi ${escapeHtml(clientName)},</h2>
          <p style="color:#475569;line-height:1.6">I sent over the full inspection report for <strong>${escapeHtml(propertyAddress)}</strong> and wanted to follow up with a quick summary.</p>
          ${findingsHtml}
          <p style="color:#94a3b8;font-size:11px;font-style:italic;margin-top:16px;padding:12px;background:#f8fafc;border-radius:6px">This is a brief highlight of key items only. Please review your complete inspection report for all findings, recommendations, and details.</p>
          ${contactLines ? `<p style="color:#475569;line-height:1.6">${contactLines}</p>` : ''}
          <p style="color:#475569;line-height:1.6;margin-top:8px">Best,<br/><strong>${escapeHtml(inspectorName)}</strong></p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
            Powered by InspectIQ
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendReferralRewardEmail(to: string, referrerName: string, newUserEmail: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: 'You earned a free month on InspectIQ 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">You earned a free month! 🎉</h2>
          <p style="color:#475569;line-height:1.6">Hey${referrerName ? ' ' + escapeHtml(referrerName) : ''} — <strong>${escapeHtml(newUserEmail)}</strong> just subscribed using your referral link.</p>
          <p style="color:#475569;line-height:1.6">A <strong>$99 credit</strong> has been applied to your Stripe account and will automatically come off your next bill. No action needed.</p>
          <p style="color:#475569;line-height:1.6">Keep sharing your link — every inspector who subscribes earns you another free month.</p>
          <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            View Your Referral Link →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie</p>
        </div>
      </div>
    `,
  })
}

export async function sendReferralNotification(to: string, referrerName: string, newUserEmail: string) {
  await getResend().emails.send({
    from: SYSTEM_FROM,
    to,
    subject: 'Someone just signed up with your InspectIQ referral link! 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Your referral worked! 🎉</h2>
          <p style="color:#475569;line-height:1.6">Hey${referrerName ? ' ' + escapeHtml(referrerName) : ''} — <strong>${escapeHtml(newUserEmail)}</strong> just signed up using your referral link and got a 30-day trial.</p>
          <p style="color:#475569;line-height:1.6">When they subscribe, you'll automatically get a free month ($99 credit) applied to your next bill.</p>
          <p style="color:#475569;line-height:1.6">Keep sharing your link to earn more free months!</p>
          <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            View Your Referral Link →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie</p>
        </div>
      </div>
    `,
  })
}
