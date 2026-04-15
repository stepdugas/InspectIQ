import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}
const FROM = 'InspectIQ <noreply@useinspectiq.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://useinspectiq.com'

export async function sendWelcomeEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Welcome to InspectIQ — your 14-day trial has started',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Welcome${firstName ? ', ' + firstName : ''}! 👋</h2>
          <p style="color:#475569;line-height:1.6">Your 14-day free trial is active. Here's how to get your first report done in under 20 minutes:</p>
          <ol style="color:#475569;line-height:2">
            <li>Go to <strong>Inspections → New Inspection</strong></li>
            <li>Enter the property address and client info</li>
            <li>Rate each room's items and add notes</li>
            <li>Click <strong>Generate All AI</strong> to write the narratives</li>
            <li>Hit <strong>Complete & Export</strong> to get your PDF</li>
          </ol>
          <a href="${APP_URL}/dashboard/inspections/new" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Start Your First Inspection →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">Questions? Just reply to this email.<br/>— Stephanie at InspectIQ</p>
        </div>
      </div>
    `,
  })
}

export async function sendTrialMidpointEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "You have 7 days left in your InspectIQ trial",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">7 days left in your trial</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + firstName : ''} — just a heads up that your free trial ends in 7 days.</p>
          <p style="color:#475569;line-height:1.6">If you haven't tried the AI narrative generator yet, this is the feature that saves inspectors 2+ hours per report. Give it a shot on your next job.</p>
          <p style="color:#475569;line-height:1.6">After your trial, it's <strong>$99/month</strong> for unlimited inspections, reports, and AI narratives. Most inspectors make that back on their first report.</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Open InspectIQ →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie at InspectIQ</p>
        </div>
      </div>
    `,
  })
}

export async function sendTrialExpiringEmail(to: string, firstName: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your InspectIQ trial ends tomorrow",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Trial ends tomorrow ⏰</h2>
          <p style="color:#475569;line-height:1.6">Hey${firstName ? ' ' + firstName : ''} — your free trial expires tomorrow. Your inspections and reports are saved and won't go anywhere.</p>
          <p style="color:#475569;line-height:1.6">Subscribe now to keep access at <strong>$99/month</strong> — cancel anytime.</p>
          <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            Subscribe Now →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie at InspectIQ</p>
        </div>
      </div>
    `,
  })
}

export async function sendReportToClient(to: string, clientName: string, inspectorName: string, propertyAddress: string, shareUrl: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Your home inspection report — ${propertyAddress}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">Home Inspection Report</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;margin:0 0 8px">Hi ${clientName},</h2>
          <p style="color:#475569;line-height:1.6">Your home inspection report for <strong>${propertyAddress}</strong> is ready.</p>
          <p style="color:#475569;line-height:1.6">Click the button below to view your full report online. You can also download it as a PDF from the report page.</p>
          <a href="${shareUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;font-size:16px">
            View Your Report →
          </a>
          <p style="color:#475569;line-height:1.6;margin-top:24px">Prepared by <strong>${inspectorName}</strong>.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
            Report delivered via InspectIQ · useinspectiq.com
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendReferralNotification(to: string, referrerName: string, newUserEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Someone just signed up with your InspectIQ referral link! 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0f172a;padding:32px;border-radius:12px 12px 0 0">
          <h1 style="color:#60a5fa;font-size:20px;margin:0">InspectIQ</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="font-size:22px;margin:0 0 16px">Your referral worked! 🎉</h2>
          <p style="color:#475569;line-height:1.6">Hey${referrerName ? ' ' + referrerName : ''} — <strong>${newUserEmail}</strong> just signed up using your referral link and got a 30-day trial.</p>
          <p style="color:#475569;line-height:1.6">When they subscribe, you'll get a free month added to your account. We'll reach out when that happens.</p>
          <p style="color:#475569;line-height:1.6">Keep sharing your link to earn more free months!</p>
          <a href="${APP_URL}/dashboard/settings" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
            View Your Referral Link →
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px">— Stephanie at InspectIQ</p>
        </div>
      </div>
    `,
  })
}
